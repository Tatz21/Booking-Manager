import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateServiceDto {
  @ApiProperty({ example: 'Classic Haircut & Beard Trim', description: 'Service name' })
  @IsString()
  @IsNotEmpty({ message: 'Service name is required' })
  @MaxLength(100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name!: string;

  @ApiPropertyOptional({ example: 'Includes hair wash, precision cut, and beard sculpting with hot towel' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ example: 45, description: 'Duration in minutes' })
  @IsInt()
  @Min(5, { message: 'Duration must be at least 5 minutes' })
  @Max(480, { message: 'Duration cannot exceed 480 minutes (8 hours)' })
  durationMinutes!: number;

  @ApiProperty({
    example: 49900,
    description: 'Price in minor currency units (paise: ₹499 = 49900)',
  })
  @IsInt({ message: 'Price must be an integer in minor units (e.g., paise)' })
  @Min(0, { message: 'Price cannot be negative' })
  price!: number;

  @ApiPropertyOptional({ example: 'INR', description: '3-letter ISO currency code' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ example: true, description: 'Whether the service is active and bookable' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
