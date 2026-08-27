import { ApiProperty } from '@nestjs/swagger';

export class UserSummaryDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'john.owner@example.com' })
  email!: string;

  @ApiProperty({ example: 'John Doe' })
  name!: string;

  @ApiProperty({ example: 'OWNER' })
  role!: string;
}

export class BusinessSummaryDto {
  @ApiProperty({ example: 'b1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'Apex Barber Studio' })
  name!: string;

  @ApiProperty({ example: 'apex-barber-studio-7a8b' })
  slug!: string;

  @ApiProperty({ example: 'Asia/Kolkata' })
  timezone!: string;

  @ApiProperty({ example: 'INR' })
  currency!: string;
}

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken!: string;

  @ApiProperty({ example: 'd3b07384d113edec49eaa6238ad5ff00...' })
  refreshToken!: string;

  @ApiProperty({ example: 900, description: 'Access token expiration in seconds (15 minutes)' })
  expiresIn!: number;

  @ApiProperty({ type: UserSummaryDto })
  user!: UserSummaryDto;

  @ApiProperty({ type: BusinessSummaryDto })
  business!: BusinessSummaryDto;
}

export class TokenRefreshResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken!: string;

  @ApiProperty({ example: 'd3b07384d113edec49eaa6238ad5ff00...' })
  refreshToken!: string;

  @ApiProperty({ example: 900 })
  expiresIn!: number;
}
