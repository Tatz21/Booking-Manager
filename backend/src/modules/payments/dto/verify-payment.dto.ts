import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyPaymentDto {
  @ApiProperty({ example: 'order_NxABC123456789', description: 'Razorpay Order ID' })
  @IsString()
  @IsNotEmpty()
  razorpayOrderId!: string;

  @ApiProperty({ example: 'pay_NxXYZ987654321', description: 'Razorpay Payment ID' })
  @IsString()
  @IsNotEmpty()
  razorpayPaymentId!: string;

  @ApiProperty({ example: 'a1b2c3d4e5f6g7h8...', description: 'HMAC-SHA256 signature from Razorpay checkout' })
  @IsString()
  @IsNotEmpty()
  razorpaySignature!: string;
}
