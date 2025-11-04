import { EntityDefinitionDto, FieldDefinitionDto } from '@/common/dtos/metadata.dto';

export type QueryModel = 'dynamicRecord';

export type QueryAction =
  | 'findMany'
  | 'findFirst'
  | 'count'
  | 'create'
  | 'update';

export interface QueryDescriptor<TModel extends QueryModel = QueryModel> {
  model: TModel;
  action: QueryAction;
  args: Record<string, unknown>;
}

export interface DynamicEntityContext {
  entity: EntityDefinitionDto;
  fields: FieldDefinitionDto[];
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
}
