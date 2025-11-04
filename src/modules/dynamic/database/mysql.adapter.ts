import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { LoggerService } from '@/core/logger/logger.service';
import { IDatabaseAdapter, StoredRecord } from './database.adapter';
import { DynamicRecordDto, CreateDynamicRecordDto } from '@/common/dtos/dynamic.dto';

/**
 * MySQL Database Adapter
 * Implementation of IDatabaseAdapter for MySQL using Prisma
 */
@Injectable()
export class MySQLAdapter implements IDatabaseAdapter {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async create(entityId: number, payload: CreateDynamicRecordDto): Promise<DynamicRecordDto> {
    try {
      const record = await this.prisma.dynamicRecord.create({
        data: {
          entityId,
          data: JSON.stringify(payload),
        },
      });

      return this.toDynamicRecordDto(record);
    } catch (error) {
      this.logger.error('MySQL create failed', error, 'MySQLAdapter');
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

      const [records, total] = await Promise.all([
        this.prisma.dynamicRecord.findMany({
          where: {
            entityId,
            isDeleted: false,
          },
          skip,
          take: pageSize,
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.prisma.dynamicRecord.count({
          where: {
            entityId,
            isDeleted: false,
          },
        }),
      ]);

      return {
        records: records.map((r) => this.toDynamicRecordDto(r)),
        total,
      };
    } catch (error) {
      this.logger.error('MySQL findMany failed', error, 'MySQLAdapter');
      throw error;
    }
  }

  async findOne(entityId: number, recordId: string): Promise<DynamicRecordDto | null> {
    try {
      const record = await this.prisma.dynamicRecord.findFirst({
        where: {
          id: recordId,
          entityId,
          isDeleted: false,
        },
      });

      return record ? this.toDynamicRecordDto(record) : null;
    } catch (error) {
      this.logger.error('MySQL findOne failed', error, 'MySQLAdapter');
      throw error;
    }
  }

  async count(entityId: number, filters?: { [key: string]: any }): Promise<number> {
    try {
      return await this.prisma.dynamicRecord.count({
        where: {
          entityId,
          isDeleted: false,
        },
      });
    } catch (error) {
      this.logger.error('MySQL count failed', error, 'MySQLAdapter');
      throw error;
    }
  }

  async update(recordId: string, payload: { [key: string]: any }): Promise<DynamicRecordDto> {
    try {
      const record = await this.prisma.dynamicRecord.update({
        where: { id: recordId },
        data: {
          data: JSON.stringify(payload),
          updatedAt: new Date(),
        },
      });

      return this.toDynamicRecordDto(record);
    } catch (error) {
      this.logger.error('MySQL update failed', error, 'MySQLAdapter');
      throw error;
    }
  }

  async softDelete(recordId: string): Promise<void> {
    try {
      await this.prisma.dynamicRecord.update({
        where: { id: recordId },
        data: {
          isDeleted: true,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error('MySQL softDelete failed', error, 'MySQLAdapter');
      throw error;
    }
  }

  async hardDelete(recordId: string): Promise<void> {
    try {
      await this.prisma.dynamicRecord.delete({
        where: { id: recordId },
      });
    } catch (error) {
      this.logger.error('MySQL hardDelete failed', error, 'MySQLAdapter');
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error('MySQL health check failed', error, 'MySQLAdapter');
      return false;
    }
  }

  getType(): string {
    return 'mysql';
  }

  /**
   * Convert Prisma record to DTO
   */
  private toDynamicRecordDto(record: any): DynamicRecordDto {
    return {
      id: record.id,
      entityId: record.entityId,
      data: this.parseJsonData(record.data),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  /**
   * Safe JSON parsing
   */
  private parseJsonData(jsonStr: string): any {
    try {
      return JSON.parse(jsonStr);
    } catch {
      this.logger.warn('Failed to parse JSON data', 'MySQLAdapter');
      return {};
    }
  }
}
