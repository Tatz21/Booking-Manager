import { Test, TestingModule } from '@nestjs/testing';
import { AvailabilityService } from './availability.service';
import { PrismaService } from '../../database/prisma.service';

describe('AvailabilityService', () => {
  let service: AvailabilityService;
  let prisma: any;

  const mockBusiness = {
    id: 'biz-1',
    timezone: 'Asia/Kolkata',
    businessHours: [
      {
        dayOfWeek: 2, // Tuesday
        openTime: '09:00',
        closeTime: '12:00',
        isClosed: false,
        breaksJson: [{ start: '10:00', end: '10:30' }],
      },
    ],
  };

  const mockServiceItem = {
    id: 'srv-1',
    businessId: 'biz-1',
    durationMinutes: 30,
    price: 30000,
    isActive: true,
  };

  const mockStaffMember = {
    id: 'st-1',
    businessId: 'biz-1',
    name: 'Alex',
    isActive: true,
    staffAvailability: [
      {
        dayOfWeek: 2,
        startTime: '09:00',
        endTime: '12:00',
        isOff: false,
        breaksJson: null,
      },
    ],
  };

  beforeEach(async () => {
    prisma = {
      businessHours: {
        findMany: jest.fn(),
        upsert: jest.fn(),
      },
      staffAvailability: {
        findMany: jest.fn(),
        upsert: jest.fn(),
      },
      staff: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
      service: {
        findFirst: jest.fn(),
      },
      business: {
        findUnique: jest.fn(),
      },
      bookingSettings: {
        findUnique: jest.fn(),
      },
      appointment: {
        findMany: jest.fn(),
      },
      $transaction: jest.fn(async (cb) => {
        return cb(prisma);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvailabilityService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AvailabilityService>(AvailabilityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should calculate available slots excluding breaks and appointments', async () => {
    // Tuesday: 2026-09-01
    prisma.business.findUnique.mockResolvedValue(mockBusiness);
    prisma.service.findFirst.mockResolvedValue(mockServiceItem);
    prisma.bookingSettings.findUnique.mockResolvedValue({
      slotIntervalMinutes: 30,
      minNoticeMinutes: 0, // for testing future date
    });
    prisma.staff.findMany.mockResolvedValue([mockStaffMember]);
    prisma.appointment.findMany.mockResolvedValue([
      {
        id: 'app-1',
        staffId: 'st-1',
        startAt: new Date('2026-09-01T11:00:00.000Z'),
        endAt: new Date('2026-09-01T11:30:00.000Z'),
        status: 'CONFIRMED',
      },
    ]);

    const result = await service.getAvailableSlots('biz-1', {
      date: '2026-09-01',
      serviceId: 'srv-1',
    });

    expect(result.date).toBe('2026-09-01');
    expect(result.availableSlots.length).toBeGreaterThan(0);
    // Break 10:00-10:30 should not be in slots
    const hasBreakSlot = result.availableSlots.some((s) => s.time === '10:00');
    expect(hasBreakSlot).toBe(false);
    // Appointment 11:00-11:30 should not be in slots
    const hasBookedSlot = result.availableSlots.some((s) => s.time === '11:00');
    expect(hasBookedSlot).toBe(false);
    // Valid slot 09:00 should be present
    const hasValidSlot = result.availableSlots.some((s) => s.time === '09:00');
    expect(hasValidSlot).toBe(true);
  });
});
