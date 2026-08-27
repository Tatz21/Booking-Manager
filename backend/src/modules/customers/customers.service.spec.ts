import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { PrismaService } from '../../database/prisma.service';

describe('CustomersService', () => {
  let service: CustomersService;
  let prisma: any;

  const mockCustomer = {
    id: 'cust-1',
    businessId: 'biz-1',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+919876543210',
    notes: 'VIP customer',
    appointments: [],
  };

  beforeEach(async () => {
    prisma = {
      customer: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should list paginated customers', async () => {
    prisma.customer.findMany.mockResolvedValue([mockCustomer]);
    prisma.customer.count.mockResolvedValue(1);

    const result = await service.findAll('biz-1', { page: 1, limit: 20 });
    expect(result.items).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });

  it('should find one customer', async () => {
    prisma.customer.findFirst.mockResolvedValue(mockCustomer);

    const result = await service.findOne('biz-1', 'cust-1');
    expect(result.id).toBe('cust-1');
  });

  it('should throw NotFoundException if customer does not exist', async () => {
    prisma.customer.findFirst.mockResolvedValue(null);

    await expect(service.findOne('biz-1', 'unknown')).rejects.toThrow(NotFoundException);
  });

  it('should findOrCreate customer by email or phone', async () => {
    prisma.customer.findFirst.mockResolvedValue(null);
    prisma.customer.create.mockResolvedValue(mockCustomer);

    const result = await service.findOrCreate('biz-1', {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+919876543210',
    });

    expect(result.email).toBe('jane@example.com');
    expect(prisma.customer.create).toHaveBeenCalled();
  });
});
