import { ConfigService } from '@nestjs/config';
import { IEmailProvider, EmailPayload, NotificationResult } from '../interfaces/notification-provider.interface';
export interface BookingEmailData {
    businessName: string;
    businessSlug?: string;
    businessEmail?: string;
    businessPhone?: string;
    businessLocation?: string;
    primaryColor?: string;
    logoUrl?: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    serviceName: string;
    servicePricePaise: number;
    currency: string;
    durationMinutes: number;
    staffName: string;
    startAt: Date;
    endAt: Date;
    notes?: string;
    cancellationReason?: string;
    appointmentId?: string;
}
export declare class EmailProvider implements IEmailProvider {
    private readonly configService;
    private readonly logger;
    private transporter;
    private readonly fromEmail;
    private readonly isConfigured;
    constructor(configService: ConfigService);
    sendEmail(payload: EmailPayload): Promise<NotificationResult>;
    generateIcsContent(data: BookingEmailData): string;
    generateGoogleCalendarUrl(data: BookingEmailData): string;
    renderCustomerConfirmationHtml(data: BookingEmailData): string;
    renderStaffAlertHtml(data: BookingEmailData): string;
    renderReminderHtml(data: BookingEmailData, reminderType: '24H' | '2H'): string;
    renderCancellationHtml(data: BookingEmailData): string;
}
