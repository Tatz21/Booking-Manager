import { Global, Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { EmailProvider } from './providers/email.provider';
import { SmsWhatsappProvider } from './providers/sms-whatsapp.provider';
import { ConsoleNotificationProvider } from './providers/console-notification.provider';
import { ReminderCronService } from './reminder-cron.service';

@Global()
@Module({
  providers: [
    NotificationsService,
    EmailProvider,
    SmsWhatsappProvider,
    ConsoleNotificationProvider,
    ReminderCronService,
  ],
  exports: [
    NotificationsService,
    EmailProvider,
    SmsWhatsappProvider,
    ReminderCronService,
  ],
})
export class NotificationsModule {}
