import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class RazorpayService {
  private readonly logger = new Logger(RazorpayService.name);

  constructor(private readonly configService: ConfigService) {}

  getKeyId(): string {
    return this.configService.get<string>('RAZORPAY_KEY_ID', 'rzp_test_placeholder');
  }

  private getKeySecret(): string {
    return this.configService.get<string>('RAZORPAY_KEY_SECRET', 'rzp_test_secret_placeholder');
  }

  private getWebhookSecret(): string {
    return this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET', 'rzp_webhook_secret_placeholder');
  }

  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
    try {
      const secret = this.getKeySecret();
      const body = `${orderId}|${paymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature, 'utf8'),
        Buffer.from(expectedSignature, 'utf8'),
      );
    } catch (err) {
      this.logger.error('Error verifying payment signature', err);
      return false;
    }
  }

  verifyWebhookSignature(rawBody: string | Buffer, signature: string): boolean {
    try {
      const secret = this.getWebhookSecret();
      const payload = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature, 'utf8'),
        Buffer.from(expectedSignature, 'utf8'),
      );
    } catch (err) {
      this.logger.error('Error verifying webhook signature', err);
      return false;
    }
  }

  generateOrderId(): string {
    return `order_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }
}
