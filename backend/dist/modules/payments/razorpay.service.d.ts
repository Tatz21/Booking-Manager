import { ConfigService } from '@nestjs/config';
export declare class RazorpayService {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    getKeyId(): string;
    private getKeySecret;
    private getWebhookSecret;
    verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean;
    verifyWebhookSignature(rawBody: string | Buffer, signature: string): boolean;
    generateOrderId(): string;
}
