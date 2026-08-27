import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { AppointmentStatus } from '@prisma/client';

describe('AppointmentsController', () => {
  let controller: AppointmentsController;
  let service: any;

  const mockApp = {
    id: 'app-1',
    businessId: 'biz-1',
    status: AppointmentStatus.CONFIRMED,
  };

  beforeEach(async () => {
    service = {
      findAll: jest.fn().mockResolvedValue({ items: [mockApp], meta: { total: 1 } }),
      findOne: jest.fn().mockResolvedValue(mockApp),
      create: jest.fn().mockResolvedValue(mockApp),
      updateStatus: jest.fn().mockResolvedValue({ ...mockApp, status: AppointmentStatus.COMPLETED }),
      cancel: jest.fn().mockResolvedValue({ ...mockApp, status: AppointmentStatus.CANCELLED }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentsController],
      providers: [{ provide: AppointmentsService, useValue: service }],
    }).compile();

    controller = module.get<AppointmentsController>(AppointmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should find all appointments', async () => {
    const res = await controller.findAll('biz-1', { page: 1, limit: 50 });
    expect(res.items).toEqual([mockApp]);
  });

  it('should create an appointment', async () => {
    const dto = {
      serviceId: 's-1',
      staffId: 'st-1',
      startAt: '2026-09-01T10:00:00.000Z',
    };
    const res = await controller.create('biz-1', 'u-1', dto);
    expect(res).toEqual(mockApp);
    expect(service.create).toHaveBeenCalledWith('biz-1', dto, 'u-1');
  });

  it('should cancel an appointment', async () => {
    const res = await controller.cancel('biz-1', 'u-1', 'app-1', { reason: 'Test' });
    expect(res.status).toBe(AppointmentStatus.CANCELLED);
  });
});
