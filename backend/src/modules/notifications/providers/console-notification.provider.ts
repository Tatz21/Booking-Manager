import { Injectable, Logger } from '@nestjs/common';
import { INotificationProvider, NotificationPayload } from '../interfaces/notification-provider.interface';

@Injectable()
export class ConsoleNotificationProvider implements INotificationProvider {
  private readonly logger = new Logger('NotificationService');

  async send(payload: NotificationPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      this.logger.log(
        `[EMAIL NOTIFICATION DISPATCHED] To: ${payload.recipientEmail} (${payload.recipientName}) | Subject: "${payload.subject}" | Message: ${payload.message}`,
      );
      return { success: true, messageId: `msg_${Date.now()}` };
    } catch (err: any) {
      this.logger.error(`Failed to dispatch notification to ${payload.recipientEmail}`, err);
      return { success: false, error: err.message };
    }
  }
}
