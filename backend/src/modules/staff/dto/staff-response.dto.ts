import { ApiProperty } from '@nestjs/swagger';

export class StaffResponseDto {
  @ApiProperty({ example: 'st1st2st3-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'b1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  businessId!: string;

  @ApiProperty({ example: 'Alex Smith' })
  name!: string;

  @ApiProperty({ example: 'alex.smith@example.com', nullable: true })
  email!: string | null;

  @ApiProperty({ example: '+919876543211', nullable: true })
  phone!: string | null;

  @ApiProperty({ example: 'Senior Stylist', nullable: true })
  roleTitle!: string | null;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: '2026-08-25T18:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-08-25T18:00:00.000Z' })
  updatedAt!: Date;
}
