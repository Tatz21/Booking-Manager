import { Test, TestingModule } from '@nestjs/testing';
import { BusinessController } from './business.controller';
import { BusinessService } from './business.service';

describe('BusinessController', () => {
  let controller: BusinessController;
  let service: any;

  const mockBusiness = {
    id: 'biz-1',
    name: 'Apex Studio',
    slug: 'apex-studio-1234',
    timezone: 'Asia/Kolkata',
  };

  beforeEach(async () => {
    service = {
      getBusinessProfile: jest.fn().mockResolvedValue(mockBusiness),
      updateBusinessProfile: jest.fn().mockResolvedValue(mockBusiness),
      getBookingSettings: jest.fn().mockResolvedValue({ slotIntervalMinutes: 30 }),
      updateBookingSettings: jest.fn().mockResolvedValue({ slotIntervalMinutes: 45 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusinessController],
      providers: [{ provide: BusinessService, useValue: service }],
    }).compile();

    controller = module.get<BusinessController>(BusinessController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get business', async () => {
    const result = await controller.getBusiness('biz-1');
    expect(result).toEqual(mockBusiness);
    expect(service.getBusinessProfile).toHaveBeenCalledWith('biz-1');
  });

  it('should update business', async () => {
    const dto = { name: 'New Name' };
    const result = await controller.updateBusiness('biz-1', 'u-1', dto);
    expect(result).toEqual(mockBusiness);
    expect(service.updateBusinessProfile).toHaveBeenCalledWith('biz-1', 'u-1', dto);
  });
});
