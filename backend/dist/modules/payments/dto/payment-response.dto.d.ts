export declare class CreatePaymentOrderResponseDto {
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
    businessName: string;
}
export declare class PaymentVerificationResponseDto {
    success: boolean;
    message: string;
    subscriptionStatus: string;
    currentPeriodEnd: Date;
}
