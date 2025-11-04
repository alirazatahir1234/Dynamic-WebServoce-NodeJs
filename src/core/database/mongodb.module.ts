import { Module } from '@nestjs/common';
import { MongoDBService } from './mongodb.service';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [LoggerModule],
  providers: [MongoDBService],
  exports: [MongoDBService],
})
export class MongoDBModule {}
