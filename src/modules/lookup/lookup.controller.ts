import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { LookupService } from './lookup.service';
import { LookupResponseDto } from '@/common/dtos/dynamic.dto';

@Controller('lookup')
@ApiTags('Lookup')
export class LookupController {
  constructor(private lookupService: LookupService) {}

  /**
   * Get lookup data for entity (for dropdowns)
   */
  @Get(':entity')
  @ApiOperation({
    summary: 'Get lookup data',
    description: 'Get dropdown/reference data for an entity',
  })
  @ApiParam({
    name: 'entity',
    type: String,
    description: 'Entity name',
  })
  @ApiResponse({
    status: 200,
    description: 'Lookup data with Id and DisplayText pairs',
    type: LookupResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Entity not found',
  })
  async getLookupData(@Param('entity') entity: string): Promise<LookupResponseDto> {
    return this.lookupService.getLookupData(entity);
  }

  /**
   * Health check
   */
  @Get('health')
  @ApiOperation({
    summary: 'Health check',
    description: 'Check if lookup service is available',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
  })
  async health(): Promise<{ status: string; message: string }> {
    return {
      status: 'ok',
      message: 'Lookup service is healthy',
    };
  }
}
