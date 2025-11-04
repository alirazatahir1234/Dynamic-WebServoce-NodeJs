import { Module } from '@nestjs/common';
import { PrismaModule } from './database/prisma.module';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [PrismaModule, LoggerModule],
  exports: [PrismaModule, LoggerModule],
})
export class CoreModule {}
