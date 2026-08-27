import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class PublicBookingRequestDto {
  @ApiProperty({ example: 'srv-luxe-1', description: 'Service identifier or UUID' })
  @IsString()
  @IsNotEmpty()
  serviceId!: string;

  @ApiPropertyOptional({ example: 'stf-luxe-1', description: 'Staff identifier or UUID' })
  @IsOptional()
  @IsString()
  staffId?: string;

  @ApiProperty({
    example: '2026-09-01T10:00:00.000Z',
    description: 'Appointment start timestamp in UTC ISO format',
  })
  @IsDateString()
  @IsNotEmpty()
  startAt!: string;

  @ApiProperty({ example: 'Alex Johnson', description: 'Customer full name' })
  @IsString()
  @IsNotEmpty({ message: 'Customer name is required' })
  @MaxLength(100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  customerName!: string;

  @ApiProperty({ example: 'alex.johnson@example.com', description: 'Customer email' })
  @IsEmail({}, { message: 'Valid email is required for booking confirmation' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsNotEmpty()
  customerEmail!: string;

  @ApiProperty({ example: '+919876543210', description: 'Customer phone number' })
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required for booking confirmation' })
  @MaxLength(20)
  customerPhone!: string;

  @ApiPropertyOptional({ example: 'Please prepare the beard trim first' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class PublicAvailabilityQueryDto {
  @ApiProperty({ example: '2026-09-01', description: 'Date formatted as YYYY-MM-DD' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be in YYYY-MM-DD format' })
  date!: string;

  @ApiProperty({ example: 'srv-luxe-1', description: 'Service identifier or UUID' })
  @IsString()
  @IsNotEmpty()
  serviceId!: string;

  @ApiPropertyOptional({ example: 'stf-luxe-1', description: 'Optional Staff identifier or UUID' })
  @IsOptional()
  @IsString()
  staffId?: string;
}
