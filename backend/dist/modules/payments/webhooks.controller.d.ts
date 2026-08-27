import { Request } from 'express';
import { PaymentsService } from './payments.service';
export declare class WebhooksController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    handleRazorpayWebhook(signature: string, payload: any, req: Request): Promise<{
        status: string;
        message: string;
    }>;
}
