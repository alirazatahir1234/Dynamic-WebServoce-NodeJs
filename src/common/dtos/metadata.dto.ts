import { IsString, IsOptional, MaxLength, MinLength, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating or updating an entity definition
 */
export class CreateEntityDefinitionDto {
  @ApiProperty({
    example: 'Customer',
    description: 'Unique entity name (will be used as table name)',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  entityName: string;

  @ApiProperty({
    example: 'Customers',
    description: 'Display-friendly name for UI',
  })
  @IsString()
  @MaxLength(255)
  displayName: string;

  @ApiProperty({
    example: 'Customers',
    description: 'Actual table name in database',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  tableName?: string;

  @ApiProperty({
    example: 'Customer management records',
    description: 'Description of the entity',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}

/**
 * DTO for entity definition response
 */
export class EntityDefinitionDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  entityName: string;

  @ApiProperty()
  displayName: string;

  @ApiProperty()
  tableName: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  isDeleted: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: () => [FieldDefinitionDto] })
  fields?: FieldDefinitionDto[];
}

/**
 * DTO for creating or updating a field definition
 */
export class CreateFieldDefinitionDto {
  @ApiProperty({
    example: 1,
    description: 'Entity ID this field belongs to',
  })
  @IsNumber()
  entityId: number;

  @ApiProperty({
    example: 'firstName',
    description: 'Field name in database',
  })
  @IsString()
  @MaxLength(255)
  fieldName: string;

  @ApiProperty({
    example: 'First Name',
    description: 'Display name for UI',
  })
  @IsString()
  @MaxLength(255)
  displayName: string;

  @ApiProperty({
    example: 'string',
    description: 'Field type: string, integer, decimal, datetime, boolean, enum',
    enum: ['string', 'integer', 'decimal', 'datetime', 'boolean', 'enum'],
  })
  @IsString()
  fieldType: string;

  @ApiProperty({
    example: true,
    description: 'Whether field is required',
    default: false,
  })
  @IsOptional()
  isRequired?: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether field values must be unique',
    default: false,
  })
  @IsOptional()
  isUnique?: boolean;

  @ApiProperty({
    example: 100,
    description: 'Maximum string length',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  maxLength?: number;

  @ApiProperty({
    example: 5,
    description: 'Minimum string length',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  minLength?: number;

  @ApiProperty({
    example: '^[a-zA-Z0-9]*$',
    description: 'Regex pattern for validation',
    required: false,
  })
  @IsOptional()
  @IsString()
  pattern?: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Default value for field',
    required: false,
  })
  @IsOptional()
  @IsString()
  defaultValue?: string;

  @ApiProperty({
    example: '[{"value": "active", "label": "Active"}, {"value": "inactive", "label": "Inactive"}]',
    description: 'JSON options for enum type',
    required: false,
  })
  @IsOptional()
  @IsString()
  options?: string;

  @ApiProperty({
    example: 1,
    description: 'Order to display in UI',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;
}

/**
 * DTO for field definition response
 */
export class FieldDefinitionDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  entityId: number;

  @ApiProperty()
  fieldName: string;

  @ApiProperty()
  displayName: string;

  @ApiProperty()
  fieldType: string;

  @ApiProperty()
  isRequired: boolean;

  @ApiProperty()
  isUnique: boolean;

  @ApiProperty()
  maxLength: number;

  @ApiProperty()
  minLength: number;

  @ApiProperty()
  pattern: string;

  @ApiProperty()
  defaultValue: string;

  @ApiProperty()
  options: string;

  @ApiProperty()
  displayOrder: number;

  @ApiProperty()
  isDeleted: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

/**
 * DTO for bulk operations response
 */
export class BulkOperationResultDto {
  @ApiProperty()
  success: number;

  @ApiProperty()
  failed: number;

  @ApiProperty()
  errors: string[];
}
