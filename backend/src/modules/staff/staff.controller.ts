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
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { AssignServicesDto } from './dto/assign-services.dto';
import { StaffResponseDto } from './dto/staff-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentBusinessId } from '../../common/decorators/current-user.decorator';
import { BusinessRole } from '@prisma/client';

@ApiTags('Staff')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  @Roles(BusinessRole.OWNER, BusinessRole.ADMIN, BusinessRole.STAFF)
  @ApiOperation({ summary: 'List all staff members for the business' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  @ApiResponse({
    status: 200,
    description: 'List of staff members with assigned services',
    type: [StaffResponseDto],
  })
  async findAll(
    @CurrentBusinessId() businessId: string,
    @Query('includeInactive', new DefaultValuePipe(false), ParseBoolPipe) includeInactive: boolean,
  ) {
    return this.staffService.findAll(businessId, includeInactive);
  }

  @Post()
  @Roles(BusinessRole.OWNER, BusinessRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new staff member' })
  @ApiResponse({
    status: 201,
    description: 'Staff member created successfully',
    type: StaffResponseDto,
  })
  async create(
    @CurrentBusinessId() businessId: string,
    @Body() dto: CreateStaffDto,
  ) {
    return this.staffService.create(businessId, dto);
  }

  @Get(':id')
  @Roles(BusinessRole.OWNER, BusinessRole.ADMIN, BusinessRole.STAFF)
  @ApiOperation({ summary: 'Get staff details, assigned services, and availability' })
  @ApiParam({ name: 'id', description: 'Staff UUID' })
  @ApiResponse({
    status: 200,
    description: 'Staff details',
    type: StaffResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Staff member not found',
  })
  async findOne(
    @CurrentBusinessId() businessId: string,
    @Param('id') id: string,
  ) {
    return this.staffService.findOne(businessId, id);
  }

  @Patch(':id')
  @Roles(BusinessRole.OWNER, BusinessRole.ADMIN)
  @ApiOperation({ summary: 'Update staff member profile and services' })
  @ApiParam({ name: 'id', description: 'Staff UUID' })
  @ApiResponse({
    status: 200,
    description: 'Staff updated successfully',
    type: StaffResponseDto,
  })
  async update(
    @CurrentBusinessId() businessId: string,
    @Param('id') id: string,
    @Body() dto: UpdateStaffDto,
  ) {
    return this.staffService.update(businessId, id, dto);
  }

  @Delete(':id')
  @Roles(BusinessRole.OWNER, BusinessRole.ADMIN)
  @ApiOperation({ summary: 'Soft delete a staff member' })
  @ApiParam({ name: 'id', description: 'Staff UUID' })
  @ApiResponse({
    status: 200,
    description: 'Staff member soft deleted',
  })
  async remove(
    @CurrentBusinessId() businessId: string,
    @Param('id') id: string,
  ) {
    return this.staffService.remove(businessId, id);
  }

  @Post(':id/services')
  @Roles(BusinessRole.OWNER, BusinessRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign qualified services to staff member' })
  @ApiParam({ name: 'id', description: 'Staff UUID' })
  @ApiResponse({
    status: 200,
    description: 'Services assigned successfully',
  })
  async assignServices(
    @CurrentBusinessId() businessId: string,
    @Param('id') id: string,
    @Body() dto: AssignServicesDto,
  ) {
    return this.staffService.assignServices(businessId, id, dto.serviceIds);
  }
}
