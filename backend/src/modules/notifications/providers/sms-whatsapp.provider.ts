import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ISmsWhatsappProvider,
  SmsWhatsappPayload,
  NotificationResult,
} from '../interfaces/notification-provider.interface';

@Injectable()
export class SmsWhatsappProvider implements ISmsWhatsappProvider {
  private readonly logger = new Logger(SmsWhatsappProvider.name);
  private readonly twilioAccountSid?: string;
  private readonly twilioAuthToken?: string;
  private readonly twilioPhoneNumber?: string;
  private readonly twilioWhatsAppNumber?: string;
  private readonly isTwilioConfigured: boolean;

  constructor(private readonly configService: ConfigService) {
    this.twilioAccountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    this.twilioAuthToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.twilioPhoneNumber = this.configService.get<string>('TWILIO_PHONE_NUMBER');
    this.twilioWhatsAppNumber = this.configService.get<string>('TWILIO_WHATSAPP_NUMBER');

    this.isTwilioConfigured = !!(
      this.twilioAccountSid &&
      this.twilioAuthToken &&
      this.twilioPhoneNumber
    );

    if (this.isTwilioConfigured) {
      this.logger.log('📱 Twilio SMS & WhatsApp Gateway is configured and ready');
    } else {
      this.logger.log('📱 SMS & WhatsApp Gateway in development console mode');
    }
  }

  /**
   * Send SMS via Twilio or Console fallback
   */
  async sendSms(payload: SmsWhatsappPayload): Promise<NotificationResult> {
    if (this.isTwilioConfigured) {
      try {
        const auth = Buffer.from(
          `${this.twilioAccountSid}:${this.twilioAuthToken}`,
        ).toString('base64');

        const params = new URLSearchParams({
          From: this.twilioPhoneNumber!,
          To: payload.to,
          Body: payload.message,
        });

        const res = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${this.twilioAccountSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              Authorization: `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
          },
        );

        const data: any = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Twilio SMS dispatch failed');
        }

        this.logger.log(`📱 Live SMS sent to ${payload.to} (SID: ${data.sid})`);
        return {
          success: true,
          messageId: data.sid,
          channel: 'SMS',
        };
      } catch (err: any) {
        this.logger.error(`Failed to send SMS to ${payload.to}: ${err.message}`);
        return {
          success: false,
          channel: 'SMS',
          error: err.message,
        };
      }
    }

    // Development Console Simulation
    this.logger.log(
      `\n================= 💬 [DEV SMS NOTIFICATION] =================\n` +
        `To: ${payload.to} (${payload.recipientName})\n` +
        `Message: ${payload.message}\n` +
        `============================================================\n`,
    );

    return {
      success: true,
      messageId: `dev-sms-${Date.now()}`,
      channel: 'SMS',
    };
  }

  /**
   * Send WhatsApp Message via Twilio WhatsApp Gateway or Console fallback
   */
  async sendWhatsApp(payload: SmsWhatsappPayload): Promise<NotificationResult> {
    const waFrom = this.twilioWhatsAppNumber || (this.twilioPhoneNumber ? `whatsapp:${this.twilioPhoneNumber}` : null);

    if (this.isTwilioConfigured && waFrom) {
      try {
        const auth = Buffer.from(
          `${this.twilioAccountSid}:${this.twilioAuthToken}`,
        ).toString('base64');

        const toWa = payload.to.startsWith('whatsapp:') ? payload.to : `whatsapp:${payload.to}`;
        const fromWa = waFrom.startsWith('whatsapp:') ? waFrom : `whatsapp:${waFrom}`;

        const params = new URLSearchParams({
          From: fromWa,
          To: toWa,
          Body: payload.message,
        });

        const res = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${this.twilioAccountSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              Authorization: `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
          },
        );

        const data: any = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Twilio WhatsApp dispatch failed');
        }

        this.logger.log(`🟢 Live WhatsApp sent to ${payload.to} (SID: ${data.sid})`);
        return {
          success: true,
          messageId: data.sid,
          channel: 'WHATSAPP',
        };
      } catch (err: any) {
        this.logger.error(`Failed to send WhatsApp message to ${payload.to}: ${err.message}`);
        return {
          success: false,
          channel: 'WHATSAPP',
          error: err.message,
        };
      }
    }

    // Development Console Simulation
    this.logger.log(
      `\n============= 🟢 [DEV WHATSAPP NOTIFICATION] =============\n` +
        `To: ${payload.to} (${payload.recipientName})\n` +
        `Message: ${payload.message}\n` +
        `==========================================================\n`,
    );

    return {
      success: true,
      messageId: `dev-wa-${Date.now()}`,
      channel: 'WHATSAPP',
    };
  }

  /**
   * Helper: Format standard SMS / WhatsApp booking confirmation text
   */
  formatBookingConfirmation(data: {
    customerName: string;
    businessName: string;
    serviceName: string;
    staffName: string;
    startAt: Date;
    businessLocation?: string;
  }): string {
    const dateStr = data.startAt.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    const timeStr = data.startAt.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `Hi ${data.customerName}! Your appointment for "${data.serviceName}" with ${data.staffName} at ${data.businessName} is confirmed for ${dateStr} at ${timeStr}.${data.businessLocation ? ` Location: ${data.businessLocation}` : ''} See you soon!`;
  }

  /**
   * Helper: Format reminder text (24h or 2h)
   */
  formatReminderMessage(data: {
    customerName: string;
    businessName: string;
    serviceName: string;
    staffName: string;
    startAt: Date;
    reminderType: '24H' | '2H';
    businessLocation?: string;
  }): string {
    const timeFrame = data.reminderType === '24H' ? 'tomorrow' : 'in 2 hours';
    const timeStr = data.startAt.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `Reminder from ${data.businessName}: Your ${data.serviceName} appointment with ${data.staffName} is ${timeFrame} at ${timeStr}.${data.businessLocation ? ` Location: ${data.businessLocation}` : ''}`;
  }

  /**
   * Helper: Format cancellation text
   */
  formatCancellationMessage(data: {
    customerName: string;
    businessName: string;
    serviceName: string;
    startAt: Date;
    reason?: string;
  }): string {
    const timeStr = data.startAt.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return `Notice: Your ${data.serviceName} booking at ${data.businessName} on ${timeStr} has been cancelled.${data.reason ? ` Reason: ${data.reason}` : ''}`;
  }
}
