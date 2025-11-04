import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CoreModule } from './core/core.module';
import { CommonModule } from './common/common.module';
import { MetadataModule } from './modules/metadata/metadata.module';
import { DynamicModule } from './modules/dynamic/dynamic.module';
import { LookupModule } from './modules/lookup/lookup.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CoreModule,
    CommonModule,
    MetadataModule,
    DynamicModule,
    LookupModule,
    HealthModule,
  ],
})
export class AppModule {}
