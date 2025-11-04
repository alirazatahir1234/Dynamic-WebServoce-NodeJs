import { Module } from '@nestjs/common';
import { PrismaModule } from './database/prisma.module';
import { MongoDBModule } from './database/mongodb.module';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [PrismaModule, MongoDBModule, LoggerModule],
  exports: [PrismaModule, MongoDBModule, LoggerModule],
})
export class CoreModule {}
