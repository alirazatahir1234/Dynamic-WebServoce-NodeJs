import { Module } from '@nestjs/common';
import { CoreModule } from '@/core/core.module';
import { MetadataModule } from '@/modules/metadata/metadata.module';
import { DynamicService } from './dynamic.service';
import { DynamicController } from './dynamic.controller';

@Module({
  imports: [CoreModule, MetadataModule],
  controllers: [DynamicController],
  providers: [DynamicService],
  exports: [DynamicService],
})
export class DynamicModule {}
