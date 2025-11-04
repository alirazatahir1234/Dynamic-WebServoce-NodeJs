import { Module } from '@nestjs/common';
import { CoreModule } from '@/core/core.module';
import { MetadataModule } from '@/modules/metadata/metadata.module';
import { LookupService } from './lookup.service';
import { LookupController } from './lookup.controller';

@Module({
  imports: [CoreModule, MetadataModule],
  controllers: [LookupController],
  providers: [LookupService],
  exports: [LookupService],
})
export class LookupModule {}
