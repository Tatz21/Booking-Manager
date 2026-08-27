import { ApiProperty } from '@nestjs/swagger';

export class CustomerResponseDto {
  @ApiProperty({ example: 'c1c2c3c4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'b1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  businessId!: string;

  @ApiProperty({ example: 'Jane Smith' })
  name!: string;

  @ApiProperty({ example: 'jane.smith@example.com' })
  email!: string;

  @ApiProperty({ example: '+919876543210' })
  phone!: string;

  @ApiProperty({ example: 'VIP Customer', nullable: true })
  notes!: string | null;

  @ApiProperty({ example: '2026-08-25T18:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-08-25T18:00:00.000Z' })
  updatedAt!: Date;
}
