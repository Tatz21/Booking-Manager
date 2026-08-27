import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from './notifications.service';
import { AppointmentStatus, NotificationType, NotificationStatus } from '@prisma/client';

@Injectable()
export class ReminderCronService {
  private readonly logger = new Logger(ReminderCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Cron job executing every 5 minutes to detect upcoming appointments needing 24H or 2H reminders
   */
  @Cron('*/5 * * * *')
  async handleScheduledReminders() {
    this.logger.log('⏰ Running automated appointment reminders cron sweep...');
    try {
      const results24h = await this.process24HourReminders();
      const results2h = await this.process2HourReminders();
      this.logger.log(
        `✅ Reminders processed: ${results24h.sent} (24H) sent, ${results2h.sent} (2H) sent`,
      );
    } catch (err: any) {
      this.logger.error(`Failed executing reminder cron: ${err.message}`);
    }
  }

  /**
   * Process 24-Hour Reminders
   */
  async process24HourReminders(): Promise<{ checked: number; sent: number }> {
    const now = new Date();
    // Window: 23 hours 45 mins to 24 hours 15 mins from now
    const windowStart = new Date(now.getTime() + 23.75 * 60 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 24.25 * 60 * 60 * 1000);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        status: AppointmentStatus.CONFIRMED,
        startAt: {
          gte: windowStart,
          lte: windowEnd,
        },
      },
      include: {
        business: {
          include: {
            bookingSettings: true,
          },
        },
        customer: true,
        service: true,
        staff: true,
        notifications: {
          where: {
            type: NotificationType.REMINDER_24H,
            status: NotificationStatus.SENT,
          },
        },
      },
    });

    let sent = 0;
    for (const appt of appointments) {
      // If reminder already sent, skip (idempotency guard)
      if (appt.notifications && appt.notifications.length > 0) {
        continue;
      }

      // Check if business has disabled 24h reminders
      if (appt.business.bookingSettings?.reminder24hEnabled === false) {
        continue;
      }

      await this.notificationsService.sendAppointmentReminder(
        {
          businessId: appt.businessId,
          appointmentId: appt.id,
          businessName: appt.business.name,
          businessSlug: appt.business.slug,
          businessEmail: appt.business.email || undefined,
          businessPhone: appt.business.phone || undefined,
          businessLocation: appt.business.location || undefined,
          customerName: appt.customer.name,
          customerEmail: appt.customer.email,
          customerPhone: appt.customer.phone || undefined,
          serviceName: appt.service.name,
          servicePricePaise: appt.service.price,
          currency: appt.currency,
          durationMinutes: appt.service.durationMinutes,
          staffName: appt.staff.name,
          startAt: appt.startAt,
          endAt: appt.endAt,
        },
        '24H',
      );
      sent++;
    }

    return { checked: appointments.length, sent };
  }

  /**
   * Process 2-Hour Reminders
   */
  async process2HourReminders(): Promise<{ checked: number; sent: number }> {
    const now = new Date();
    // Window: 1 hour 45 mins to 2 hours 15 mins from now
    const windowStart = new Date(now.getTime() + 1.75 * 60 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 2.25 * 60 * 60 * 1000);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        status: AppointmentStatus.CONFIRMED,
        startAt: {
          gte: windowStart,
          lte: windowEnd,
        },
      },
      include: {
        business: {
          include: {
            bookingSettings: true,
          },
        },
        customer: true,
        service: true,
        staff: true,
        notifications: {
          where: {
            type: NotificationType.REMINDER_2H,
            status: NotificationStatus.SENT,
          },
        },
      },
    });

    let sent = 0;
    for (const appt of appointments) {
      // If reminder already sent, skip (idempotency guard)
      if (appt.notifications && appt.notifications.length > 0) {
        continue;
      }

      // Check if business has disabled 2h reminders
      if (appt.business.bookingSettings?.reminder2hEnabled === false) {
        continue;
      }

      await this.notificationsService.sendAppointmentReminder(
        {
          businessId: appt.businessId,
          appointmentId: appt.id,
          businessName: appt.business.name,
          businessSlug: appt.business.slug,
          businessEmail: appt.business.email || undefined,
          businessPhone: appt.business.phone || undefined,
          businessLocation: appt.business.location || undefined,
          customerName: appt.customer.name,
          customerEmail: appt.customer.email,
          customerPhone: appt.customer.phone || undefined,
          serviceName: appt.service.name,
          servicePricePaise: appt.service.price,
          currency: appt.currency,
          durationMinutes: appt.service.durationMinutes,
          staffName: appt.staff.name,
          startAt: appt.startAt,
          endAt: appt.endAt,
        },
        '2H',
      );
      sent++;
    }

    return { checked: appointments.length, sent };
  }
}
