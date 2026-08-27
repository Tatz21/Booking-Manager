import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseBoolPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceResponseDto } from './dto/service-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentBusinessId } from '../../common/decorators/current-user.decorator';
import { BusinessRole } from '@prisma/client';

@ApiTags('Services')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @Roles(BusinessRole.OWNER, BusinessRole.ADMIN, BusinessRole.STAFF)
  @ApiOperation({ summary: 'List all services for the business' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  @ApiResponse({
    status: 200,
    description: 'List of services',
    type: [ServiceResponseDto],
  })
  async findAll(
    @CurrentBusinessId() businessId: string,
    @Query('includeInactive', new DefaultValuePipe(false), ParseBoolPipe) includeInactive: boolean,
  ) {
    return this.servicesService.findAll(businessId, includeInactive);
  }

  @Post()
  @Roles(BusinessRole.OWNER, BusinessRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new service' })
  @ApiResponse({
    status: 201,
    description: 'Service created successfully',
    type: ServiceResponseDto,
  })
  async create(
    @CurrentBusinessId() businessId: string,
    @Body() dto: CreateServiceDto,
  ) {
    return this.servicesService.create(businessId, dto);
  }

  @Get(':id')
  @Roles(BusinessRole.OWNER, BusinessRole.ADMIN, BusinessRole.STAFF)
  @ApiOperation({ summary: 'Get service details by ID' })
  @ApiParam({ name: 'id', description: 'Service UUID' })
  @ApiResponse({
    status: 200,
    description: 'Service details',
    type: ServiceResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Service not found',
  })
  async findOne(
    @CurrentBusinessId() businessId: string,
    @Param('id') id: string,
  ) {
    return this.servicesService.findOne(businessId, id);
  }

  @Patch(':id')
  @Roles(BusinessRole.OWNER, BusinessRole.ADMIN)
  @ApiOperation({ summary: 'Update service details' })
  @ApiParam({ name: 'id', description: 'Service UUID' })
  @ApiResponse({
    status: 200,
    description: 'Service updated successfully',
    type: ServiceResponseDto,
  })
  async update(
    @CurrentBusinessId() businessId: string,
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
  ) {
    return this.servicesService.update(businessId, id, dto);
  }

  @Delete(':id')
  @Roles(BusinessRole.OWNER, BusinessRole.ADMIN)
  @ApiOperation({ summary: 'Soft delete a service' })
  @ApiParam({ name: 'id', description: 'Service UUID' })
  @ApiResponse({
    status: 200,
    description: 'Service soft deleted',
  })
  async remove(
    @CurrentBusinessId() businessId: string,
    @Param('id') id: string,
  ) {
    return this.servicesService.remove(businessId, id);
  }
}
