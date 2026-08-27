import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { AppointmentsService } from '../src/modules/appointments/appointments.service';
import { PrismaService } from '../src/database/prisma.service';

describe('Appointment Concurrency Locking (Race Condition Test)', () => {
  let service: AppointmentsService;

  const mockService = {
    id: 'srv-1',
    businessId: 'biz-1',
    name: 'Precision Cut',
    durationMinutes: 45,
    price: 49900,
    currency: 'INR',
    isActive: true,
    isDeleted: false,
  };

  const mockStaff = {
    id: 'staff-1',
    businessId: 'biz-1',
    name: 'Alex',
    isActive: true,
    isDeleted: false,
  };

  const mockStaffService = {
    staffId: 'staff-1',
    serviceId: 'srv-1',
    businessId: 'biz-1',
  };

  let bookedSlots: any[] = [];
  let mockPrisma: any;

  beforeEach(async () => {
    bookedSlots = [];

    mockPrisma = {
      service: {
        findFirst: jest.fn().mockResolvedValue(mockService),
      },
      staff: {
        findFirst: jest.fn().mockResolvedValue(mockStaff),
      },
      staffService: {
        findFirst: jest.fn().mockResolvedValue(mockStaffService),
      },
      customer: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation((args) => ({
          id: `cust-${Date.now()}-${Math.random()}`,
          ...args.data,
        })),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({}),
      },
      appointment: {
        findFirst: jest.fn().mockImplementation(async ({ where }) => {
          // Simulate database lock & atomic check
          const overlap = bookedSlots.find((slot) => {
            return (
              slot.businessId === where.businessId &&
              slot.staffId === where.staffId &&
              slot.startAt < where.startAt.lt &&
              slot.endAt > where.endAt.gt
            );
          });
          return overlap || null;
        }),
        create: jest.fn().mockImplementation(async ({ data }) => {
          bookedSlots.push(data);
          return { id: `app-${Date.now()}-${Math.random()}`, ...data };
        }),
      },
      $transaction: jest.fn(async (callback) => {
        // Run transactional callback with atomic state
        return callback(mockPrisma);
      }),
    };

    const mockNotifications = {
      sendAppointmentConfirmation: jest.fn().mockResolvedValue({ success: true }),
      sendAppointmentCancellation: jest.fn().mockResolvedValue({ success: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: 'NotificationsService', useValue: mockNotifications },
        {
          provide: require('../src/modules/notifications/notifications.service').NotificationsService,
          useValue: mockNotifications,
        },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
  });

  it('should allow exactly ONE booking when two customers compete for the exact same slot simultaneously', async () => {
    const slotTime = '2026-09-01T10:00:00.000Z';

    const customerARequest = service.create('biz-1', {
      serviceId: 'srv-1',
      staffId: 'staff-1',
      startAt: slotTime,
      customerName: 'Customer A',
      customerEmail: 'customer.a@example.com',
      customerPhone: '+919876543211',
    });

    const customerBRequest = service.create('biz-1', {
      serviceId: 'srv-1',
      staffId: 'staff-1',
      startAt: slotTime,
      customerName: 'Customer B',
      customerEmail: 'customer.b@example.com',
      customerPhone: '+919876543212',
    });

    // Run simultaneously in parallel
    const results = await Promise.allSettled([customerARequest, customerBRequest]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    // Exactly one must succeed
    expect(fulfilled).toHaveLength(1);
    // Exactly one must fail
    expect(rejected).toHaveLength(1);

    // The failure must be a 409 ConflictException
    const rejectionReason = (rejected[0] as PromiseRejectedResult).reason;
    expect(rejectionReason).toBeInstanceOf(ConflictException);
    expect(rejectionReason.message).toBe('This appointment time is no longer available.');
  });
});
