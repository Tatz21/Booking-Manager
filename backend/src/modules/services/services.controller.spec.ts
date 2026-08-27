import { Test, TestingModule } from '@nestjs/testing';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';

describe('ServicesController', () => {
  let controller: ServicesController;
  let service: any;

  const mockServiceItem = {
    id: 's-1',
    businessId: 'biz-1',
    name: 'Haircut',
    durationMinutes: 30,
    price: 30000,
  };

  beforeEach(async () => {
    service = {
      findAll: jest.fn().mockResolvedValue([mockServiceItem]),
      findOne: jest.fn().mockResolvedValue(mockServiceItem),
      create: jest.fn().mockResolvedValue(mockServiceItem),
      update: jest.fn().mockResolvedValue(mockServiceItem),
      remove: jest.fn().mockResolvedValue({ ...mockServiceItem, isDeleted: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicesController],
      providers: [{ provide: ServicesService, useValue: service }],
    }).compile();

    controller = module.get<ServicesController>(ServicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all services', async () => {
    const res = await controller.findAll('biz-1', false);
    expect(res).toEqual([mockServiceItem]);
    expect(service.findAll).toHaveBeenCalledWith('biz-1', false);
  });

  it('should create a service', async () => {
    const dto = { name: 'Haircut', durationMinutes: 30, price: 30000 };
    const res = await controller.create('biz-1', dto);
    expect(res).toEqual(mockServiceItem);
    expect(service.create).toHaveBeenCalledWith('biz-1', dto);
  });

  it('should remove a service', async () => {
    const res = await controller.remove('biz-1', 's-1');
    expect(service.remove).toHaveBeenCalledWith('biz-1', 's-1');
    expect(res.isDeleted).toBe(true);
  });
});
