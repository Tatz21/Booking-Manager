import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RazorpayService } from './razorpay.service';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import {
  CreatePaymentOrderResponseDto,
  PaymentVerificationResponseDto,
} from './dto/payment-response.dto';
import { PaymentStatus, SubscriptionStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly SUBSCRIPTION_PRICE_PAISE = 19900; // ₹199 in minor units

  constructor(
    private readonly prisma: PrismaService,
    private readonly razorpayService: RazorpayService,
  ) {}

  async createSubscriptionOrder(businessId: string): Promise<CreatePaymentOrderResponseDto> {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      include: { subscription: true },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const orderId = this.razorpayService.generateOrderId();

    await this.prisma.payment.create({
      data: {
        businessId,
        subscriptionId: business.subscription?.id,
        amount: this.SUBSCRIPTION_PRICE_PAISE,
        currency: 'INR',
        status: PaymentStatus.PENDING,
        razorpayOrderId: orderId,
      },
    });

    return {
      orderId,
      amount: this.SUBSCRIPTION_PRICE_PAISE,
      currency: 'INR',
      keyId: this.razorpayService.getKeyId(),
      businessName: business.name,
    };
  }

  async verifyPayment(
    businessId: string,
    dto: VerifyPaymentDto,
  ): Promise<PaymentVerificationResponseDto> {
    const isValid = this.razorpayService.verifyPaymentSignature(
      dto.razorpayOrderId,
      dto.razorpayPaymentId,
      dto.razorpaySignature,
    );

    if (!isValid) {
      this.logger.warn(
        `Invalid signature detected for order ${dto.razorpayOrderId} / payment ${dto.razorpayPaymentId}`,
      );
      throw new BadRequestException('Invalid payment signature');
    }

    const payment = await this.prisma.payment.findFirst({
      where: { razorpayOrderId: dto.razorpayOrderId, businessId },
    });

    if (!payment) {
      throw new NotFoundException('Payment order not found for this business');
    }

    const now = new Date();
    const periodDays = 30;
    const currentPeriodEnd = new Date(now.getTime() + periodDays * 24 * 60 * 60 * 1000);

    await this.prisma.$transaction(async (tx) => {
      // 1. Mark payment SUCCESS
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.SUCCESS,
          razorpayPaymentId: dto.razorpayPaymentId,
          razorpaySignature: dto.razorpaySignature,
        },
      });

      // 2. Activate Subscription
      await tx.subscription.upsert({
        where: { businessId },
        update: {
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: now,
          currentPeriodEnd,
        },
        create: {
          businessId,
          plan: 'MONTHLY_STANDARD',
          status: SubscriptionStatus.ACTIVE,
          trialStart: now,
          trialEnd: now,
          currentPeriodStart: now,
          currentPeriodEnd,
        },
      });

      // 3. Log Audit
      await tx.auditLog.create({
        data: {
          businessId,
          action: 'SUBSCRIPTION_ACTIVATED',
          entityType: 'Subscription',
          entityId: payment.subscriptionId,
          payloadJson: {
            orderId: dto.razorpayOrderId,
            paymentId: dto.razorpayPaymentId,
            amount: payment.amount,
          },
        },
      });
    });

    return {
      success: true,
      message: 'Subscription activated successfully for ₹199/month',
      subscriptionStatus: 'ACTIVE',
      currentPeriodEnd,
    };
  }

  async processWebhook(
    rawBody: string | Buffer,
    signature: string,
    payload: any,
  ): Promise<{ status: string; message: string }> {
    if (!signature) {
      throw new UnauthorizedException('Missing X-Razorpay-Signature header');
    }

    const isValid = this.razorpayService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    const event = payload?.event;
    this.logger.log(`Received verified Razorpay webhook event: ${event}`);

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload?.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;

      if (!orderId) {
        return { status: 'ignored', message: 'No order_id in webhook payload' };
      }

      // Check idempotency: if payment is already recorded as SUCCESS, do not duplicate
      const existingPayment = await this.prisma.payment.findFirst({
        where: {
          OR: [{ razorpayOrderId: orderId }, { razorpayPaymentId: paymentId }],
        },
      });

      if (existingPayment && existingPayment.status === PaymentStatus.SUCCESS) {
        return { status: 'already_processed', message: 'Event was already processed' };
      }

      if (existingPayment) {
        const now = new Date();
        const currentPeriodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        await this.prisma.$transaction(async (tx) => {
          await tx.payment.update({
            where: { id: existingPayment.id },
            data: {
              status: PaymentStatus.SUCCESS,
              razorpayPaymentId: paymentId,
            },
          });

          await tx.subscription.update({
            where: { businessId: existingPayment.businessId },
            data: {
              status: SubscriptionStatus.ACTIVE,
              currentPeriodStart: now,
              currentPeriodEnd,
            },
          });
        });
      }
    } else if (event === 'subscription.cancelled' || event === 'subscription.halted') {
      const subEntity = payload?.payload?.subscription?.entity;
      const razorpaySubscriptionId = subEntity?.id;

      if (razorpaySubscriptionId) {
        await this.prisma.subscription.updateMany({
          where: { razorpaySubscriptionId },
          data: { status: SubscriptionStatus.CANCELLED },
        });
      }
    }

    return { status: 'success', message: 'Webhook handled' };
  }
}
