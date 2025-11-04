import { Injectable } from '@nestjs/common';
import { MetadataService } from '@/modules/metadata/metadata.service';
import { LoggerService } from '@/core/logger/logger.service';
import { DynamicEntityContext } from './query.types';

@Injectable()
export class DynamicMetadataReader {
  constructor(
    private readonly metadataService: MetadataService,
    private readonly logger: LoggerService,
  ) {}

  async getEntityContext(entityName: string): Promise<DynamicEntityContext> {
    this.logger.debug(
      `Loading metadata context for entity ${entityName}`,
      'DynamicMetadataReader',
    );

    const entity = await this.metadataService.getEntityByName(entityName);

    const fields = entity.fields ?? [];

    return {
      entity,
      fields,
    };
  }
}
