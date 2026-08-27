import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAppointmentDto {
  @ApiProperty({ example: 's1s2s3s4-e5f6-7890-abcd-ef1234567890', description: 'Service UUID' })
  @IsUUID('4')
  @IsNotEmpty()
  serviceId!: string;

  @ApiProperty({ example: 'st1st2st3-e5f6-7890-abcd-ef1234567890', description: 'Staff UUID' })
  @IsUUID('4')
  @IsNotEmpty()
  staffId!: string;

  @ApiProperty({
    example: '2026-09-01T10:00:00.000Z',
    description: 'Appointment start timestamp in UTC ISO-8601 format',
  })
  @IsDateString()
  @IsNotEmpty()
  startAt!: string;

  @ApiPropertyOptional({
    example: 'c1c2c3c4-e5f6-7890-abcd-ef1234567890',
    description: 'Optional existing Customer UUID (if omitted, customer details below must be supplied)',
  })
  @IsOptional()
  @IsUUID('4')
  customerId?: string;

  @ApiPropertyOptional({ example: 'John Customer', description: 'Customer full name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  customerName?: string;

  @ApiPropertyOptional({ example: 'john.customer@example.com', description: 'Customer email' })
  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  customerEmail?: string;

  @ApiPropertyOptional({ example: '+919876543210', description: 'Customer phone number' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  customerPhone?: string;

  @ApiPropertyOptional({ example: 'Prefers low noise, beard trim first' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
