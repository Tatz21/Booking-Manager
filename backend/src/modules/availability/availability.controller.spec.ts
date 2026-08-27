import { Test, TestingModule } from '@nestjs/testing';
import { AvailabilityController } from './availability.controller';
import { AvailabilityService } from './availability.service';

describe('AvailabilityController', () => {
  let controller: AvailabilityController;
  let service: any;

  beforeEach(async () => {
    service = {
      getBusinessHours: jest.fn().mockResolvedValue([]),
      setBusinessHours: jest.fn().mockResolvedValue([]),
      getStaffAvailability: jest.fn().mockResolvedValue([]),
      setStaffAvailability: jest.fn().mockResolvedValue([]),
      getAvailableSlots: jest.fn().mockResolvedValue({ date: '2026-09-01', availableSlots: [] }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AvailabilityController],
      providers: [{ provide: AvailabilityService, useValue: service }],
    }).compile();

    controller = module.get<AvailabilityController>(AvailabilityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get business hours', async () => {
    await controller.getBusinessHours('biz-1');
    expect(service.getBusinessHours).toHaveBeenCalledWith('biz-1');
  });

  it('should get slots', async () => {
    const query = { date: '2026-09-01', serviceId: 's-1' };
    await controller.getAvailableSlots('biz-1', query);
    expect(service.getAvailableSlots).toHaveBeenCalledWith('biz-1', query);
  });
});
