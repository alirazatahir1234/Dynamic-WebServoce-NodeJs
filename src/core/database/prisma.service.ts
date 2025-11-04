import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  private logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });
    this.logger.log('✓ Prisma initialized');
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('✓ Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('✓ Database disconnected');
  }
}
