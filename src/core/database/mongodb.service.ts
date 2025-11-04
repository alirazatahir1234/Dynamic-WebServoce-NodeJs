import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { MongoClient, Db, Collection } from 'mongodb';
import { LoggerService } from '@/core/logger/logger.service';

/**
 * MongoDB Service
 * Manages MongoDB connection and provides basic operations
 */
@Injectable()
export class MongoDBService implements OnModuleInit, OnModuleDestroy {
  private client: MongoClient;
  private db: Db;
  private isConnected = false;

  constructor(private readonly logger: LoggerService) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  /**
   * Connect to MongoDB
   */
  async connect(): Promise<void> {
    try {
      const url = process.env.MONGODB_URL || 'mongodb://localhost:27017';
      const dbName = process.env.MONGODB_DATABASE || 'dynamic_db';

      this.client = new MongoClient(url);
      await this.client.connect();
      this.db = this.client.db(dbName);
      this.isConnected = true;

      this.logger.log(`Connected to MongoDB: ${url}/${dbName}`, 'MongoDBService');
    } catch (error) {
      this.logger.error('Failed to connect to MongoDB', error, 'MongoDBService');
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.close();
      this.isConnected = false;
      this.logger.log('Disconnected from MongoDB', 'MongoDBService');
    }
  }

  /**
   * Get database instance
   */
  getDatabase(): Db {
    if (!this.db) {
      throw new Error('MongoDB not connected');
    }
    return this.db;
  }

  /**
   * Get collection
   */
  getCollection<T = any>(collectionName: string): Collection<T> {
    return this.db.collection<T>(collectionName);
  }

  /**
   * Check connection status
   */
  isReady(): boolean {
    return this.isConnected && !!this.db;
  }
}
