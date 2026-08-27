import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class QuerySlotsDto {
  @ApiProperty({ example: '2026-09-01', description: 'Date in YYYY-MM-DD format' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be formatted as YYYY-MM-DD' })
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
