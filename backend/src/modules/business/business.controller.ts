import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BusinessService } from './business.service';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { UpdateBookingSettingsDto } from './dto/update-settings.dto';
import { BusinessProfileDto } from './dto/business-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CurrentBusinessId,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { BusinessRole } from '@prisma/client';

@ApiTags('Business')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Get()
  @Roles(BusinessRole.OWNER, BusinessRole.ADMIN, BusinessRole.STAFF)
  @ApiOperation({ summary: 'Get current tenant business profile and settings' })
  @ApiResponse({
    status: 200,
    description: 'Business profile retrieved successfully',
    type: BusinessProfileDto,
  })
  async getBusiness(@CurrentBusinessId() businessId: string) {
    return this.businessService.getBusinessProfile(businessId);
  }

  @Patch()
  @Roles(BusinessRole.OWNER, BusinessRole.ADMIN)
  @ApiOperation({ summary: 'Update business profile (Name, Location, Timezone, Phone, etc.)' })
  @ApiResponse({
    status: 200,
    description: 'Business updated successfully',
    type: BusinessProfileDto,
  })
  async updateBusiness(
    @CurrentBusinessId() businessId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateBusinessDto,
  ) {
    return this.businessService.updateBusinessProfile(businessId, userId, dto);
  }

  @Get('settings')
  @Roles(BusinessRole.OWNER, BusinessRole.ADMIN, BusinessRole.STAFF)
  @ApiOperation({ summary: 'Get booking rules & advance scheduling settings' })
  async getSettings(@CurrentBusinessId() businessId: string) {
    return this.businessService.getBookingSettings(businessId);
  }

  @Patch('settings')
  @Roles(BusinessRole.OWNER, BusinessRole.ADMIN)
  @ApiOperation({ summary: 'Update booking rules & notice intervals' })
  async updateSettings(
    @CurrentBusinessId() businessId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateBookingSettingsDto,
  ) {
    return this.businessService.updateBookingSettings(businessId, userId, dto);
  }
}
