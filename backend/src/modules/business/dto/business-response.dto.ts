import { ApiProperty } from '@nestjs/swagger';

export class BusinessProfileDto {
  @ApiProperty({ example: 'b1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'Apex Barber Studio' })
  name!: string;

  @ApiProperty({ example: 'apex-barber-studio-7a8b' })
  slug!: string;

  @ApiProperty({ example: 'Barbershop', nullable: true })
  type!: string | null;

  @ApiProperty({ example: 'Premium haircut salon', nullable: true })
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

  @ApiProperty({ example: '2026-08-25T17:50:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-08-25T17:50:00.000Z' })
  updatedAt!: Date;
}
