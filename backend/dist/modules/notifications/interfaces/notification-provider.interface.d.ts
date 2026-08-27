export interface EmailAttachment {
    filename: string;
    content: string;
    contentType?: string;
}
export interface EmailPayload {
    to: string;
    recipientName: string;
    subject: string;
    title: string;
    html: string;
    text: string;
    attachments?: EmailAttachment[];
    metadata?: Record<string, any>;
}
export interface SmsWhatsappPayload {
    to: string;
    recipientName: string;
    channel: 'SMS' | 'WHATSAPP';
    message: string;
    templateId?: string;
    metadata?: Record<string, any>;
}
export interface NotificationResult {
    success: boolean;
    messageId?: string;
    channel: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'IN_APP';
    error?: string;
}
export interface IEmailProvider {
    sendEmail(payload: EmailPayload): Promise<NotificationResult>;
}
export interface ISmsWhatsappProvider {
    sendSms(payload: SmsWhatsappPayload): Promise<NotificationResult>;
    sendWhatsApp(payload: SmsWhatsappPayload): Promise<NotificationResult>;
}
export interface NotificationPayload {
    recipientEmail: string;
    recipientName: string;
    subject: string;
    title: string;
    message: string;
    metadata?: Record<string, any>;
}
export interface INotificationProvider {
    send(payload: NotificationPayload): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
}
