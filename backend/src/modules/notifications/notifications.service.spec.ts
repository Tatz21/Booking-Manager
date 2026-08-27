import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../../database/prisma.service';
import { EmailProvider } from './providers/email.provider';
import { SmsWhatsappProvider } from './providers/sms-whatsapp.provider';
import { ConsoleNotificationProvider } from './providers/console-notification.provider';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: any;
  let emailProvider: any;
  let smsWhatsappProvider: any;

  beforeEach(async () => {
    prisma = {
      notificationLog: {
        create: jest.fn().mockResolvedValue({ id: 'log-1' }),
      },
    };

    emailProvider = {
      generateIcsContent: jest.fn().mockReturnValue('BEGIN:VCALENDAR...END:VCALENDAR'),
      renderCustomerConfirmationHtml: jest.fn().mockReturnValue('<html>Receipt</html>'),
      renderStaffAlertHtml: jest.fn().mockReturnValue('<html>Staff Alert</html>'),
      renderReminderHtml: jest.fn().mockReturnValue('<html>Reminder</html>'),
      renderCancellationHtml: jest.fn().mockReturnValue('<html>Cancelled</html>'),
      sendEmail: jest.fn().mockResolvedValue({ success: true, messageId: 'email-123', channel: 'EMAIL' }),
    };

    smsWhatsappProvider = {
      formatBookingConfirmation: jest.fn().mockReturnValue('Your booking is confirmed!'),
      formatReminderMessage: jest.fn().mockReturnValue('Reminder: Your appointment is tomorrow.'),
      formatCancellationMessage: jest.fn().mockReturnValue('Your appointment has been cancelled.'),
      sendSms: jest.fn().mockResolvedValue({ success: true, messageId: 'sms-123', channel: 'SMS' }),
      sendWhatsApp: jest.fn().mockResolvedValue({ success: true, messageId: 'wa-123', channel: 'WHATSAPP' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: prisma },
        { provide: EmailProvider, useValue: emailProvider },
        { provide: SmsWhatsappProvider, useValue: smsWhatsappProvider },
        { provide: ConsoleNotificationProvider, useValue: { send: jest.fn() } },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send appointment confirmation across email, staff alert, and SMS/WhatsApp', async () => {
    const res = await service.sendAppointmentConfirmation({
      businessId: 'biz-1',
      appointmentId: 'appt-1',
      customerEmail: 'customer@example.com',
      customerName: 'Jane Doe',
      customerPhone: '+919876543210',
      businessName: 'Apex Studio',
      serviceName: 'Haircut',
      staffName: 'Alex',
      staffEmail: 'alex@apexstudio.com',
      startAt: new Date('2026-09-01T10:00:00.000Z'),
      endAt: new Date('2026-09-01T10:30:00.000Z'),
    });

    expect(res.success).toBe(true);
    expect(emailProvider.sendEmail).toHaveBeenCalledTimes(2); // 1 customer + 1 staff
    expect(smsWhatsappProvider.sendSms).toHaveBeenCalledTimes(1);
    expect(smsWhatsappProvider.sendWhatsApp).toHaveBeenCalledTimes(1);
    expect(prisma.notificationLog.create).toHaveBeenCalled();
  });

  it('should send cancellation notification', async () => {
    const res = await service.sendAppointmentCancellation({
      businessId: 'biz-1',
      appointmentId: 'appt-1',
      customerEmail: 'customer@example.com',
      customerName: 'Jane Doe',
      customerPhone: '+919876543210',
      businessName: 'Apex Studio',
      serviceName: 'Haircut',
      staffName: 'Alex',
      startAt: new Date('2026-09-01T10:00:00.000Z'),
      reason: 'Schedule conflict',
    });

    expect(res.success).toBe(true);
    expect(emailProvider.sendEmail).toHaveBeenCalledTimes(1);
    expect(smsWhatsappProvider.sendSms).toHaveBeenCalledTimes(1);
  });

  it('should send 24h appointment reminder', async () => {
    const res = await service.sendAppointmentReminder(
      {
        businessId: 'biz-1',
        appointmentId: 'appt-1',
        customerEmail: 'customer@example.com',
        customerName: 'Jane Doe',
        customerPhone: '+919876543210',
        businessName: 'Apex Studio',
        serviceName: 'Haircut',
        staffName: 'Alex',
        startAt: new Date('2026-09-01T10:00:00.000Z'),
      },
      '24H',
    );

    expect(res.success).toBe(true);
    expect(emailProvider.sendEmail).toHaveBeenCalledTimes(1);
    expect(smsWhatsappProvider.sendSms).toHaveBeenCalledTimes(1);
  });
});
