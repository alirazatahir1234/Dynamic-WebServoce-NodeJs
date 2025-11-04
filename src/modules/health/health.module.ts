import { Module } from '@nestjs/common';
import { CoreModule } from '@/core/core.module';
import { HealthService } from './health.service';
import { HealthController } from './health.controller';

@Module({
  imports: [CoreModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
