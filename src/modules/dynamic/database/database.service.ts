import { Injectable, Inject, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@/core/logger/logger.service';
import { IDatabaseAdapter } from './database.adapter';
import { MySQLAdapter } from './mysql.adapter';
import { MongoDBAdapter } from './mongodb.adapter';
import { DynamicRecordDto, CreateDynamicRecordDto } from '@/common/dtos/dynamic.dto';

/**
 * Database Service
 * Manages multiple database adapters and routes operations based on configuration
 */
@Injectable()
export class DatabaseService {
  private adapters: Map<string, IDatabaseAdapter> = new Map();
  private defaultAdapter: IDatabaseAdapter;
  private databaseRouting: Map<string, string> = new Map(); // entityName => databaseType

  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly mysqlAdapter: MySQLAdapter,
    @Optional() private readonly mongodbAdapter: MongoDBAdapter,
  ) {
    this.initializeAdapters();
    this.loadDatabaseRouting();
  }

  /**
   * Initialize available database adapters
   */
  private initializeAdapters(): void {
    // Always register MySQL adapter
    this.adapters.set('mysql', this.mysqlAdapter);

    // Register MongoDB adapter if available
    if (this.mongodbAdapter) {
      this.adapters.set('mongodb', this.mongodbAdapter);
      this.logger.log('MongoDB adapter registered', 'DatabaseService');
    }

    // Set default adapter
    const defaultDb = this.config.get<string>('DATABASE_TYPE', 'mysql');
    this.defaultAdapter = this.adapters.get(defaultDb) || this.mysqlAdapter;

    this.logger.log(
      `Database service initialized with default: ${this.defaultAdapter.getType()}`,
      'DatabaseService',
    );
  }

  /**
   * Load entity-specific database routing from configuration
   */
  private loadDatabaseRouting(): void {
    // Example: ROUTING_CUSTOMER=mongodb,ROUTING_ORDER=mongodb
    Object.entries(process.env).forEach(([key, value]) => {
      if (key.startsWith('ROUTING_')) {
        const entityName = key.replace('ROUTING_', '').toLowerCase();
        this.databaseRouting.set(entityName, value as string);
        this.logger.debug(
          `Entity ${entityName} routed to database: ${value}`,
          'DatabaseService',
        );
      }
    });
  }

  /**
   * Get the appropriate adapter for an entity
   */
  private getAdapterForEntity(entityName: string): IDatabaseAdapter {
    const dbType = this.databaseRouting.get(entityName.toLowerCase());
    if (dbType && this.adapters.has(dbType)) {
      return this.adapters.get(dbType)!;
    }
    return this.defaultAdapter;
  }

  /**
   * Create a new record
   */
  async create(
    entityName: string,
    entityId: number,
    payload: CreateDynamicRecordDto,
  ): Promise<DynamicRecordDto> {
    const adapter = this.getAdapterForEntity(entityName);
    this.logger.debug(
      `Creating record in ${adapter.getType()} for entity: ${entityName}`,
      'DatabaseService',
    );
    return adapter.create(entityId, payload);
  }

  /**
   * Find many records with pagination
   */
  async findMany(
    entityName: string,
    entityId: number,
    options?: {
      page?: number;
      pageSize?: number;
      filters?: { [key: string]: any };
    },
  ): Promise<{ records: DynamicRecordDto[]; total: number }> {
    const adapter = this.getAdapterForEntity(entityName);
    return adapter.findMany(entityId, options);
  }

  /**
   * Find a single record by ID
   */
  async findOne(
    entityName: string,
    entityId: number,
    recordId: string,
  ): Promise<DynamicRecordDto | null> {
    const adapter = this.getAdapterForEntity(entityName);
    return adapter.findOne(entityId, recordId);
  }

  /**
   * Count records for an entity
   */
  async count(entityName: string, entityId: number): Promise<number> {
    const adapter = this.getAdapterForEntity(entityName);
    return adapter.count(entityId);
  }

  /**
   * Update a record
   */
  async update(
    entityName: string,
    recordId: string,
    payload: { [key: string]: any },
  ): Promise<DynamicRecordDto> {
    const adapter = this.getAdapterForEntity(entityName);
    this.logger.debug(
      `Updating record in ${adapter.getType()} for entity: ${entityName}`,
      'DatabaseService',
    );
    return adapter.update(recordId, payload);
  }

  /**
   * Soft delete a record
   */
  async softDelete(entityName: string, recordId: string): Promise<void> {
    const adapter = this.getAdapterForEntity(entityName);
    this.logger.debug(
      `Soft deleting record in ${adapter.getType()} for entity: ${entityName}`,
      'DatabaseService',
    );
    return adapter.softDelete(recordId);
  }

  /**
   * Hard delete a record
   */
  async hardDelete(entityName: string, recordId: string): Promise<void> {
    const adapter = this.getAdapterForEntity(entityName);
    return adapter.hardDelete(recordId);
  }

  /**
   * Get health status of all adapters
   */
  async getHealth(): Promise<{ [dbType: string]: boolean }> {
    const health: { [dbType: string]: boolean } = {};

    for (const [dbType, adapter] of this.adapters) {
      health[dbType] = await adapter.healthCheck();
    }

    return health;
  }

  /**
   * Get routing information for an entity
   */
  getEntityRouting(entityName: string): { database: string; adapter: string } {
    const adapter = this.getAdapterForEntity(entityName);
    return {
      database: adapter.getType(),
      adapter: adapter.constructor.name,
    };
  }

  /**
   * Get all registered adapters
   */
  getAvailableAdapters(): string[] {
    return Array.from(this.adapters.keys());
  }
}
