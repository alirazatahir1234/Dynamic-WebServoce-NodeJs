import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { LoggerService } from '@/core/logger/logger.service';
import { MetadataService } from '@/modules/metadata/metadata.service';
import {
  DynamicRecordDto,
  CreateDynamicRecordDto,
  PaginatedResponseDto,
} from '@/common/dtos/dynamic.dto';
import { FieldDefinitionDto } from '@/common/dtos/metadata.dto';
import { DynamicMetadataReader } from './engine/metadata-reader.service';
import { DynamicQueryBuilder } from './engine/query-builder.service';
import { DynamicQueryExecutor } from './engine/query-executor.service';
import { DynamicEntityContext } from './engine/query.types';

/**
 * Service for dynamic CRUD operations on any entity
 * Mirrors the .NET DynamicEntityService
 */
@Injectable()
export class DynamicService {
  constructor(
    private readonly metadataReader: DynamicMetadataReader,
    private readonly queryBuilder: DynamicQueryBuilder,
    private readonly queryExecutor: DynamicQueryExecutor,
    private readonly metadataService: MetadataService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Get all records for an entity (with pagination)
   */
  async getRecords(
    entityName: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<PaginatedResponseDto<DynamicRecordDto>> {
    this.logger.debug(
      `Fetching records for entity: ${entityName}, page: ${page}`,
      'DynamicService',
    );
    const context = await this.metadataReader.getEntityContext(entityName);

    try {
      const [records, total] = await Promise.all([
        this.queryExecutor.execute<any[]>(
          this.queryBuilder.buildFindMany(context, { page, pageSize }),
        ),
        this.queryExecutor.execute<number>(
          this.queryBuilder.buildCount(context),
        ),
      ]);

      const parsedRecords = records.map((record) =>
        this.deserializeRecord(record),
      );

      const totalPages = Math.ceil(total / pageSize);

      this.logger.log(
        `✓ Retrieved ${records.length} records from ${entityName}`,
        'DynamicService',
      );

      return {
        data: parsedRecords,
        total,
        page,
        pageSize,
        totalPages,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching records from ${entityName}`,
        error.message,
        'DynamicService',
      );
      throw error;
    }
  }

  /**
   * Get single record by ID
   */
  async getRecordById(
    entityName: string,
    recordId: string,
  ): Promise<DynamicRecordDto> {
    this.logger.debug(
      `Fetching record ${recordId} from ${entityName}`,
      'DynamicService',
    );

    const context = await this.metadataReader.getEntityContext(entityName);

    const record = await this.queryExecutor.execute<any | null>(
      this.queryBuilder.buildFindOne(context, recordId),
    );

    if (!record) {
      throw new NotFoundException(
        `Record ${recordId} not found in ${entityName}`,
      );
    }

    return this.deserializeRecord(record);
  }

  /**
   * Create new record
   */
  async createRecord(
    entityName: string,
    dto: CreateDynamicRecordDto,
  ): Promise<DynamicRecordDto> {
    this.logger.debug(
      `Creating record in ${entityName}`,
      'DynamicService',
    );

    const context = await this.metadataReader.getEntityContext(entityName);

    // Validate fields against entity metadata
    await this.validateRecordData(context, dto);

    try {
      const record = await this.queryExecutor.execute<any>(
        this.queryBuilder.buildCreate(context, dto),
      );

      this.logger.log(
        `✓ Record created in ${entityName}: ${record.id}`,
        'DynamicService',
      );

      return this.deserializeRecord(record);
    } catch (error) {
      this.logger.error(
        `Error creating record in ${entityName}`,
        error.message,
        'DynamicService',
      );
      throw error;
    }
  }

  /**
   * Update record
   */
  async updateRecord(
    entityName: string,
    recordId: string,
    dto: Partial<CreateDynamicRecordDto>,
  ): Promise<DynamicRecordDto> {
    this.logger.debug(
      `Updating record ${recordId} in ${entityName}`,
      'DynamicService',
    );

    const context = await this.metadataReader.getEntityContext(entityName);

    // Get existing record
    const existing = await this.getRecordById(entityName, recordId);

    // Validate updated fields
    const mergedData = { ...existing.data, ...dto };
    await this.validateRecordData(context, mergedData);

    try {
      const record = await this.queryExecutor.execute<any>(
        this.queryBuilder.buildUpdate(recordId, mergedData),
      );

      this.logger.log(
        `✓ Record updated in ${entityName}: ${record.id}`,
        'DynamicService',
      );

      return this.deserializeRecord(record);
    } catch (error) {
      this.logger.error(
        `Error updating record in ${entityName}`,
        error.message,
        'DynamicService',
      );
      throw error;
    }
  }

  /**
   * Delete record (soft delete)
   */
  async deleteRecord(entityName: string, recordId: string): Promise<void> {
    this.logger.debug(
      `Deleting record ${recordId} from ${entityName}`,
      'DynamicService',
    );

    await this.getRecordById(entityName, recordId);

    try {
      await this.queryExecutor.execute(
        this.queryBuilder.buildSoftDelete(recordId),
      );

      this.logger.log(
        `✓ Record deleted from ${entityName}: ${recordId}`,
        'DynamicService',
      );
    } catch (error) {
      this.logger.error(
        `Error deleting record from ${entityName}`,
        error.message,
        'DynamicService',
      );
      throw error;
    }
  }

  /**
   * Validate record data against field definitions
   */
  private async validateRecordData(
    context: DynamicEntityContext,
    data: Record<string, any>,
  ): Promise<void> {
    const fields = context.fields;

    for (const field of fields) {
      const value = data[field.fieldName];

      // Check required fields
      if (field.isRequired && (value === null || value === undefined || value === '')) {
        throw new BadRequestException(
          `Field '${field.displayName}' is required`,
        );
      }

      // Skip validation if value is not provided and not required
      if (value === null || value === undefined || value === '') {
        continue;
      }

      // Validate string length
      if (field.fieldType === 'string') {
        if (field.maxLength && value.length > field.maxLength) {
          throw new BadRequestException(
            `Field '${field.displayName}' exceeds maximum length of ${field.maxLength}`,
          );
        }
        if (field.minLength && value.length < field.minLength) {
          throw new BadRequestException(
            `Field '${field.displayName}' is below minimum length of ${field.minLength}`,
          );
        }

        // Validate pattern
        if (field.pattern) {
          const regex = new RegExp(field.pattern);
          if (!regex.test(value)) {
            throw new BadRequestException(
              `Field '${field.displayName}' format is invalid`,
            );
          }
        }
      }

      // Validate field type
      if (field.fieldType === 'integer' && !Number.isInteger(value)) {
        throw new BadRequestException(
          `Field '${field.displayName}' must be an integer`,
        );
      }

      if (field.fieldType === 'decimal' && isNaN(parseFloat(value))) {
        throw new BadRequestException(
          `Field '${field.displayName}' must be a decimal number`,
        );
      }

      if (field.fieldType === 'boolean' && typeof value !== 'boolean') {
        throw new BadRequestException(
          `Field '${field.displayName}' must be a boolean`,
        );
      }

      if (field.fieldType === 'datetime') {
        if (isNaN(Date.parse(value))) {
          throw new BadRequestException(
            `Field '${field.displayName}' must be a valid date`,
          );
        }
      }

      // Validate enum options
      if (field.fieldType === 'enum' && field.options) {
        try {
          const options = this.safeParseJson<any[]>(field.options) ?? [];
          const validValues = options.map((o: any) => o.value);
          if (!validValues.includes(value)) {
            throw new BadRequestException(
              `Field '${field.displayName}' has invalid value`,
            );
          }
        } catch (e) {
          this.logger.warn(
            `Failed to parse enum options for field ${field.fieldName}`,
            'DynamicService',
          );
        }
      }
    }
  }

  /**
   * Get entities list
   */
  async getEntities(): Promise<any[]> {
    this.logger.debug('Fetching all entities', 'DynamicService');
    return this.metadataService.getAllEntities();
  }

  /**
   * Get entity metadata/fields
   */
  async getEntityMetadata(entityName: string): Promise<any> {
    this.logger.debug(`Fetching metadata for ${entityName}`, 'DynamicService');
    const context = await this.metadataReader.getEntityContext(entityName);
    return context.entity;
  }

  private deserializeRecord(record: any): DynamicRecordDto {
    return {
      ...record,
      data: this.safeParseJson<Record<string, unknown>>(record.data) ?? {},
    };
  }

  private safeParseJson<T>(value: string | null | undefined): T | null {
    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.warn(
        'Failed to parse JSON payload for dynamic record',
        'DynamicService',
      );
      return null;
    }
  }
}
