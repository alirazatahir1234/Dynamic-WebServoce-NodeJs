import {
  Controller,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { HealthService } from './health.service';
import { HealthCheckResponseDto } from '@/common/dtos/dynamic.dto';

@Controller('health')
@ApiTags('Health')
export class HealthController {
  constructor(private healthService: HealthService) {}

  /**
   * System health check
   */
  @Get()
  @ApiOperation({
    summary: 'Health check',
    description: 'Check system health status, database connectivity, and uptime',
  })
  @ApiResponse({
    status: 200,
    description: 'System health status',
    type: HealthCheckResponseDto,
  })
  async health(): Promise<HealthCheckResponseDto> {
    return this.healthService.getHealth();
  }
}
