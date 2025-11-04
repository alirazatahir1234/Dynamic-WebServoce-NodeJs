import { Injectable } from '@nestjs/common';
import { MongoDBService } from '@/core/database/mongodb.service';
import { LoggerService } from '@/core/logger/logger.service';
import { IDatabaseAdapter } from './database.adapter';
import { DynamicRecordDto, CreateDynamicRecordDto } from '@/common/dtos/dynamic.dto';
import { ObjectId } from 'mongodb';

/**
 * MongoDB Database Adapter
 * Implementation of IDatabaseAdapter for MongoDB
 */
@Injectable()
export class MongoDBAdapter implements IDatabaseAdapter {
  constructor(
    private readonly mongoDb: MongoDBService,
    private readonly logger: LoggerService,
  ) {}

  async create(entityId: number, payload: CreateDynamicRecordDto): Promise<DynamicRecordDto> {
    try {
      const collection = this.mongoDb.getCollection('dynamic_records');
      const now = new Date();

      const result = await collection.insertOne({
        entityId,
        data: payload,
        createdAt: now,
        updatedAt: now,
        isDeleted: false,
      });

      return {
        id: result.insertedId.toString(),
        entityId,
        data: payload,
        createdAt: now,
        updatedAt: now,
      };
    } catch (error) {
      this.logger.error('MongoDB create failed', error, 'MongoDBAdapter');
      throw error;
    }
  }

  async findMany(
    entityId: number,
    options?: {
      page?: number;
      pageSize?: number;
      filters?: { [key: string]: any };
    },
  ): Promise<{ records: DynamicRecordDto[]; total: number }> {
    try {
      const page = options?.page || 1;
      const pageSize = options?.pageSize || 10;
      const skip = (page - 1) * pageSize;

      const collection = this.mongoDb.getCollection('dynamic_records');

      const [records, total] = await Promise.all([
        collection
          .find({
            entityId,
            isDeleted: false,
          })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(pageSize)
          .toArray(),
        collection.countDocuments({
          entityId,
          isDeleted: false,
        }),
      ]);

      return {
        records: records.map((r) => this.toDynamicRecordDto(r)),
        total,
      };
    } catch (error) {
      this.logger.error('MongoDB findMany failed', error, 'MongoDBAdapter');
      throw error;
    }
  }

  async findOne(entityId: number, recordId: string): Promise<DynamicRecordDto | null> {
    try {
      const collection = this.mongoDb.getCollection('dynamic_records');

      const record = await collection.findOne({
        _id: new ObjectId(recordId),
        entityId,
        isDeleted: false,
      });

      return record ? this.toDynamicRecordDto(record) : null;
    } catch (error) {
      this.logger.error('MongoDB findOne failed', error, 'MongoDBAdapter');
      return null;
    }
  }

  async count(entityId: number, filters?: { [key: string]: any }): Promise<number> {
    try {
      const collection = this.mongoDb.getCollection('dynamic_records');

      return await collection.countDocuments({
        entityId,
        isDeleted: false,
        ...filters,
      });
    } catch (error) {
      this.logger.error('MongoDB count failed', error, 'MongoDBAdapter');
      throw error;
    }
  }

  async update(recordId: string, payload: { [key: string]: any }): Promise<DynamicRecordDto> {
    try {
      const collection = this.mongoDb.getCollection('dynamic_records');
      const now = new Date();

      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(recordId) },
        {
          $set: {
            data: payload,
            updatedAt: now,
          },
        },
        { returnDocument: 'after' },
      );

      if (!result.value) {
        throw new Error('Record not found');
      }

      return this.toDynamicRecordDto(result.value);
    } catch (error) {
      this.logger.error('MongoDB update failed', error, 'MongoDBAdapter');
      throw error;
    }
  }

  async softDelete(recordId: string): Promise<void> {
    try {
      const collection = this.mongoDb.getCollection('dynamic_records');

      await collection.updateOne(
        { _id: new ObjectId(recordId) },
        {
          $set: {
            isDeleted: true,
            updatedAt: new Date(),
          },
        },
      );
    } catch (error) {
      this.logger.error('MongoDB softDelete failed', error, 'MongoDBAdapter');
      throw error;
    }
  }

  async hardDelete(recordId: string): Promise<void> {
    try {
      const collection = this.mongoDb.getCollection('dynamic_records');

      await collection.deleteOne({ _id: new ObjectId(recordId) });
    } catch (error) {
      this.logger.error('MongoDB hardDelete failed', error, 'MongoDBAdapter');
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const db = this.mongoDb.getDatabase();
      await db.admin().ping();
      return true;
    } catch (error) {
      this.logger.error('MongoDB health check failed', error, 'MongoDBAdapter');
      return false;
    }
  }

  getType(): string {
    return 'mongodb';
  }

  /**
   * Convert MongoDB document to DTO
   */
  private toDynamicRecordDto(doc: any): DynamicRecordDto {
    return {
      id: doc._id?.toString() || doc.id,
      entityId: doc.entityId,
      data: doc.data || {},
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
