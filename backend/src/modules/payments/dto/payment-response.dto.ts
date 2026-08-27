import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentOrderResponseDto {
  @ApiProperty({ example: 'order_NxABC123456789' })
  orderId!: string;

  @ApiProperty({ example: 19900, description: 'Amount in minor currency units (paise: ₹199 = 19900)' })
  amount!: number;

  @ApiProperty({ example: 'INR' })
  currency!: string;

  @ApiProperty({ example: 'rzp_test_placeholder' })
  keyId!: string;

  @ApiProperty({ example: 'Apex Barber Studio' })
  businessName!: string;
}

export class PaymentVerificationResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'Subscription activated successfully' })
  message!: string;

  @ApiProperty({ example: 'ACTIVE' })
  subscriptionStatus!: string;

  @ApiProperty({ example: '2026-09-25T18:00:00.000Z' })
  currentPeriodEnd!: Date;
}
