import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for lookup/dropdown values
 */
export class LookupValueDto {
  @ApiProperty({
    example: 1,
    description: 'The ID value',
  })
  id: number | string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Display text for dropdown',
  })
  displayText: string;
}

/**
 * DTO for lookup response
 */
export class LookupResponseDto {
  @ApiProperty({
    example: 'Customer',
    description: 'Entity name',
  })
  entityName: string;

  @ApiProperty({
    type: () => [LookupValueDto],
    description: 'Array of lookup values',
  })
  values: LookupValueDto[];

  @ApiProperty({
    example: 15,
    description: 'Total count of values',
  })
  count: number;
}

/**
 * DTO for creating/updating dynamic records
 */
export class CreateDynamicRecordDto {
  [key: string]: any;
}

/**
 * DTO for dynamic record response
 */
export class DynamicRecordDto {
  @ApiProperty({
    example: 'clhxyz123abc',
    description: 'Record ID',
  })
  id: string;

  @ApiProperty({
    example: 1,
    description: 'Entity ID',
  })
  entityId: number;

  @ApiProperty({
    example: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
    description: 'Record data as object',
  })
  data: Record<string, any>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

/**
 * DTO for paginated response
 */
export class PaginatedResponseDto<T> {
  @ApiProperty()
  data: T[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty()
  totalPages: number;
}

/**
 * DTO for health check response
 */
export class HealthCheckResponseDto {
  @ApiProperty()
  status: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  timestamp: Date;

  @ApiProperty()
  uptime: number;

  @ApiProperty()
  database: string;
}
