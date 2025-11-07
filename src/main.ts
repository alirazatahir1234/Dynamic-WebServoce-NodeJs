import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './core/filters/http-exception.filter';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';
import { LoggerService } from './core/logger/logger.service';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = new LoggerService();
  app.useLogger(logger);

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS configuration
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false, // Don't whitelist - allow all properties for dynamic DTOs
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const messages = errors.map(
          (error) =>
            `${error.property}: ${Object.values(error.constraints).join(', ')}`,
        );
        return new BadRequestException({
          statusCode: 400,
          message: 'Validation failed',
          errors: messages,
        });
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter(logger));
  app.useGlobalFilters(new ValidationExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor(logger));
  app.useGlobalInterceptors(new TransformResponseInterceptor());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Dynamic Web Service API')
    .setDescription(
      'Metadata-driven REST API for dynamic entity management. Node.js version of DynamicWebService .NET backend. Supports CRUD operations on dynamic entities with flexible schema.',
    )
    .setVersion('1.0.0')
    .setContact(
      'DynamicWebService',
      'https://github.com/alirazatahir1234',
      'support@example.com',
    )
    .setLicense(
      'MIT',
      'https://opensource.org/licenses/MIT',
    )
    .addTag('Metadata', 'Entity and Field definitions management')
    .addTag('Dynamic', 'CRUD operations for dynamic entities')
    .addTag('Lookup', 'Dropdown and reference data')
    .addTag('Health', 'System health checks')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayOperationId: true,
      docExpansion: 'list',
      filter: true,
      showRequestHeaders: true,
      supportedSubmitMethods: ['get', 'post', 'put', 'patch', 'delete'],
    },
    customCss: `.swagger-ui .topbar { display: none }`,
    customSiteTitle: 'Dynamic Web Service API Docs',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 Server running on http://localhost:${port}`, 'Bootstrap');
  logger.log(`📚 Swagger documentation available at http://localhost:${port}/swagger`, 'Bootstrap');
}

bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
