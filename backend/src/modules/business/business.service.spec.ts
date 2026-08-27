import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { BusinessService } from './business.service';
import { PrismaService } from '../../database/prisma.service';

describe('BusinessService', () => {
  let service: BusinessService;
  let prisma: any;

  const mockBusiness = {
    id: 'biz-1',
    name: 'Apex Studio',
    slug: 'apex-studio-1234',
    type: 'Salon',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    bookingSettings: {
      id: 'bs-1',
      businessId: 'biz-1',
      slotIntervalMinutes: 30,
    },
  };

  beforeEach(async () => {
    prisma = {
      business: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      bookingSettings: {
        findUnique: jest.fn(),
        create: jest.fn(),
        upsert: jest.fn(),
      },
      auditLog: {
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<BusinessService>(BusinessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get business profile', async () => {
    prisma.business.findUnique.mockResolvedValue(mockBusiness);

    const result = await service.getBusinessProfile('biz-1');
    expect(result.id).toBe('biz-1');
    expect(prisma.business.findUnique).toHaveBeenCalledWith({
      where: { id: 'biz-1' },
      include: expect.any(Object),
    });
  });

  it('should throw NotFoundException if business does not exist', async () => {
    prisma.business.findUnique.mockResolvedValue(null);

    await expect(service.getBusinessProfile('non-existent')).rejects.toThrow(NotFoundException);
  });

  it('should update business profile and log audit', async () => {
    prisma.business.findUnique.mockResolvedValue(mockBusiness);
    prisma.business.update.mockResolvedValue({
      ...mockBusiness,
      name: 'Updated Studio Name',
    });

    const result = await service.updateBusinessProfile('biz-1', 'user-1', {
      name: 'Updated Studio Name',
    });

    expect(result.name).toBe('Updated Studio Name');
    expect(prisma.business.update).toHaveBeenCalled();
    expect(prisma.auditLog.create).toHaveBeenCalled();
  });

  it('should get and update booking settings', async () => {
    prisma.bookingSettings.upsert.mockResolvedValue({
      id: 'bs-1',
      businessId: 'biz-1',
      slotIntervalMinutes: 45,
    });

    const result = await service.updateBookingSettings('biz-1', 'user-1', {
      slotIntervalMinutes: 45,
    });

    expect(result.slotIntervalMinutes).toBe(45);
    expect(prisma.bookingSettings.upsert).toHaveBeenCalled();
  });
});
