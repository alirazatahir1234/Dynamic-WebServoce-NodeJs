import { Module } from '@nestjs/common';
import { LoggerModule } from '@/core/logger/logger.module';
import { TransformResponseInterceptor } from './interceptors/transform-response.interceptor';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { ValidationExceptionFilter } from './filters/validation-exception.filter';

@Module({
  imports: [LoggerModule],
  providers: [
    TransformResponseInterceptor,
    LoggingInterceptor,
    ValidationExceptionFilter,
  ],
  exports: [
    TransformResponseInterceptor,
    LoggingInterceptor,
    ValidationExceptionFilter,
  ],
})
export class CommonModule {}
