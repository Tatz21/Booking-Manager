import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BreakTimeDto {
  @ApiProperty({ example: '13:00', description: 'Break start time (HH:MM in 24-hr format)' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Break start time must be in HH:MM format' })
  start!: string;

  @ApiProperty({ example: '14:00', description: 'Break end time (HH:MM in 24-hr format)' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Break end time must be in HH:MM format' })
  end!: string;
}

export class DayHoursDto {
  @ApiProperty({ example: 1, description: 'Day of week: 0=Sun, 1=Mon, ..., 6=Sat' })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @ApiProperty({ example: '09:00', description: 'Opening time (HH:MM)' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Open time must be in HH:MM format' })
  openTime!: string;

  @ApiProperty({ example: '18:00', description: 'Closing time (HH:MM)' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Close time must be in HH:MM format' })
  closeTime!: string;

  @ApiPropertyOptional({ example: false, description: 'True if business is closed this day' })
  @IsOptional()
  @IsBoolean()
  isClosed?: boolean;

  @ApiPropertyOptional({ type: [BreakTimeDto], description: 'Optional list of break intervals' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BreakTimeDto)
  breaks?: BreakTimeDto[];
}

export class SetBusinessHoursDto {
  @ApiProperty({ type: [DayHoursDto], description: 'Array of 7 day configurations (0-6)' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DayHoursDto)
  hours!: DayHoursDto[];
}
