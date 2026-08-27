import { PrismaService } from '../../database/prisma.service';
import { EmailProvider } from './providers/email.provider';
import { SmsWhatsappProvider } from './providers/sms-whatsapp.provider';
import { ConsoleNotificationProvider } from './providers/console-notification.provider';
export interface BookingNotificationDetails {
    businessId?: string;
    appointmentId?: string;
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
    servicePricePaise?: number;
    currency?: string;
    durationMinutes?: number;
    staffName: string;
    staffEmail?: string;
    startAt: Date;
    endAt?: Date;
    notes?: string;
    reason?: string;
}
export declare class NotificationsService {
    private readonly prisma;
    private readonly emailProvider;
    private readonly smsWhatsappProvider;
    private readonly legacyConsoleProvider;
    private readonly logger;
    constructor(prisma: PrismaService, emailProvider: EmailProvider, smsWhatsappProvider: SmsWhatsappProvider, legacyConsoleProvider: ConsoleNotificationProvider);
    sendAppointmentConfirmation(details: BookingNotificationDetails): Promise<{
        success: boolean;
    }>;
    sendAppointmentCancellation(details: BookingNotificationDetails): Promise<{
        success: boolean;
    }>;
    sendAppointmentReminder(details: BookingNotificationDetails, reminderType: '24H' | '2H'): Promise<{
        success: boolean;
    }>;
    private logNotification;
}
