import { Module } from '@nestjs/common';
import { CoreModule } from '@/core/core.module';
import { MetadataModule } from '@/modules/metadata/metadata.module';
import { DynamicService } from './dynamic.service';
import { DynamicController } from './dynamic.controller';
import { DynamicMetadataReader } from './engine/metadata-reader.service';
import { DynamicQueryBuilder } from './engine/query-builder.service';
import { DynamicQueryExecutor } from './engine/query-executor.service';
import { DatabaseService } from './database/database.service';
import { MySQLAdapter } from './database/mysql.adapter';
import { MongoDBAdapter } from './database/mongodb.adapter';

@Module({
  imports: [CoreModule, MetadataModule],
  controllers: [DynamicController],
  providers: [
    DynamicService,
    DynamicMetadataReader,
    DynamicQueryBuilder,
    DynamicQueryExecutor,
    DatabaseService,
    MySQLAdapter,
    MongoDBAdapter,
  ],
  exports: [DynamicService, DatabaseService],
})
export class DynamicModule {}
