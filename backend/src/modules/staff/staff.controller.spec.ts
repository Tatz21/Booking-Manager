import { Test, TestingModule } from '@nestjs/testing';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';

describe('StaffController', () => {
  let controller: StaffController;
  let service: any;

  const mockStaff = {
    id: 'st-1',
    businessId: 'biz-1',
    name: 'Alex Smith',
    roleTitle: 'Barber',
  };

  beforeEach(async () => {
    service = {
      findAll: jest.fn().mockResolvedValue([mockStaff]),
      findOne: jest.fn().mockResolvedValue(mockStaff),
      create: jest.fn().mockResolvedValue(mockStaff),
      update: jest.fn().mockResolvedValue(mockStaff),
      remove: jest.fn().mockResolvedValue({ ...mockStaff, isDeleted: true }),
      assignServices: jest.fn().mockResolvedValue({ success: true, assignedCount: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StaffController],
      providers: [{ provide: StaffService, useValue: service }],
    }).compile();

    controller = module.get<StaffController>(StaffController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all staff', async () => {
    const res = await controller.findAll('biz-1', false);
    expect(res).toEqual([mockStaff]);
    expect(service.findAll).toHaveBeenCalledWith('biz-1', false);
  });

  it('should create staff', async () => {
    const dto = { name: 'Alex Smith' };
    const res = await controller.create('biz-1', dto);
    expect(res).toEqual(mockStaff);
    expect(service.create).toHaveBeenCalledWith('biz-1', dto);
  });

  it('should assign services', async () => {
    const res = await controller.assignServices('biz-1', 'st-1', { serviceIds: ['s-1'] });
    expect(res.success).toBe(true);
    expect(service.assignServices).toHaveBeenCalledWith('biz-1', 'st-1', ['s-1']);
  });
});
