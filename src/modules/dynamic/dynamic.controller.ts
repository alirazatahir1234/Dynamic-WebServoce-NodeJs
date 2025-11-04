import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { DynamicService } from './dynamic.service';
import {
  CreateDynamicRecordDto,
  DynamicRecordDto,
  PaginatedResponseDto,
} from '@/common/dtos/dynamic.dto';

@Controller('dynamic')
@ApiTags('Dynamic')
export class DynamicController {
  constructor(private dynamicService: DynamicService) {}

  /**
   * Get list of available entities
   */
  @Get('entities')
  @ApiOperation({
    summary: 'Get available entities',
    description: 'Retrieve list of all available entities',
  })
  @ApiResponse({
    status: 200,
    description: 'List of entities',
  })
  async getEntities(): Promise<any[]> {
    return this.dynamicService.getEntities();
  }

  /**
   * Get entity metadata/fields
   */
  @Get('metadata/:entity')
  @ApiOperation({
    summary: 'Get entity metadata',
    description: 'Retrieve entity field definitions',
  })
  @ApiParam({
    name: 'entity',
    type: String,
    description: 'Entity name',
  })
  @ApiResponse({
    status: 200,
    description: 'Entity metadata',
  })
  @ApiResponse({
    status: 404,
    description: 'Entity not found',
  })
  async getEntityMetadata(@Param('entity') entity: string): Promise<any> {
    return this.dynamicService.getEntityMetadata(entity);
  }

  /**
   * Get all records of an entity
   */
  @Get(':entity')
  @ApiOperation({
    summary: 'Get entity records',
    description: 'Retrieve all records of a specific entity with pagination',
  })
  @ApiParam({
    name: 'entity',
    type: String,
    description: 'Entity name',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'pageSize',
    type: Number,
    required: false,
    description: 'Records per page (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of records',
    type: PaginatedResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Entity not found',
  })
  async getRecords(
    @Param('entity') entity: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ): Promise<PaginatedResponseDto<DynamicRecordDto>> {
    return this.dynamicService.getRecords(entity, page, pageSize);
  }

  /**
   * Get single record by ID
   */
  @Get(':entity/:id')
  @ApiOperation({
    summary: 'Get record by ID',
    description: 'Retrieve a specific record from an entity',
  })
  @ApiParam({
    name: 'entity',
    type: String,
    description: 'Entity name',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Record ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Record details',
    type: DynamicRecordDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Record or entity not found',
  })
  async getRecordById(
    @Param('entity') entity: string,
    @Param('id') id: string,
  ): Promise<DynamicRecordDto> {
    return this.dynamicService.getRecordById(entity, id);
  }

  /**
   * Create new record
   */
  @Post(':entity')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create record',
    description: 'Create a new record in the specified entity',
  })
  @ApiParam({
    name: 'entity',
    type: String,
    description: 'Entity name',
  })
  @ApiResponse({
    status: 201,
    description: 'Record created successfully',
    type: DynamicRecordDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or validation error',
  })
  @ApiResponse({
    status: 404,
    description: 'Entity not found',
  })
  async createRecord(
    @Param('entity') entity: string,
    @Body() dto: CreateDynamicRecordDto,
  ): Promise<DynamicRecordDto> {
    return this.dynamicService.createRecord(entity, dto);
  }

  /**
   * Update record
   */
  @Put(':entity/:id')
  @ApiOperation({
    summary: 'Update record',
    description: 'Update an existing record in the specified entity',
  })
  @ApiParam({
    name: 'entity',
    type: String,
    description: 'Entity name',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Record ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Record updated successfully',
    type: DynamicRecordDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or validation error',
  })
  @ApiResponse({
    status: 404,
    description: 'Record or entity not found',
  })
  async updateRecord(
    @Param('entity') entity: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateDynamicRecordDto>,
  ): Promise<DynamicRecordDto> {
    return this.dynamicService.updateRecord(entity, id, dto);
  }

  /**
   * Delete record
   */
  @Delete(':entity/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete record',
    description: 'Delete a record from the specified entity',
  })
  @ApiParam({
    name: 'entity',
    type: String,
    description: 'Entity name',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Record ID',
  })
  @ApiResponse({
    status: 204,
    description: 'Record deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Record or entity not found',
  })
  async deleteRecord(
    @Param('entity') entity: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.dynamicService.deleteRecord(entity, id);
  }
}
