import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PublicBookingService } from './public-booking.service';
import { PrismaService } from '../../database/prisma.service';
import { AvailabilityService } from '../availability/availability.service';
import { AppointmentsService } from '../appointments/appointments.service';

describe('PublicBookingService', () => {
  let service: PublicBookingService;
  let prisma: any;
  let availabilityService: any;
  let appointmentsService: any;

  const mockBusiness = {
    id: 'biz-1',
    name: 'Apex Barber Studio',
    slug: 'apex-barber-studio-7a8b',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    bookingSettings: {
      slotIntervalMinutes: 30,
      advanceBookingDays: 30,
      minNoticeMinutes: 60,
      cancellationNoticeHours: 24,
    },
  };

  beforeEach(async () => {
    prisma = {
      business: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
      },
      service: {
        findMany: jest.fn(),
      },
      staff: {
        findMany: jest.fn(),
      },
    };

    availabilityService = {
      getAvailableSlots: jest.fn().mockResolvedValue({
        date: '2026-09-01',
        availableSlots: [],
      }),
    };

    appointmentsService = {
      create: jest.fn().mockResolvedValue({
        id: 'app-1',
        status: 'CONFIRMED',
        startAt: new Date('2026-09-01T10:00:00.000Z'),
        endAt: new Date('2026-09-01T10:30:00.000Z'),
        service: { name: 'Classic Haircut' },
        staff: { name: 'Alex Smith' },
        price: 35000,
        currency: 'INR',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublicBookingService,
        { provide: PrismaService, useValue: prisma },
        { provide: AvailabilityService, useValue: availabilityService },
        { provide: AppointmentsService, useValue: appointmentsService },
      ],
    }).compile();

    service = module.get<PublicBookingService>(PublicBookingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return public business profile by slug', async () => {
    prisma.business.findFirst.mockResolvedValue(mockBusiness);

    const profile = await service.getBusinessProfile('apex-barber-studio-7a8b');
    expect(profile.name).toBe('Apex Barber Studio');
    expect(profile.slug).toBe('apex-barber-studio-7a8b');
    expect(profile).toHaveProperty('bookingSettings');
  });

  it('should return public business profile by custom domain', async () => {
    prisma.business.findFirst.mockResolvedValue({ ...mockBusiness, customDomain: 'book.apexbarber.com' });

    const profile = await service.getBusinessProfile('book.apexbarber.com');
    expect(profile.name).toBe('Apex Barber Studio');
    expect(profile.customDomain).toBe('book.apexbarber.com');
  });

  it('should throw NotFoundException if slug does not exist', async () => {
    prisma.business.findFirst.mockResolvedValue(null);

    await expect(service.getBusinessProfile('unknown-slug')).rejects.toThrow(NotFoundException);
  });

  it('should book public appointment successfully', async () => {
    prisma.business.findFirst.mockResolvedValue(mockBusiness);

    const res = await service.bookAppointment('apex-barber-studio-7a8b', {
      serviceId: 'srv-1',
      staffId: 'st-1',
      startAt: '2026-09-01T10:00:00.000Z',
      customerName: 'Customer Name',
      customerEmail: 'cust@example.com',
      customerPhone: '+919999999999',
    });

    expect(res.appointmentId).toBe('app-1');
    expect(res.businessName).toBe('Apex Barber Studio');
    expect(appointmentsService.create).toHaveBeenCalled();
  });
});
