import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AvailabilityService } from './availability.service';
import { SetBusinessHoursDto } from './dto/business-hours.dto';
import { SetStaffAvailabilityDto } from './dto/staff-availability.dto';
import { QuerySlotsDto } from './dto/query-slots.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentBusinessId } from '../../common/decorators/current-user.decorator';
import { BusinessRole } from '@prisma/client';

@ApiTags('Availability')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get('business-hours')
  @Roles(BusinessRole.OWNER, BusinessRole.ADMIN, BusinessRole.STAFF)
  @ApiOperation({ summary: 'Get business weekly operating hours and breaks' })
  async getBusinessHours(@CurrentBusinessId() businessId: string) {
    return this.availabilityService.getBusinessHours(businessId);
  }

  @Put('business-hours')
  @Roles(BusinessRole.OWNER, BusinessRole.ADMIN)
  @ApiOperation({ summary: 'Set business weekly operating hours and breaks' })
  async setBusinessHours(
    @CurrentBusinessId() businessId: string,
    @Body() dto: SetBusinessHoursDto,
  ) {
    return this.availabilityService.setBusinessHours(businessId, dto);
  }

  @Get('staff/:staffId')
  @Roles(BusinessRole.OWNER, BusinessRole.ADMIN, BusinessRole.STAFF)
  @ApiOperation({ summary: 'Get staff weekly working shifts and breaks' })
  @ApiParam({ name: 'staffId', description: 'Staff UUID' })
  async getStaffAvailability(
    @CurrentBusinessId() businessId: string,
    @Param('staffId') staffId: string,
  ) {
    return this.availabilityService.getStaffAvailability(businessId, staffId);
  }

  @Put('staff/:staffId')
  @Roles(BusinessRole.OWNER, BusinessRole.ADMIN)
  @ApiOperation({ summary: 'Set staff weekly working shifts and breaks' })
  @ApiParam({ name: 'staffId', description: 'Staff UUID' })
  async setStaffAvailability(
    @CurrentBusinessId() businessId: string,
    @Param('staffId') staffId: string,
    @Body() dto: SetStaffAvailabilityDto,
  ) {
    return this.availabilityService.setStaffAvailability(businessId, staffId, dto);
  }

  @Get('slots')
  @Roles(BusinessRole.OWNER, BusinessRole.ADMIN, BusinessRole.STAFF)
  @ApiOperation({ summary: 'Compute available appointment slots for a service and date' })
  async getAvailableSlots(
    @CurrentBusinessId() businessId: string,
    @Query() query: QuerySlotsDto,
  ) {
    return this.availabilityService.getAvailableSlots(businessId, query);
  }
}
