import { ApiProperty } from '@nestjs/swagger';

export class ServiceResponseDto {
  @ApiProperty({ example: 's1s2s3s4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'b1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  businessId!: string;

  @ApiProperty({ example: 'Classic Haircut' })
  name!: string;

  @ApiProperty({ example: 'Precision cut and styling', nullable: true })
  description!: string | null;

  @ApiProperty({ example: 45 })
  durationMinutes!: number;

  @ApiProperty({ example: 49900, description: 'Price in minor currency units (paise)' })
  price!: number;

  @ApiProperty({ example: 'INR' })
  currency!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: '2026-08-25T18:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-08-25T18:00:00.000Z' })
  updatedAt!: Date;
}
