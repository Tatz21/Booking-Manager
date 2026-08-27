import {
  Controller,
  Get,
  Post,
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
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { PublicBookingService } from './public-booking.service';
import {
  PublicBookingRequestDto,
  PublicAvailabilityQueryDto,
} from './dto/public-booking.dto';
import {
  PublicBusinessProfileDto,
  PublicBookingConfirmationDto,
} from './dto/public-response.dto';

@ApiTags('Public Booking')
@Controller('public')
export class PublicBookingController {
  constructor(private readonly publicBookingService: PublicBookingService) {}

  @Get(':slug')
  @ApiOperation({
    summary: 'Get public business booking page by business slug',
    description: 'Returns publicly viewable details of the business (name, address, hours, currency, booking rules).',
  })
  @ApiParam({ name: 'slug', example: 'apex-barber-studio-7a8b', description: 'Unique business booking slug' })
  @ApiResponse({
    status: 200,
    description: 'Business public profile',
    type: PublicBusinessProfileDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Business not found',
  })
  async getBusinessProfile(@Param('slug') slug: string) {
    return this.publicBookingService.getBusinessProfile(slug);
  }

  @Get(':slug/services')
  @ApiOperation({ summary: 'Get active services offered by the business' })
  @ApiParam({ name: 'slug', description: 'Business slug' })
  @ApiResponse({
    status: 200,
    description: 'List of bookable services with duration and price',
  })
  async getServices(@Param('slug') slug: string) {
    return this.publicBookingService.getServices(slug);
  }

  @Get(':slug/staff')
  @ApiOperation({ summary: 'Get staff members and their qualified services' })
  @ApiParam({ name: 'slug', description: 'Business slug' })
  @ApiResponse({
    status: 200,
    description: 'List of active staff members',
  })
  async getStaff(@Param('slug') slug: string) {
    return this.publicBookingService.getStaff(slug);
  }

  @Get(':slug/availability')
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @ApiOperation({ summary: 'Get available time slots for a given service and date' })
  @ApiParam({ name: 'slug', description: 'Business slug' })
  @ApiResponse({
    status: 200,
    description: 'Computed available time slots',
  })
  async getAvailability(
    @Param('slug') slug: string,
    @Query() query: PublicAvailabilityQueryDto,
  ) {
    return this.publicBookingService.getAvailability(slug, query);
  }

  @Post(':slug/appointments')
  @Throttle({ default: { limit: 15, ttl: 60000 } }) // 15 bookings per minute per IP
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Public customer booking endpoint (No account creation needed)',
    description:
      'Allows customer to reserve an appointment by providing contact info, chosen date/time slot, staff, and service.',
  })
  @ApiParam({ name: 'slug', description: 'Business slug' })
  @ApiResponse({
    status: 201,
    description: 'Appointment booked successfully',
    type: PublicBookingConfirmationDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Slot no longer available (race condition / double booking protection)',
  })
  async bookAppointment(
    @Param('slug') slug: string,
    @Body() dto: PublicBookingRequestDto,
  ) {
    return this.publicBookingService.bookAppointment(slug, dto);
  }
}
