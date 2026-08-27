import { Test, TestingModule } from '@nestjs/testing';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';

describe('CustomersController', () => {
  let controller: CustomersController;
  let service: any;

  const mockCustomer = {
    id: 'c-1',
    businessId: 'biz-1',
    name: 'Jane Smith',
    email: 'jane@example.com',
  };

  beforeEach(async () => {
    service = {
      findAll: jest.fn().mockResolvedValue({ items: [mockCustomer], meta: { total: 1 } }),
      findOne: jest.fn().mockResolvedValue(mockCustomer),
      update: jest.fn().mockResolvedValue(mockCustomer),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [{ provide: CustomersService, useValue: service }],
    }).compile();

    controller = module.get<CustomersController>(CustomersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should find all customers', async () => {
    const res = await controller.findAll('biz-1', { page: 1, limit: 20 });
    expect(res.items).toEqual([mockCustomer]);
  });

  it('should find one customer', async () => {
    const res = await controller.findOne('biz-1', 'c-1');
    expect(res).toEqual(mockCustomer);
  });
});
