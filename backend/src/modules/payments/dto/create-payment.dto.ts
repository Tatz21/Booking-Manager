import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateSubscriptionPaymentDto {
  @ApiPropertyOptional({ example: 'MONTHLY_STANDARD', default: 'MONTHLY_STANDARD' })
  @IsOptional()
  @IsString()
  plan?: string = 'MONTHLY_STANDARD';
}
