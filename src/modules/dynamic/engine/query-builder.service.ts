import { Injectable } from '@nestjs/common';
import {
  DynamicEntityContext,
  PaginationOptions,
  QueryDescriptor,
} from './query.types';

@Injectable()
export class DynamicQueryBuilder {
  buildFindMany(
    context: DynamicEntityContext,
    pagination: PaginationOptions,
  ): QueryDescriptor {
    const skip = (pagination.page - 1) * pagination.pageSize;

    return {
      model: 'dynamicRecord',
      action: 'findMany',
      args: {
        where: { entityId: context.entity.id, isDeleted: false },
        skip,
        take: pagination.pageSize,
        orderBy: { createdAt: 'desc' },
      },
    };
  }

  buildCount(context: DynamicEntityContext): QueryDescriptor {
    return {
      model: 'dynamicRecord',
      action: 'count',
      args: {
        where: { entityId: context.entity.id, isDeleted: false },
      },
    };
  }

  buildFindOne(
    context: DynamicEntityContext,
    recordId: string,
  ): QueryDescriptor {
    return {
      model: 'dynamicRecord',
      action: 'findFirst',
      args: {
        where: {
          id: recordId,
          entityId: context.entity.id,
          isDeleted: false,
        },
      },
    };
  }

  buildCreate(
    context: DynamicEntityContext,
    payload: Record<string, unknown>,
  ): QueryDescriptor {
    return {
      model: 'dynamicRecord',
      action: 'create',
      args: {
        data: {
          entityId: context.entity.id,
          data: JSON.stringify(payload),
        },
      },
    };
  }

  buildUpdate(
    recordId: string,
    payload: Record<string, unknown>,
  ): QueryDescriptor {
    return {
      model: 'dynamicRecord',
      action: 'update',
      args: {
        where: { id: recordId },
        data: {
          data: JSON.stringify(payload),
        },
      },
    };
  }

  buildSoftDelete(recordId: string): QueryDescriptor {
    return {
      model: 'dynamicRecord',
      action: 'update',
      args: {
        where: { id: recordId },
        data: { isDeleted: true },
      },
    };
  }
}
