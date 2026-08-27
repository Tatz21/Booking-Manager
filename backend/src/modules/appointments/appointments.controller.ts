import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { QueryAppointmentsDto } from './dto/query-appointments.dto';
import { UpdateAppointmentStatusDto } from './dto/update-status.dto';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';
import { AppointmentResponseDto } from './dto/appointment-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CurrentBusinessId,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { BusinessRole } from '@prisma/client';

@ApiTags('Appointments')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @Roles(BusinessRole.OWNER, BusinessRole.ADMIN, BusinessRole.STAFF)
  @ApiOperation({ summary: 'List appointments with date filters and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Paginated appointment list',
  })
  async findAll(
    @CurrentBusinessId() businessId: string,
    @Query() query: QueryAppointmentsDto,
  ) {
    return this.appointmentsService.findAll(businessId, query);
  }

  @Post()
  @Roles(BusinessRole.OWNER, BusinessRole.ADMIN, BusinessRole.STAFF)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new appointment with concurrency protection' })
  @ApiResponse({
    status: 201,
    description: 'Appointment booked successfully',
    type: AppointmentResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'This appointment time is no longer available.',
  })
  async create(
    @CurrentBusinessId() businessId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateAppointmentDto,
  ) {
    return this.appointmentsService.create(businessId, dto, userId);
  }

  @Get(':id')
  @Roles(BusinessRole.OWNER, BusinessRole.ADMIN, BusinessRole.STAFF)
  @ApiOperation({ summary: 'Get appointment details by ID' })
  @ApiParam({ name: 'id', description: 'Appointment UUID' })
  @ApiResponse({
    status: 200,
    description: 'Appointment details',
    type: AppointmentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Appointment not found',
  })
  async findOne(
    @CurrentBusinessId() businessId: string,
    @Param('id') id: string,
  ) {
    return this.appointmentsService.findOne(businessId, id);
  }

  @Patch(':id/status')
  @Roles(BusinessRole.OWNER, BusinessRole.ADMIN, BusinessRole.STAFF)
  @ApiOperation({ summary: 'Update appointment status (CONFIRMED, COMPLETED, CANCELLED)' })
  @ApiParam({ name: 'id', description: 'Appointment UUID' })
  @ApiResponse({
    status: 200,
    description: 'Status updated',
    type: AppointmentResponseDto,
  })
  async updateStatus(
    @CurrentBusinessId() businessId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentStatusDto,
  ) {
    return this.appointmentsService.updateStatus(businessId, id, dto.status, userId);
  }

  @Post(':id/cancel')
  @Roles(BusinessRole.OWNER, BusinessRole.ADMIN, BusinessRole.STAFF)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel an appointment with a reason' })
  @ApiParam({ name: 'id', description: 'Appointment UUID' })
  @ApiResponse({
    status: 200,
    description: 'Appointment cancelled',
    type: AppointmentResponseDto,
  })
  async cancel(
    @CurrentBusinessId() businessId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: CancelAppointmentDto,
  ) {
    return this.appointmentsService.cancel(businessId, id, dto, userId);
  }
}
