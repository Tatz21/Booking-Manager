import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @ApiProperty({ example: 'john.owner@example.com', description: 'Business owner email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    example: 'StrongP@ssw0rd!',
    description: 'Password containing at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
    },
  )
  password!: string;

  @ApiProperty({ example: 'John Doe', description: 'Business owner full name' })
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name!: string;

  @ApiProperty({ example: '+919876543210', required: false, description: 'Owner phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'Apex Barber Studio', description: 'Business name' })
  @IsString()
  @IsNotEmpty({ message: 'Business name is required' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  businessName!: string;

  @ApiProperty({ example: 'Barbershop', required: false, description: 'Type of business (e.g. Salon, Clinic, Studio)' })
  @IsOptional()
  @IsString()
  businessType?: string;

  @ApiProperty({ example: 'Asia/Kolkata', required: false, description: 'IANA Timezone (defaults to Asia/Kolkata)' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ example: 'INR', required: false, description: 'Currency code (defaults to INR)' })
  @IsOptional()
  @IsString()
  currency?: string;
}
