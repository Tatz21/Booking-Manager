import { Module } from '@nestjs/common';
import { PublicBookingController } from './public-booking.controller';
import { PublicBookingService } from './public-booking.service';
import { AvailabilityModule } from '../availability/availability.module';
import { AppointmentsModule } from '../appointments/appointments.module';

@Module({
  imports: [AvailabilityModule, AppointmentsModule],
  controllers: [PublicBookingController],
  providers: [PublicBookingService],
  exports: [PublicBookingService],
})
export class PublicBookingModule {}
