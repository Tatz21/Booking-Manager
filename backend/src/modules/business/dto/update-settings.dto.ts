import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdateBookingSettingsDto {
  @ApiPropertyOptional({ example: 30, description: 'Slot duration interval in minutes' })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(240)
  slotIntervalMinutes?: number;

  @ApiPropertyOptional({ example: 30, description: 'How many days in advance customers can book' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  advanceBookingDays?: number;

  @ApiPropertyOptional({ example: 60, description: 'Minimum lead time in minutes required before appointment' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1440)
  minNoticeMinutes?: number;

  @ApiPropertyOptional({ example: 24, description: 'Minimum notice in hours required for customer cancellation' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(168)
  cancellationNoticeHours?: number;
}
