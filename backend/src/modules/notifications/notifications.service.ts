import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EmailProvider, BookingEmailData } from './providers/email.provider';
import { SmsWhatsappProvider } from './providers/sms-whatsapp.provider';
import { ConsoleNotificationProvider } from './providers/console-notification.provider';
import {
  NotificationChannel,
  NotificationType,
  NotificationStatus,
} from '@prisma/client';

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

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailProvider: EmailProvider,
    private readonly smsWhatsappProvider: SmsWhatsappProvider,
    private readonly legacyConsoleProvider: ConsoleNotificationProvider,
  ) {}

  /**
   * Dispatch full confirmation suite (Customer Email + .ics, Staff Alert, Customer SMS / WhatsApp)
   */
  async sendAppointmentConfirmation(details: BookingNotificationDetails) {
    const data: BookingEmailData = {
      businessName: details.businessName,
      businessSlug: details.businessSlug,
      businessEmail: details.businessEmail,
      businessPhone: details.businessPhone,
      businessLocation: details.businessLocation,
      primaryColor: details.primaryColor || '#4F46E5',
      logoUrl: details.logoUrl,
      customerName: details.customerName,
      customerEmail: details.customerEmail,
      customerPhone: details.customerPhone,
      serviceName: details.serviceName,
      servicePricePaise: details.servicePricePaise || 0,
      currency: details.currency || 'INR',
      durationMinutes: details.durationMinutes || 30,
      staffName: details.staffName,
      startAt: new Date(details.startAt),
      endAt: details.endAt
        ? new Date(details.endAt)
        : new Date(new Date(details.startAt).getTime() + (details.durationMinutes || 30) * 60 * 1000),
      notes: details.notes,
      appointmentId: details.appointmentId,
    };

    // 1. Send Customer Email with iCalendar (.ics) attachment
    const icsContent = this.emailProvider.generateIcsContent(data);
    const htmlReceipt = this.emailProvider.renderCustomerConfirmationHtml(data);
    const subject = `Booking Confirmed: ${data.serviceName} at ${data.businessName}`;

    try {
      const emailRes = await this.emailProvider.sendEmail({
        to: data.customerEmail,
        recipientName: data.customerName,
        subject,
        title: 'Booking Confirmed',
        html: htmlReceipt,
        text: `Your appointment for ${data.serviceName} with ${data.staffName} at ${data.businessName} is confirmed for ${data.startAt.toUTCString()}.`,
        attachments: [
          {
            filename: `invite-${data.appointmentId || 'booking'}.ics`,
            content: icsContent,
            contentType: 'text/calendar; charset=utf-8; method=REQUEST',
          },
        ],
        metadata: { businessName: data.businessName },
      });

      await this.logNotification({
        businessId: details.businessId,
        appointmentId: details.appointmentId,
        channel: NotificationChannel.EMAIL,
        type: NotificationType.CONFIRMATION,
        status: emailRes.success ? NotificationStatus.SENT : NotificationStatus.FAILED,
        recipient: data.customerEmail,
        subject,
        content: `Confirmation email with ICS attachment sent to ${data.customerEmail}`,
        error: emailRes.error,
      });
    } catch (err: any) {
      this.logger.error(`Error sending customer email: ${err.message}`);
    }

    // 2. Send Staff Alert Email (if staff email exists)
    if (details.staffEmail) {
      try {
        const staffHtml = this.emailProvider.renderStaffAlertHtml(data);
        const staffSubject = `New Booking: ${data.customerName} - ${data.serviceName}`;
        const staffRes = await this.emailProvider.sendEmail({
          to: details.staffEmail,
          recipientName: data.staffName,
          subject: staffSubject,
          title: 'New Booking Assigned',
          html: staffHtml,
          text: `New booking: ${data.customerName} for ${data.serviceName} at ${data.startAt.toUTCString()}.`,
        });

        await this.logNotification({
          businessId: details.businessId,
          appointmentId: details.appointmentId,
          channel: NotificationChannel.EMAIL,
          type: NotificationType.STAFF_ALERT,
          status: staffRes.success ? NotificationStatus.SENT : NotificationStatus.FAILED,
          recipient: details.staffEmail,
          subject: staffSubject,
          content: `Staff assignment alert sent to ${details.staffEmail}`,
          error: staffRes.error,
        });
      } catch (err: any) {
        this.logger.error(`Error sending staff email: ${err.message}`);
      }
    }

    // 3. Send SMS / WhatsApp Notification (if customer phone exists)
    if (details.customerPhone) {
      const smsMessage = this.smsWhatsappProvider.formatBookingConfirmation({
        customerName: data.customerName,
        businessName: data.businessName,
        serviceName: data.serviceName,
        staffName: data.staffName,
        startAt: data.startAt,
        businessLocation: data.businessLocation,
      });

      try {
        // Send SMS
        const smsRes = await this.smsWhatsappProvider.sendSms({
          to: details.customerPhone,
          recipientName: data.customerName,
          channel: 'SMS',
          message: smsMessage,
        });

        await this.logNotification({
          businessId: details.businessId,
          appointmentId: details.appointmentId,
          channel: NotificationChannel.SMS,
          type: NotificationType.CONFIRMATION,
          status: smsRes.success ? NotificationStatus.SENT : NotificationStatus.FAILED,
          recipient: details.customerPhone,
          content: smsMessage,
          error: smsRes.error,
        });

        // Send WhatsApp
        const waRes = await this.smsWhatsappProvider.sendWhatsApp({
          to: details.customerPhone,
          recipientName: data.customerName,
          channel: 'WHATSAPP',
          message: smsMessage,
        });

        await this.logNotification({
          businessId: details.businessId,
          appointmentId: details.appointmentId,
          channel: NotificationChannel.WHATSAPP,
          type: NotificationType.CONFIRMATION,
          status: waRes.success ? NotificationStatus.SENT : NotificationStatus.FAILED,
          recipient: details.customerPhone,
          content: smsMessage,
          error: waRes.error,
        });
      } catch (err: any) {
        this.logger.error(`Error sending SMS/WhatsApp: ${err.message}`);
      }
    }

    return { success: true };
  }

  /**
   * Dispatch cancellation notices (Email + SMS/WhatsApp)
   */
  async sendAppointmentCancellation(details: BookingNotificationDetails) {
    const data: BookingEmailData = {
      businessName: details.businessName,
      customerName: details.customerName,
      customerEmail: details.customerEmail,
      customerPhone: details.customerPhone,
      serviceName: details.serviceName,
      servicePricePaise: details.servicePricePaise || 0,
      currency: details.currency || 'INR',
      durationMinutes: details.durationMinutes || 30,
      staffName: details.staffName,
      startAt: new Date(details.startAt),
      endAt: new Date(details.endAt || details.startAt),
      cancellationReason: details.reason,
      appointmentId: details.appointmentId,
    };

    const cancelHtml = this.emailProvider.renderCancellationHtml(data);
    const subject = `Cancelled: ${data.serviceName} at ${data.businessName}`;

    try {
      const emailRes = await this.emailProvider.sendEmail({
        to: data.customerEmail,
        recipientName: data.customerName,
        subject,
        title: 'Booking Cancelled',
        html: cancelHtml,
        text: `Your appointment for ${data.serviceName} at ${data.businessName} scheduled for ${data.startAt.toUTCString()} has been cancelled. Reason: ${details.reason || 'None provided'}`,
      });

      await this.logNotification({
        businessId: details.businessId,
        appointmentId: details.appointmentId,
        channel: NotificationChannel.EMAIL,
        type: NotificationType.CANCELLATION,
        status: emailRes.success ? NotificationStatus.SENT : NotificationStatus.FAILED,
        recipient: data.customerEmail,
        subject,
        content: `Cancellation email sent to ${data.customerEmail}`,
        error: emailRes.error,
      });
    } catch (err: any) {
      this.logger.error(`Error sending cancellation email: ${err.message}`);
    }

    if (details.customerPhone) {
      const cancelSms = this.smsWhatsappProvider.formatCancellationMessage({
        customerName: data.customerName,
        businessName: data.businessName,
        serviceName: data.serviceName,
        startAt: data.startAt,
        reason: details.reason,
      });

      try {
        const smsRes = await this.smsWhatsappProvider.sendSms({
          to: details.customerPhone,
          recipientName: data.customerName,
          channel: 'SMS',
          message: cancelSms,
        });

        await this.logNotification({
          businessId: details.businessId,
          appointmentId: details.appointmentId,
          channel: NotificationChannel.SMS,
          type: NotificationType.CANCELLATION,
          status: smsRes.success ? NotificationStatus.SENT : NotificationStatus.FAILED,
          recipient: details.customerPhone,
          content: cancelSms,
          error: smsRes.error,
        });
      } catch (err: any) {
        this.logger.error(`Error sending cancellation SMS: ${err.message}`);
      }
    }

    return { success: true };
  }

  /**
   * Dispatch proactive reminder (24H or 2H)
   */
  async sendAppointmentReminder(
    details: BookingNotificationDetails,
    reminderType: '24H' | '2H',
  ) {
    const data: BookingEmailData = {
      businessName: details.businessName,
      customerName: details.customerName,
      customerEmail: details.customerEmail,
      customerPhone: details.customerPhone,
      serviceName: details.serviceName,
      servicePricePaise: details.servicePricePaise || 0,
      currency: details.currency || 'INR',
      durationMinutes: details.durationMinutes || 30,
      staffName: details.staffName,
      startAt: new Date(details.startAt),
      endAt: new Date(details.endAt || details.startAt),
      businessLocation: details.businessLocation,
      appointmentId: details.appointmentId,
    };

    const notifType =
      reminderType === '24H'
        ? NotificationType.REMINDER_24H
        : NotificationType.REMINDER_2H;

    const htmlReminder = this.emailProvider.renderReminderHtml(data, reminderType);
    const subject = `Reminder: ${data.serviceName} ${reminderType === '24H' ? 'Tomorrow' : 'in 2 Hours'} at ${data.businessName}`;

    // Email reminder
    try {
      const emailRes = await this.emailProvider.sendEmail({
        to: data.customerEmail,
        recipientName: data.customerName,
        subject,
        title: `Appointment Reminder (${reminderType})`,
        html: htmlReminder,
        text: `Reminder: Your appointment for ${data.serviceName} at ${data.businessName} is on ${data.startAt.toUTCString()}.`,
      });

      await this.logNotification({
        businessId: details.businessId,
        appointmentId: details.appointmentId,
        channel: NotificationChannel.EMAIL,
        type: notifType,
        status: emailRes.success ? NotificationStatus.SENT : NotificationStatus.FAILED,
        recipient: data.customerEmail,
        subject,
        content: `Reminder ${reminderType} email sent`,
        error: emailRes.error,
      });
    } catch (err: any) {
      this.logger.error(`Error sending reminder email: ${err.message}`);
    }

    // SMS / WhatsApp reminder
    if (details.customerPhone) {
      const reminderMsg = this.smsWhatsappProvider.formatReminderMessage({
        customerName: data.customerName,
        businessName: data.businessName,
        serviceName: data.serviceName,
        staffName: data.staffName,
        startAt: data.startAt,
        reminderType,
        businessLocation: data.businessLocation,
      });

      try {
        const smsRes = await this.smsWhatsappProvider.sendSms({
          to: details.customerPhone,
          recipientName: data.customerName,
          channel: 'SMS',
          message: reminderMsg,
        });

        await this.logNotification({
          businessId: details.businessId,
          appointmentId: details.appointmentId,
          channel: NotificationChannel.SMS,
          type: notifType,
          status: smsRes.success ? NotificationStatus.SENT : NotificationStatus.FAILED,
          recipient: details.customerPhone,
          content: reminderMsg,
          error: smsRes.error,
        });
      } catch (err: any) {
        this.logger.error(`Error sending reminder SMS: ${err.message}`);
      }
    }

    return { success: true };
  }

  /**
   * Helper: Non-blocking audit logger in database
   */
  private async logNotification(params: {
    businessId?: string;
    appointmentId?: string;
    channel: NotificationChannel;
    type: NotificationType;
    status: NotificationStatus;
    recipient: string;
    subject?: string;
    content?: string;
    error?: string;
  }) {
    if (!params.businessId) return;

    try {
      await this.prisma.notificationLog.create({
        data: {
          businessId: params.businessId,
          appointmentId: params.appointmentId,
          channel: params.channel,
          type: params.type,
          status: params.status,
          recipient: params.recipient,
          subject: params.subject,
          content: params.content,
          error: params.error,
        },
      });
    } catch (err: any) {
      this.logger.warn(`Failed to record notification log to database: ${err.message}`);
    }
  }
}
