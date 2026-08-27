import { PrismaService } from '../../database/prisma.service';
import { RazorpayService } from './razorpay.service';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { CreatePaymentOrderResponseDto, PaymentVerificationResponseDto } from './dto/payment-response.dto';
export declare class PaymentsService {
    private readonly prisma;
    private readonly razorpayService;
    private readonly logger;
    private readonly SUBSCRIPTION_PRICE_PAISE;
    constructor(prisma: PrismaService, razorpayService: RazorpayService);
    createSubscriptionOrder(businessId: string): Promise<CreatePaymentOrderResponseDto>;
    verifyPayment(businessId: string, dto: VerifyPaymentDto): Promise<PaymentVerificationResponseDto>;
    processWebhook(rawBody: string | Buffer, signature: string, payload: any): Promise<{
        status: string;
        message: string;
    }>;
}
