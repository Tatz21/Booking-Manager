import { PaymentsService } from './payments.service';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { CreatePaymentOrderResponseDto, PaymentVerificationResponseDto } from './dto/payment-response.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    createSubscriptionOrder(businessId: string): Promise<CreatePaymentOrderResponseDto>;
    verifyPayment(businessId: string, dto: VerifyPaymentDto): Promise<PaymentVerificationResponseDto>;
}
