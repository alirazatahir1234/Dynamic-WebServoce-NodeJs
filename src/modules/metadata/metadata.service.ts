import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { LoggerService } from '@/core/logger/logger.service';
import {
  CreateEntityDefinitionDto,
  CreateFieldDefinitionDto,
  EntityDefinitionDto,
  FieldDefinitionDto,
} from '@/common/dtos/metadata.dto';

/**
 * Service for managing entity and field definitions
 * Mirrors the .NET MetadataService
 */
@Injectable()
export class MetadataService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
  ) {}

  /**
   * Get all entity definitions
   */
  async getAllEntities(): Promise<EntityDefinitionDto[]> {
    this.logger.debug('Fetching all entities', 'MetadataService');
    try {
      const entities = await this.prisma.entityDefinition.findMany({
        where: { isDeleted: false },
        include: {
          fields: {
            where: { isDeleted: false },
            orderBy: { displayOrder: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      this.logger.log(`✓ Retrieved ${entities.length} entities`, 'MetadataService');
      return entities;
    } catch (error) {
      this.logger.error(
        'Error fetching entities',
        error.message,
        'MetadataService',
      );
      throw error;
    }
  }

  /**
   * Get entity by ID
   */
  async getEntityById(id: number): Promise<EntityDefinitionDto> {
    this.logger.debug(`Fetching entity ${id}`, 'MetadataService');
    const entity = await this.prisma.entityDefinition.findFirst({
      where: { id, isDeleted: false },
      include: {
        fields: {
          where: { isDeleted: false },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!entity) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }

    return entity;
  }

  /**
   * Get entity by name
   */
  async getEntityByName(entityName: string): Promise<EntityDefinitionDto> {
    this.logger.debug(`Fetching entity by name: ${entityName}`, 'MetadataService');
    const entity = await this.prisma.entityDefinition.findFirst({
      where: { entityName, isDeleted: false },
      include: {
        fields: {
          where: { isDeleted: false },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!entity) {
      throw new NotFoundException(`Entity '${entityName}' not found`);
    }

    return entity;
  }

  /**
   * Create new entity definition
   */
  async createEntity(
    dto: CreateEntityDefinitionDto,
  ): Promise<EntityDefinitionDto> {
    this.logger.debug(`Creating entity: ${dto.entityName}`, 'MetadataService');

    // Check if entity already exists
    const existing = await this.prisma.entityDefinition.findUnique({
      where: { entityName: dto.entityName },
    });

    if (existing && !existing.isDeleted) {
      throw new ConflictException(
        `Entity '${dto.entityName}' already exists`,
      );
    }

    try {
      const entity = await this.prisma.entityDefinition.create({
        data: {
          entityName: dto.entityName,
          displayName: dto.displayName,
          tableName: dto.tableName || dto.entityName,
          description: dto.description,
        },
        include: { fields: true },
      });

      this.logger.log(
        `✓ Entity created: ${entity.entityName}`,
        'MetadataService',
      );
      return entity;
    } catch (error) {
      this.logger.error(
        'Error creating entity',
        error.message,
        'MetadataService',
      );
      throw error;
    }
  }

  /**
   * Update entity definition
   */
  async updateEntity(
    id: number,
    dto: Partial<CreateEntityDefinitionDto>,
  ): Promise<EntityDefinitionDto> {
    this.logger.debug(`Updating entity ${id}`, 'MetadataService');

    const entity = await this.getEntityById(id);

    // Check if new name conflicts with another entity
    if (dto.entityName && dto.entityName !== entity.entityName) {
      const existing = await this.prisma.entityDefinition.findUnique({
        where: { entityName: dto.entityName },
      });
      if (existing && !existing.isDeleted) {
        throw new ConflictException(
          `Entity '${dto.entityName}' already exists`,
        );
      }
    }

    try {
      const updated = await this.prisma.entityDefinition.update({
        where: { id },
        data: {
          ...(dto.entityName && { entityName: dto.entityName }),
          ...(dto.displayName && { displayName: dto.displayName }),
          ...(dto.tableName && { tableName: dto.tableName }),
          ...(dto.description !== undefined && { description: dto.description }),
        },
        include: {
          fields: {
            where: { isDeleted: false },
            orderBy: { displayOrder: 'asc' },
          },
        },
      });

      this.logger.log(`✓ Entity updated: ${updated.entityName}`, 'MetadataService');
      return updated;
    } catch (error) {
      this.logger.error(
        'Error updating entity',
        error.message,
        'MetadataService',
      );
      throw error;
    }
  }

  /**
   * Soft delete entity (mark as deleted)
   */
  async deleteEntity(id: number): Promise<void> {
    this.logger.debug(`Deleting entity ${id}`, 'MetadataService');

    const entity = await this.getEntityById(id);

    try {
      await this.prisma.entityDefinition.update({
        where: { id },
        data: { isDeleted: true },
      });

      this.logger.log(`✓ Entity deleted: ${entity.entityName}`, 'MetadataService');
    } catch (error) {
      this.logger.error(
        'Error deleting entity',
        error.message,
        'MetadataService',
      );
      throw error;
    }
  }

  /**
   * Get fields for an entity
   */
  async getEntityFields(entityId: number): Promise<FieldDefinitionDto[]> {
    this.logger.debug(`Fetching fields for entity ${entityId}`, 'MetadataService');

    // Verify entity exists
    await this.getEntityById(entityId);

    const fields = await this.prisma.fieldDefinition.findMany({
      where: { entityId, isDeleted: false },
      orderBy: { displayOrder: 'asc' },
    });

    return fields;
  }

  /**
   * Create field definition
   */
  async createField(
    dto: CreateFieldDefinitionDto,
  ): Promise<FieldDefinitionDto> {
    this.logger.debug(
      `Creating field: ${dto.fieldName} for entity ${dto.entityId}`,
      'MetadataService',
    );

    // Verify entity exists
    await this.getEntityById(dto.entityId);

    // Check if field already exists for this entity
    const existing = await this.prisma.fieldDefinition.findFirst({
      where: { entityId: dto.entityId, fieldName: dto.fieldName },
    });

    if (existing && !existing.isDeleted) {
      throw new ConflictException(
        `Field '${dto.fieldName}' already exists in this entity`,
      );
    }

    try {
      const field = await this.prisma.fieldDefinition.create({
        data: {
          entityId: dto.entityId,
          fieldName: dto.fieldName,
          displayName: dto.displayName,
          fieldType: dto.fieldType,
          isRequired: dto.isRequired || false,
          isUnique: dto.isUnique || false,
          maxLength: dto.maxLength,
          minLength: dto.minLength,
          pattern: dto.pattern,
          defaultValue: dto.defaultValue,
          options: dto.options,
          displayOrder: dto.displayOrder || 0,
        },
      });

      this.logger.log(`✓ Field created: ${field.fieldName}`, 'MetadataService');
      return field;
    } catch (error) {
      this.logger.error(
        'Error creating field',
        error.message,
        'MetadataService',
      );
      throw error;
    }
  }

  /**
   * Update field definition
   */
  async updateField(
    id: number,
    dto: Partial<CreateFieldDefinitionDto>,
  ): Promise<FieldDefinitionDto> {
    this.logger.debug(`Updating field ${id}`, 'MetadataService');

    const field = await this.prisma.fieldDefinition.findUnique({
      where: { id },
    });

    if (!field || field.isDeleted) {
      throw new NotFoundException(`Field with ID ${id} not found`);
    }

    try {
      const updated = await this.prisma.fieldDefinition.update({
        where: { id },
        data: {
          ...(dto.displayName && { displayName: dto.displayName }),
          ...(dto.fieldType && { fieldType: dto.fieldType }),
          ...(dto.isRequired !== undefined && { isRequired: dto.isRequired }),
          ...(dto.isUnique !== undefined && { isUnique: dto.isUnique }),
          ...(dto.maxLength !== undefined && { maxLength: dto.maxLength }),
          ...(dto.minLength !== undefined && { minLength: dto.minLength }),
          ...(dto.pattern !== undefined && { pattern: dto.pattern }),
          ...(dto.defaultValue !== undefined && { defaultValue: dto.defaultValue }),
          ...(dto.options !== undefined && { options: dto.options }),
          ...(dto.displayOrder !== undefined && { displayOrder: dto.displayOrder }),
        },
      });

      this.logger.log(`✓ Field updated: ${updated.fieldName}`, 'MetadataService');
      return updated;
    } catch (error) {
      this.logger.error(
        'Error updating field',
        error.message,
        'MetadataService',
      );
      throw error;
    }
  }

  /**
   * Soft delete field
   */
  async deleteField(id: number): Promise<void> {
    this.logger.debug(`Deleting field ${id}`, 'MetadataService');

    const field = await this.prisma.fieldDefinition.findUnique({
      where: { id },
    });

    if (!field || field.isDeleted) {
      throw new NotFoundException(`Field with ID ${id} not found`);
    }

    try {
      await this.prisma.fieldDefinition.update({
        where: { id },
        data: { isDeleted: true },
      });

      this.logger.log(`✓ Field deleted: ${field.fieldName}`, 'MetadataService');
    } catch (error) {
      this.logger.error(
        'Error deleting field',
        error.message,
        'MetadataService',
      );
      throw error;
    }
  }
}
