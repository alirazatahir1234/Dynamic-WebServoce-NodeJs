import { DynamicRecordDto, CreateDynamicRecordDto } from '@/common/dtos/dynamic.dto';

/**
 * Database Adapter Interface
 * Defines contract for database operations across different backends
 */
export interface IDatabaseAdapter {
  /**
   * Create a new record
   */
  create(entityId: number, payload: CreateDynamicRecordDto): Promise<DynamicRecordDto>;

  /**
   * Find many records with pagination
   */
  findMany(
    entityId: number,
    options?: {
      page?: number;
      pageSize?: number;
      filters?: { [key: string]: any };
    },
  ): Promise<{ records: DynamicRecordDto[]; total: number }>;

  /**
   * Find a single record by ID
   */
  findOne(entityId: number, recordId: string): Promise<DynamicRecordDto | null>;

  /**
   * Count records for an entity
   */
  count(entityId: number, filters?: { [key: string]: any }): Promise<number>;

  /**
   * Update a record
   */
  update(recordId: string, payload: { [key: string]: any }): Promise<DynamicRecordDto>;

  /**
   * Soft delete a record
   */
  softDelete(recordId: string): Promise<void>;

  /**
   * Hard delete a record
   */
  hardDelete(recordId: string): Promise<void>;

  /**
   * Get database type
   */
  getType(): string;

  /**
   * Health check
   */
  healthCheck(): Promise<boolean>;
}

/**
 * Query Options
 */
export interface QueryOptions {
  page?: number;
  pageSize?: number;
  filters?: { [key: string]: any };
  sort?: { [key: string]: 1 | -1 };
}

/**
 * Stored Record interface for internal use
 */
export interface StoredRecord {
  id: string;
  entityId: number;
  data: any;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}
