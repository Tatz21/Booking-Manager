import { ApiProperty } from '@nestjs/swagger';

export class PublicBusinessProfileDto {
  @ApiProperty({ example: 'Apex Barber Studio' })
  name!: string;

  @ApiProperty({ example: 'apex-barber-studio-7a8b' })
  slug!: string;

  @ApiProperty({ example: 'Barbershop', nullable: true })
  type!: string | null;

  @ApiProperty({ example: 'Luxury grooming salon for men and women', nullable: true })
  description!: string | null;

  @ApiProperty({ example: '+919876543210', nullable: true })
  phone!: string | null;

  @ApiProperty({ example: 'contact@apexbarber.com', nullable: true })
  email!: string | null;

  @ApiProperty({ example: '123 High Street, Indiranagar, Bengaluru', nullable: true })
  location!: string | null;

  @ApiProperty({ example: 'Asia/Kolkata' })
  timezone!: string;

  @ApiProperty({ example: 'INR' })
  currency!: string;

  @ApiProperty({ example: 'https://example.com/logo.png', nullable: true })
  logoUrl!: string | null;

  @ApiProperty({ example: '#4F46E5' })
  primaryColor!: string;

  @ApiProperty({ example: '#6366F1' })
  secondaryColor!: string;

  @ApiProperty({ example: 'book.apexbarber.com', nullable: true })
  customDomain!: string | null;

  @ApiProperty({ example: 'Crafting styles since 2018', nullable: true })
  tagline!: string | null;

  @ApiProperty({ example: 'https://example.com/banner.jpg', nullable: true })
  bannerUrl!: string | null;

  @ApiProperty({
    example: {
      slotIntervalMinutes: 30,
      advanceBookingDays: 30,
      minNoticeMinutes: 60,
      cancellationNoticeHours: 24,
    },
  })
  bookingSettings!: {
    slotIntervalMinutes: number;
    advanceBookingDays: number;
    minNoticeMinutes: number;
    cancellationNoticeHours: number;
  };
}

export class PublicBookingConfirmationDto {
  @ApiProperty({ example: 'a1a2a3a4-e5f6-7890-abcd-ef1234567890' })
  appointmentId!: string;

  @ApiProperty({ example: 'CONFIRMED' })
  status!: string;

  @ApiProperty({ example: '2026-09-01T10:00:00.000Z' })
  startAt!: Date;

  @ApiProperty({ example: '2026-09-01T10:45:00.000Z' })
  endAt!: Date;

  @ApiProperty({ example: 'Classic Haircut' })
  serviceName!: string;

  @ApiProperty({ example: 'Alex Smith' })
  staffName!: string;

  @ApiProperty({ example: 49900 })
  price!: number;

  @ApiProperty({ example: 'INR' })
  currency!: string;

  @ApiProperty({ example: 'Apex Barber Studio' })
  businessName!: string;
}
