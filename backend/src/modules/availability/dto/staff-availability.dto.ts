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
import { BreakTimeDto } from './business-hours.dto';

export class StaffDayShiftDto {
  @ApiProperty({ example: 1, description: 'Day of week: 0=Sun, 1=Mon, ..., 6=Sat' })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @ApiProperty({ example: '09:00', description: 'Shift start time (HH:MM)' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Start time must be in HH:MM format' })
  startTime!: string;

  @ApiProperty({ example: '18:00', description: 'Shift end time (HH:MM)' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'End time must be in HH:MM format' })
  endTime!: string;

  @ApiPropertyOptional({ example: false, description: 'True if staff is off duty this day' })
  @IsOptional()
  @IsBoolean()
  isOff?: boolean;

  @ApiPropertyOptional({ type: [BreakTimeDto], description: 'Optional list of staff break intervals' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BreakTimeDto)
  breaks?: BreakTimeDto[];
}

export class SetStaffAvailabilityDto {
  @ApiProperty({ type: [StaffDayShiftDto], description: 'Array of shift configurations for staff member' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StaffDayShiftDto)
  shifts!: StaffDayShiftDto[];
}
