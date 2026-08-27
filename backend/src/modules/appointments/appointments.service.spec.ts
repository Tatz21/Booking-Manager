import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EventsGateway } from '../events/events.gateway';
import { AppointmentStatus } from '@prisma/client';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let prisma: any;

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

  const mockCustomer = {
    id: 'cust-1',
    businessId: 'biz-1',
    name: 'John Customer',
    email: 'john@example.com',
    phone: '+919876543210',
  };

  const mockAppointment = {
    id: 'app-1',
    businessId: 'biz-1',
    customerId: 'cust-1',
    serviceId: 'srv-1',
    staffId: 'staff-1',
    startAt: new Date('2026-09-01T10:00:00.000Z'),
    endAt: new Date('2026-09-01T10:45:00.000Z'),
    status: AppointmentStatus.CONFIRMED,
    price: 49900,
    currency: 'INR',
  };

  beforeEach(async () => {
    prisma = {
      appointment: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      service: {
        findFirst: jest.fn(),
      },
      staff: {
        findFirst: jest.fn(),
      },
      staffService: {
        findFirst: jest.fn(),
      },
      customer: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      auditLog: {
        create: jest.fn(),
      },
      $transaction: jest.fn(async (cb) => {
        return cb(prisma);
      }),
    };

    const mockNotificationsService = {
      sendAppointmentConfirmation: jest.fn().mockResolvedValue({ success: true }),
      sendAppointmentCancellation: jest.fn().mockResolvedValue({ success: true }),
    };

    const mockEventsGateway = {
      emitAppointmentCreated: jest.fn(),
      emitAppointmentStatusUpdated: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: EventsGateway, useValue: mockEventsGateway },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create appointment', () => {
    it('should successfully book an appointment when slot is free', async () => {
      prisma.service.findFirst.mockResolvedValue(mockService);
      prisma.staff.findFirst.mockResolvedValue(mockStaff);
      prisma.staffService.findFirst.mockResolvedValue(mockStaffService);
      prisma.customer.findFirst.mockResolvedValue(mockCustomer);
      prisma.appointment.findFirst.mockResolvedValue(null); // No conflict!
      prisma.appointment.create.mockResolvedValue(mockAppointment);

      const result = await service.create('biz-1', {
        serviceId: 'srv-1',
        staffId: 'staff-1',
        customerId: 'cust-1',
        startAt: '2026-09-01T10:00:00.000Z',
      });

      expect(result.id).toBe('app-1');
      expect(prisma.appointment.create).toHaveBeenCalled();
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });

    it('should throw ConflictException (409) when slot has an overlapping appointment', async () => {
      prisma.service.findFirst.mockResolvedValue(mockService);
      prisma.staff.findFirst.mockResolvedValue(mockStaff);
      prisma.staffService.findFirst.mockResolvedValue(mockStaffService);
      prisma.customer.findFirst.mockResolvedValue(mockCustomer);
      // Conflict exists!
      prisma.appointment.findFirst.mockResolvedValue(mockAppointment);

      await expect(
        service.create('biz-1', {
          serviceId: 'srv-1',
          staffId: 'staff-1',
          customerId: 'cust-1',
          startAt: '2026-09-01T10:00:00.000Z',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException when staff is not assigned to the service', async () => {
      prisma.service.findFirst.mockResolvedValue(mockService);
      prisma.staff.findFirst.mockResolvedValue(mockStaff);
      prisma.staffService.findFirst.mockResolvedValue(null); // Not assigned

      await expect(
        service.create('biz-1', {
          serviceId: 'srv-1',
          staffId: 'staff-1',
          customerId: 'cust-1',
          startAt: '2026-09-01T10:00:00.000Z',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancel appointment', () => {
    it('should cancel an active appointment', async () => {
      prisma.appointment.findFirst.mockResolvedValue(mockAppointment);
      prisma.appointment.update.mockResolvedValue({
        ...mockAppointment,
        status: AppointmentStatus.CANCELLED,
        cancelReason: 'Customer request',
      });

      const res = await service.cancel('biz-1', 'app-1', { reason: 'Customer request' });
      expect(res.status).toBe(AppointmentStatus.CANCELLED);
      expect(prisma.appointment.update).toHaveBeenCalled();
    });

    it('should throw BadRequestException if appointment is already cancelled', async () => {
      prisma.appointment.findFirst.mockResolvedValue({
        ...mockAppointment,
        status: AppointmentStatus.CANCELLED,
      });

      await expect(
        service.cancel('biz-1', 'app-1', { reason: 'Another cancel' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
