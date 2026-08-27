import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ServicesService } from './services.service';
import { PrismaService } from '../../database/prisma.service';

describe('ServicesService', () => {
  let service: ServicesService;
  let prisma: any;

  const mockServiceItem = {
    id: 'service-1',
    businessId: 'biz-1',
    name: 'Precision Haircut',
    description: 'Men styling',
    durationMinutes: 30,
    price: 35000,
    currency: 'INR',
    isActive: true,
    isDeleted: false,
  };

  beforeEach(async () => {
    prisma = {
      service: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      business: {
        findUnique: jest.fn().mockResolvedValue({ currency: 'INR' }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ServicesService>(ServicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should list active services for the tenant', async () => {
    prisma.service.findMany.mockResolvedValue([mockServiceItem]);

    const result = await service.findAll('biz-1');
    expect(result).toHaveLength(1);
    expect(prisma.service.findMany).toHaveBeenCalledWith({
      where: { businessId: 'biz-1', isDeleted: false, isActive: true },
      orderBy: { name: 'asc' },
    });
  });

  it('should find one service with staff mapping', async () => {
    prisma.service.findFirst.mockResolvedValue(mockServiceItem);

    const result = await service.findOne('biz-1', 'service-1');
    expect(result.id).toBe('service-1');
  });

  it('should throw NotFoundException if service belongs to another tenant', async () => {
    prisma.service.findFirst.mockResolvedValue(null);

    await expect(service.findOne('biz-1', 'service-other-biz')).rejects.toThrow(NotFoundException);
  });

  it('should create service with integer minor units', async () => {
    prisma.service.create.mockResolvedValue(mockServiceItem);

    const result = await service.create('biz-1', {
      name: 'Precision Haircut',
      durationMinutes: 30,
      price: 35000,
    });

    expect(result.price).toBe(35000);
    expect(prisma.service.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        businessId: 'biz-1',
        name: 'Precision Haircut',
        price: 35000,
        currency: 'INR',
      }),
    });
  });

  it('should soft delete service', async () => {
    prisma.service.findFirst.mockResolvedValue(mockServiceItem);
    prisma.service.update.mockResolvedValue({ ...mockServiceItem, isDeleted: true, isActive: false });

    const result = await service.remove('biz-1', 'service-1');
    expect(result.isDeleted).toBe(true);
    expect(prisma.service.update).toHaveBeenCalledWith({
      where: { id: 'service-1' },
      data: { isDeleted: true, isActive: false },
    });
  });
});
