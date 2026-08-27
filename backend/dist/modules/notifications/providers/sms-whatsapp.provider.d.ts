import { ConfigService } from '@nestjs/config';
import { ISmsWhatsappProvider, SmsWhatsappPayload, NotificationResult } from '../interfaces/notification-provider.interface';
export declare class SmsWhatsappProvider implements ISmsWhatsappProvider {
    private readonly configService;
    private readonly logger;
    private readonly twilioAccountSid?;
    private readonly twilioAuthToken?;
    private readonly twilioPhoneNumber?;
    private readonly twilioWhatsAppNumber?;
    private readonly isTwilioConfigured;
    constructor(configService: ConfigService);
    sendSms(payload: SmsWhatsappPayload): Promise<NotificationResult>;
    sendWhatsApp(payload: SmsWhatsappPayload): Promise<NotificationResult>;
    formatBookingConfirmation(data: {
        customerName: string;
        businessName: string;
        serviceName: string;
        staffName: string;
        startAt: Date;
        businessLocation?: string;
    }): string;
    formatReminderMessage(data: {
        customerName: string;
        businessName: string;
        serviceName: string;
        staffName: string;
        startAt: Date;
        reminderType: '24H' | '2H';
        businessLocation?: string;
    }): string;
    formatCancellationMessage(data: {
        customerName: string;
        businessName: string;
        serviceName: string;
        startAt: Date;
        reason?: string;
    }): string;
}
