import { INotificationProvider, NotificationPayload } from '../interfaces/notification-provider.interface';
export declare class ConsoleNotificationProvider implements INotificationProvider {
    private readonly logger;
    send(payload: NotificationPayload): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
}
