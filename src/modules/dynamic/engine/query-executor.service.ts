import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { QueryDescriptor } from './query.types';

@Injectable()
export class DynamicQueryExecutor {
  constructor(private readonly prisma: PrismaService) {}

  async execute<T = unknown>(descriptor: QueryDescriptor): Promise<T> {
    const client = (this.prisma as any)[descriptor.model];

    if (!client) {
      throw new Error(`Unsupported model '${descriptor.model}' in query executor`);
    }

    const handler = client[descriptor.action];

    if (typeof handler !== 'function') {
      throw new Error(
        `Unsupported action '${descriptor.action}' for model '${descriptor.model}'`,
      );
    }

    return handler.call(client, descriptor.args);
  }
}
