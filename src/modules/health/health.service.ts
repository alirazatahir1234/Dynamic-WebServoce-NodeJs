import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { LoggerService } from '@/core/logger/logger.service';
import { HealthCheckResponseDto } from '@/common/dtos/dynamic.dto';

/**
 * Service for health checks
 */
@Injectable()
export class HealthService {
  private startTime = Date.now();

  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
  ) {}

  /**
   * Get system health status
   */
  async getHealth(): Promise<HealthCheckResponseDto> {
    try {
      // Check database connectivity
      await this.prisma.$queryRaw`SELECT 1`;

      const uptime = Math.floor((Date.now() - this.startTime) / 1000);

      return {
        status: 'healthy',
        message: 'All systems operational',
        timestamp: new Date(),
        uptime,
        database: 'connected',
      };
    } catch (error) {
      this.logger.error(
        'Health check failed',
        error.message,
        'HealthService',
      );

      const uptime = Math.floor((Date.now() - this.startTime) / 1000);

      return {
        status: 'unhealthy',
        message: `Database connection failed: ${error.message}`,
        timestamp: new Date(),
        uptime,
        database: 'disconnected',
      };
    }
  }
}
