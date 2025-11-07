import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ValidationExceptionFilter');

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const message =
      typeof exceptionResponse === 'object'
        ? (exceptionResponse as any).message || exception.message
        : exception.message;

    this.logger.warn(`Validation error: ${message}`);
    console.error('VALIDATION ERROR DETAILS:', exception.message, exceptionResponse);

    response.status(status).json({
      success: false,
      statusCode: status,
      message: 'Validation failed',
      error: message,
      timestamp: new Date().toISOString(),
    });
  }
}
