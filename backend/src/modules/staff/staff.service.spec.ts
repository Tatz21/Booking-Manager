import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { StaffService } from './staff.service';
import { PrismaService } from '../../database/prisma.service';

describe('StaffService', () => {
  let service: StaffService;
  let prisma: any;

  const mockStaff = {
    id: 'staff-1',
    businessId: 'biz-1',
    name: 'Alex Smith',
    email: 'alex@example.com',
    roleTitle: 'Senior Stylist',
    isActive: true,
    isDeleted: false,
    staffServices: [],
    staffAvailability: [],
  };

  beforeEach(async () => {
    prisma = {
      staff: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      service: {
        findMany: jest.fn(),
      },
      staffService: {
        create: jest.fn(),
        deleteMany: jest.fn(),
      },
      staffAvailability: {
        create: jest.fn(),
      },
      $transaction: jest.fn(async (cb) => {
        return cb(prisma);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaffService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<StaffService>(StaffService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should list all staff members for the business', async () => {
    prisma.staff.findMany.mockResolvedValue([mockStaff]);

    const result = await service.findAll('biz-1');
    expect(result).toHaveLength(1);
    expect(prisma.staff.findMany).toHaveBeenCalledWith({
      where: { businessId: 'biz-1', isDeleted: false, isActive: true },
      include: expect.any(Object),
      orderBy: { name: 'asc' },
    });
  });

  it('should find one staff member', async () => {
    prisma.staff.findFirst.mockResolvedValue(mockStaff);

    const result = await service.findOne('biz-1', 'staff-1');
    expect(result.id).toBe('staff-1');
  });

  it('should throw NotFoundException if staff is not found', async () => {
    prisma.staff.findFirst.mockResolvedValue(null);

    await expect(service.findOne('biz-1', 'staff-not-found')).rejects.toThrow(NotFoundException);
  });

  it('should create staff and assign default availability', async () => {
    prisma.staff.create.mockResolvedValue(mockStaff);

    const result = await service.create('biz-1', {
      name: 'Alex Smith',
      email: 'alex@example.com',
      roleTitle: 'Senior Stylist',
    });

    expect(result.name).toBe('Alex Smith');
    expect(prisma.staff.create).toHaveBeenCalled();
    expect(prisma.staffAvailability.create).toHaveBeenCalled();
  });

  it('should assign valid services to staff', async () => {
    prisma.staff.findFirst.mockResolvedValue(mockStaff);
    prisma.service.findMany.mockResolvedValue([{ id: 's-1' }, { id: 's-2' }]);
    prisma.staffService.deleteMany.mockResolvedValue({ count: 1 });
    prisma.staffService.create.mockResolvedValue({});

    const result = await service.assignServices('biz-1', 'staff-1', ['s-1', 's-2']);
    expect(result.success).toBe(true);
    expect(result.assignedCount).toBe(2);
  });

  it('should reject assignment of services belonging to other businesses', async () => {
    prisma.staff.findFirst.mockResolvedValue(mockStaff);
    prisma.service.findMany.mockResolvedValue([{ id: 's-1' }]); // Only 1 valid, 2 requested

    await expect(
      service.assignServices('biz-1', 'staff-1', ['s-1', 's-other-tenant']),
    ).rejects.toThrow(BadRequestException);
  });
});
