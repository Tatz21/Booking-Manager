import { Test, TestingModule } from '@nestjs/testing';
import { ReminderCronService } from './reminder-cron.service';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from './notifications.service';
import { AppointmentStatus, NotificationType, NotificationStatus } from '@prisma/client';

describe('ReminderCronService', () => {
  let cronService: ReminderCronService;
  let prisma: any;
  let notificationsService: any;

  beforeEach(async () => {
    prisma = {
      appointment: {
        findMany: jest.fn(),
      },
    };

    notificationsService = {
      sendAppointmentReminder: jest.fn().mockResolvedValue({ success: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReminderCronService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsService, useValue: notificationsService },
      ],
    }).compile();

    cronService = module.get<ReminderCronService>(ReminderCronService);
  });

  it('should be defined', () => {
    expect(cronService).toBeDefined();
  });

  it('should process 24-hour reminders and skip already sent reminders', async () => {
    const mockAppointments = [
      {
        id: 'appt-1',
        businessId: 'biz-1',
        startAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        endAt: new Date(Date.now() + 24.5 * 60 * 60 * 1000),
        status: AppointmentStatus.CONFIRMED,
        business: {
          name: 'Apex Salon',
          slug: 'apex-salon',
          bookingSettings: { reminder24hEnabled: true },
        },
        customer: { name: 'Alice', email: 'alice@example.com', phone: '+919999999999' },
        service: { name: 'Spa Facial', price: 250000, durationMinutes: 60 },
        staff: { name: 'Sarah' },
        notifications: [], // No prior 24h reminder
      },
      {
        id: 'appt-2',
        businessId: 'biz-1',
        startAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        endAt: new Date(Date.now() + 24.5 * 60 * 60 * 1000),
        status: AppointmentStatus.CONFIRMED,
        business: {
          name: 'Apex Salon',
          slug: 'apex-salon',
          bookingSettings: { reminder24hEnabled: true },
        },
        customer: { name: 'Bob', email: 'bob@example.com' },
        service: { name: 'Haircut', price: 50000, durationMinutes: 30 },
        staff: { name: 'Sarah' },
        notifications: [
          {
            type: NotificationType.REMINDER_24H,
            status: NotificationStatus.SENT,
          },
        ], // Already sent!
      },
    ];

    prisma.appointment.findMany.mockResolvedValue(mockAppointments);

    const res = await cronService.process24HourReminders();

    expect(res.checked).toBe(2);
    expect(res.sent).toBe(1);
    expect(notificationsService.sendAppointmentReminder).toHaveBeenCalledTimes(1);
    expect(notificationsService.sendAppointmentReminder).toHaveBeenCalledWith(
      expect.objectContaining({
        appointmentId: 'appt-1',
        customerName: 'Alice',
      }),
      '24H',
    );
  });

  it('should process 2-hour reminders', async () => {
    const mockAppointments = [
      {
        id: 'appt-3',
        businessId: 'biz-1',
        startAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
        endAt: new Date(Date.now() + 2.5 * 60 * 60 * 1000),
        status: AppointmentStatus.CONFIRMED,
        business: {
          name: 'Apex Salon',
          slug: 'apex-salon',
          bookingSettings: { reminder2hEnabled: true },
        },
        customer: { name: 'Charlie', email: 'charlie@example.com' },
        service: { name: 'Massage', price: 300000, durationMinutes: 60 },
        staff: { name: 'John' },
        notifications: [],
      },
    ];

    prisma.appointment.findMany.mockResolvedValue(mockAppointments);

    const res = await cronService.process2HourReminders();

    expect(res.checked).toBe(1);
    expect(res.sent).toBe(1);
    expect(notificationsService.sendAppointmentReminder).toHaveBeenCalledWith(
      expect.objectContaining({
        appointmentId: 'appt-3',
        customerName: 'Charlie',
      }),
      '2H',
    );
  });
});
