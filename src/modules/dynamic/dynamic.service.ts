import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { LoggerService } from '@/core/logger/logger.service';
import { MetadataService } from '@/modules/metadata/metadata.service';
import {
  DynamicRecordDto,
  CreateDynamicRecordDto,
  PaginatedResponseDto,
} from '@/common/dtos/dynamic.dto';

/**
 * Service for dynamic CRUD operations on any entity
 * Mirrors the .NET DynamicEntityService
 */
@Injectable()
export class DynamicService {
  constructor(
    private prisma: PrismaService,
    private metadataService: MetadataService,
    private logger: LoggerService,
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

    // Get entity definition
    const entity = await this.metadataService.getEntityByName(entityName);

    try {
      const skip = (page - 1) * pageSize;

      // Get records
      const [records, total] = await Promise.all([
        this.prisma.dynamicRecord.findMany({
          where: { entityId: entity.id, isDeleted: false },
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.dynamicRecord.count({
          where: { entityId: entity.id, isDeleted: false },
        }),
      ]);

      const parsedRecords = records.map((r) => ({
        ...r,
        data: JSON.parse(r.data),
      }));

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

    const entity = await this.metadataService.getEntityByName(entityName);

    const record = await this.prisma.dynamicRecord.findFirst({
      where: { id: recordId, entityId: entity.id, isDeleted: false },
    });

    if (!record) {
      throw new NotFoundException(
        `Record ${recordId} not found in ${entityName}`,
      );
    }

    return {
      ...record,
      data: JSON.parse(record.data),
    };
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

    const entity = await this.metadataService.getEntityByName(entityName);

    // Validate fields against entity metadata
    await this.validateRecordData(entity.id, dto);

    try {
      const record = await this.prisma.dynamicRecord.create({
        data: {
          entityId: entity.id,
          data: JSON.stringify(dto),
        },
      });

      this.logger.log(
        `✓ Record created in ${entityName}: ${record.id}`,
        'DynamicService',
      );

      return {
        ...record,
        data: JSON.parse(record.data),
      };
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

    const entity = await this.metadataService.getEntityByName(entityName);

    // Get existing record
    const existing = await this.getRecordById(entityName, recordId);

    // Validate updated fields
    const mergedData = { ...existing.data, ...dto };
    await this.validateRecordData(entity.id, mergedData);

    try {
      const record = await this.prisma.dynamicRecord.update({
        where: { id: recordId },
        data: {
          data: JSON.stringify(mergedData),
        },
      });

      this.logger.log(
        `✓ Record updated in ${entityName}: ${record.id}`,
        'DynamicService',
      );

      return {
        ...record,
        data: JSON.parse(record.data),
      };
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

    const entity = await this.metadataService.getEntityByName(entityName);

    const record = await this.prisma.dynamicRecord.findFirst({
      where: { id: recordId, entityId: entity.id },
    });

    if (!record) {
      throw new NotFoundException(
        `Record ${recordId} not found in ${entityName}`,
      );
    }

    try {
      await this.prisma.dynamicRecord.update({
        where: { id: recordId },
        data: { isDeleted: true },
      });

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
    entityId: number,
    data: Record<string, any>,
  ): Promise<void> {
    const fields = await this.prisma.fieldDefinition.findMany({
      where: { entityId, isDeleted: false },
    });

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
          const options = JSON.parse(field.options);
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
    return this.metadataService.getEntityByName(entityName);
  }
}
