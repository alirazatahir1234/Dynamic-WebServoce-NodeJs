import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { MetadataService } from './metadata.service';
import {
  CreateEntityDefinitionDto,
  CreateFieldDefinitionDto,
  EntityDefinitionDto,
  FieldDefinitionDto,
} from '@/common/dtos/metadata.dto';

@Controller('metadata')
@ApiTags('Metadata')
export class MetadataController {
  constructor(private metadataService: MetadataService) {}

  /**
   * Get all entity definitions
   */
  @Get('entities')
  @ApiOperation({
    summary: 'Get all entities',
    description: 'Retrieve all entity definitions with their fields',
  })
  @ApiResponse({
    status: 200,
    description: 'List of entities',
    type: [EntityDefinitionDto],
  })
  async getAllEntities(): Promise<EntityDefinitionDto[]> {
    return this.metadataService.getAllEntities();
  }

  /**
   * Get entity by ID
   */
  @Get('entities/:id')
  @ApiOperation({
    summary: 'Get entity by ID',
    description: 'Retrieve a specific entity definition and its fields',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Entity ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Entity definition',
    type: EntityDefinitionDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Entity not found',
  })
  async getEntityById(@Param('id') id: number): Promise<EntityDefinitionDto> {
    return this.metadataService.getEntityById(Number(id));
  }

  /**
   * Create entity definition
   */
  @Post('entities')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create entity',
    description: 'Create a new entity definition',
  })
  @ApiResponse({
    status: 201,
    description: 'Entity created successfully',
    type: EntityDefinitionDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input',
  })
  @ApiResponse({
    status: 409,
    description: 'Entity already exists',
  })
  async createEntity(
    @Body() dto: CreateEntityDefinitionDto,
  ): Promise<EntityDefinitionDto> {
    return this.metadataService.createEntity(dto);
  }

  /**
   * Update entity definition
   */
  @Put('entities/:id')
  @ApiOperation({
    summary: 'Update entity',
    description: 'Update an existing entity definition',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Entity ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Entity updated successfully',
    type: EntityDefinitionDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Entity not found',
  })
  async updateEntity(
    @Param('id') id: number,
    @Body() dto: Partial<CreateEntityDefinitionDto>,
  ): Promise<EntityDefinitionDto> {
    return this.metadataService.updateEntity(Number(id), dto);
  }

  /**
   * Delete entity definition
   */
  @Delete('entities/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete entity',
    description: 'Soft delete an entity definition',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Entity ID',
  })
  @ApiResponse({
    status: 204,
    description: 'Entity deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Entity not found',
  })
  async deleteEntity(@Param('id') id: number): Promise<void> {
    return this.metadataService.deleteEntity(Number(id));
  }

  /**
   * Get fields for entity
   */
  @Get('entities/:id/fields')
  @ApiOperation({
    summary: 'Get entity fields',
    description: 'Get all fields defined for a specific entity',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Entity ID',
  })
  @ApiResponse({
    status: 200,
    description: 'List of fields',
    type: [FieldDefinitionDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Entity not found',
  })
  async getEntityFields(@Param('id') id: number): Promise<FieldDefinitionDto[]> {
    return this.metadataService.getEntityFields(Number(id));
  }

  /**
   * Create field definition
   */
  @Post('fields')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create field',
    description: 'Add a new field to an entity',
  })
  @ApiResponse({
    status: 201,
    description: 'Field created successfully',
    type: FieldDefinitionDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input',
  })
  @ApiResponse({
    status: 404,
    description: 'Entity not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Field already exists',
  })
  async createField(
    @Body() dto: CreateFieldDefinitionDto,
  ): Promise<FieldDefinitionDto> {
    return this.metadataService.createField(dto);
  }

  /**
   * Update field definition
   */
  @Put('fields/:id')
  @ApiOperation({
    summary: 'Update field',
    description: 'Update an existing field definition',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Field ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Field updated successfully',
    type: FieldDefinitionDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Field not found',
  })
  async updateField(
    @Param('id') id: number,
    @Body() dto: Partial<CreateFieldDefinitionDto>,
  ): Promise<FieldDefinitionDto> {
    return this.metadataService.updateField(Number(id), dto);
  }

  /**
   * Delete field definition
   */
  @Delete('fields/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete field',
    description: 'Soft delete a field definition',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Field ID',
  })
  @ApiResponse({
    status: 204,
    description: 'Field deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Field not found',
  })
  async deleteField(@Param('id') id: number): Promise<void> {
    return this.metadataService.deleteField(Number(id));
  }
}
