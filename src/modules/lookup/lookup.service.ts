import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { LoggerService } from '@/core/logger/logger.service';
import { MetadataService } from '@/modules/metadata/metadata.service';
import { LookupResponseDto, LookupValueDto } from '@/common/dtos/dynamic.dto';

/**
 * Service for retrieving lookup/dropdown data
 * Used for populating foreign key dropdowns
 */
@Injectable()
export class LookupService {
  private lookupImplementations: Map<string, (records: any[]) => LookupValueDto[]> = new Map();

  constructor(
    private prisma: PrismaService,
    private metadataService: MetadataService,
    private logger: LoggerService,
  ) {
    this.registerDefaultLookups();
  }

  /**
   * Register entity-specific lookup implementations
   */
  private registerDefaultLookups(): void {
    // Customer lookup - assumes firstName and lastName fields
    this.lookupImplementations.set('Customer', (records: any[]) => {
      return records.map((r) => ({
        id: r.id,
        displayText: `${r.firstName || ''} ${r.lastName || ''}`.trim() || r.name || `Record ${r.id}`,
      }));
    });

    // Product lookup - assumes productName field
    this.lookupImplementations.set('Product', (records: any[]) => {
      return records.map((r) => ({
        id: r.id,
        displayText: r.productName || r.name || `Product ${r.id}`,
      }));
    });

    // Default generic lookup - tries common fields
    // This will be used as fallback for any entity
  }

  /**
   * Get lookup data for an entity
   */
  async getLookupData(entityName: string): Promise<LookupResponseDto> {
    this.logger.debug(`Fetching lookup data for ${entityName}`, 'LookupService');

    try {
      const entity = await this.metadataService.getEntityByName(entityName);

      // Get all records
      const records = await this.prisma.dynamicRecord.findMany({
        where: { entityId: entity.id, isDeleted: false },
        take: 1000, // Limit to 1000 for dropdown performance
      });

      // Parse record data
      const parsedRecords = records.map((r) => ({
        id: r.id,
        ...JSON.parse(r.data),
      }));

      // Use entity-specific lookup implementation if available
      let lookupValues: LookupValueDto[];
      if (this.lookupImplementations.has(entityName)) {
        const impl = this.lookupImplementations.get(entityName);
        lookupValues = impl(parsedRecords);
      } else {
        // Fallback: try generic lookup
        lookupValues = this.generateGenericLookup(parsedRecords);
      }

      this.logger.log(
        `✓ Retrieved ${lookupValues.length} lookup values for ${entityName}`,
        'LookupService',
      );

      return {
        entityName,
        values: lookupValues,
        count: lookupValues.length,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching lookup data for ${entityName}`,
        error.message,
        'LookupService',
      );
      throw error;
    }
  }

  /**
   * Generic lookup implementation - tries common display fields
   */
  private generateGenericLookup(records: any[]): LookupValueDto[] {
    const commonFields = [
      'name', 'displayName', 'title', 'firstName',
      'email', 'description',
    ];

    return records.map((r) => {
      // Find first non-empty common field
      let displayText = `Record ${r.id}`;

      for (const field of commonFields) {
        if (r[field]) {
          displayText = String(r[field]);
          break;
        }
      }

      return {
        id: r.id,
        displayText,
      };
    });
  }

  /**
   * Register custom lookup implementation for an entity
   */
  registerLookupImplementation(
    entityName: string,
    implementation: (records: any[]) => LookupValueDto[],
  ): void {
    this.lookupImplementations.set(entityName, implementation);
    this.logger.log(
      `✓ Registered custom lookup for ${entityName}`,
      'LookupService',
    );
  }
}
