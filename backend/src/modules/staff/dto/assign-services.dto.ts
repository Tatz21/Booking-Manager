import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class AssignServicesDto {
  @ApiProperty({
    example: ['s1s2s3s4-e5f6-7890-abcd-ef1234567890'],
    description: 'Complete list of service UUIDs to assign to this staff member',
  })
  @IsArray()
  @IsUUID('4', { each: true, message: 'Each service ID must be a valid UUID' })
  serviceIds!: string[];
}
