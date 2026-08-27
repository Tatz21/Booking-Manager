import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CancelAppointmentDto {
  @ApiPropertyOptional({ example: 'Customer requested reschedule / emergency', description: 'Reason for cancellation' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
