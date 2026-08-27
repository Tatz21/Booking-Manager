import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus } from '@prisma/client';

export class AppointmentResponseDto {
  @ApiProperty({ example: 'a1a2a3a4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'b1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  businessId!: string;

  @ApiProperty({ example: 'c1c2c3c4-e5f6-7890-abcd-ef1234567890' })
  customerId!: string;

  @ApiProperty({ example: 's1s2s3s4-e5f6-7890-abcd-ef1234567890' })
  serviceId!: string;

  @ApiProperty({ example: 'st1st2st3-e5f6-7890-abcd-ef1234567890' })
  staffId!: string;

  @ApiProperty({ example: '2026-09-01T10:00:00.000Z' })
  startAt!: Date;

  @ApiProperty({ example: '2026-09-01T10:45:00.000Z' })
  endAt!: Date;

  @ApiProperty({ enum: AppointmentStatus, example: AppointmentStatus.CONFIRMED })
  status!: AppointmentStatus;

  @ApiProperty({ example: 49900, description: 'Price in minor units (paise)' })
  price!: number;

  @ApiProperty({ example: 'INR' })
  currency!: string;

  @ApiProperty({ example: 'Special haircut', nullable: true })
  notes!: string | null;

  @ApiProperty({ example: null, nullable: true })
  cancelReason!: string | null;

  @ApiProperty({ example: '2026-08-25T18:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-08-25T18:00:00.000Z' })
  updatedAt!: Date;
}
