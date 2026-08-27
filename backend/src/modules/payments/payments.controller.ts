import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import {
  CreatePaymentOrderResponseDto,
  PaymentVerificationResponseDto,
} from './dto/payment-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentBusinessId } from '../../common/decorators/current-user.decorator';
import { BusinessRole } from '@prisma/client';

@ApiTags('Payments & Subscriptions')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-subscription')
  @Roles(BusinessRole.OWNER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Initiate Razorpay order for ₹199/month subscription',
    description: 'Generates an order for ₹199 (19900 paise) without exposing backend secrets.',
  })
  @ApiResponse({
    status: 201,
    description: 'Order created',
    type: CreatePaymentOrderResponseDto,
  })
  async createSubscriptionOrder(
    @CurrentBusinessId() businessId: string,
  ): Promise<CreatePaymentOrderResponseDto> {
    return this.paymentsService.createSubscriptionOrder(businessId);
  }

  @Post('verify')
  @Roles(BusinessRole.OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify Razorpay payment signature and activate subscription',
    description:
      'Cryptographically validates HMAC-SHA256 signature and activates the 30-day billing cycle for the business.',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription successfully activated',
    type: PaymentVerificationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid payment signature',
  })
  async verifyPayment(
    @CurrentBusinessId() businessId: string,
    @Body() dto: VerifyPaymentDto,
  ): Promise<PaymentVerificationResponseDto> {
    return this.paymentsService.verifyPayment(businessId, dto);
  }
}
