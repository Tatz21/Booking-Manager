import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateStaffDto {
  @ApiProperty({ example: 'Alex Smith', description: 'Staff member full name' })
  @IsString()
  @IsNotEmpty({ message: 'Staff name is required' })
  @MaxLength(100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name!: string;

  @ApiPropertyOptional({ example: 'alex.smith@example.com' })
  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email?: string;

  @ApiPropertyOptional({ example: '+919876543211' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: 'Master Stylist / Senior Barber' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  roleTitle?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: ['s1s2s3s4-e5f6-7890-abcd-ef1234567890'],
    description: 'Array of Service UUIDs this staff member is qualified to perform',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true, message: 'Each service ID must be a valid UUID' })
  serviceIds?: string[];
}
