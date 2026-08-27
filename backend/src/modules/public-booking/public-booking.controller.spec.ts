import { Test, TestingModule } from '@nestjs/testing';
import { PublicBookingController } from './public-booking.controller';
import { PublicBookingService } from './public-booking.service';

describe('PublicBookingController', () => {
  let controller: PublicBookingController;
  let service: any;

  const mockPublicProfile = {
    name: 'Apex Barber Studio',
    slug: 'apex-barber-studio-7a8b',
    timezone: 'Asia/Kolkata',
  };

  beforeEach(async () => {
    service = {
      getBusinessProfile: jest.fn().mockResolvedValue(mockPublicProfile),
      getServices: jest.fn().mockResolvedValue([]),
      getStaff: jest.fn().mockResolvedValue([]),
      getAvailability: jest.fn().mockResolvedValue({ availableSlots: [] }),
      bookAppointment: jest.fn().mockResolvedValue({ appointmentId: 'app-1', status: 'CONFIRMED' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicBookingController],
      providers: [{ provide: PublicBookingService, useValue: service }],
    }).compile();

    controller = module.get<PublicBookingController>(PublicBookingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get public business profile', async () => {
    const res = await controller.getBusinessProfile('apex-barber-studio-7a8b');
    expect(res).toEqual(mockPublicProfile);
    expect(service.getBusinessProfile).toHaveBeenCalledWith('apex-barber-studio-7a8b');
  });

  it('should book public appointment', async () => {
    const dto = {
      serviceId: 'srv-1',
      staffId: 'st-1',
      startAt: '2026-09-01T10:00:00.000Z',
      customerName: 'Customer',
      customerEmail: 'cust@example.com',
      customerPhone: '+919999999999',
    };
    const res = await controller.bookAppointment('apex-barber-studio-7a8b', dto);
    expect(res.appointmentId).toBe('app-1');
    expect(service.bookAppointment).toHaveBeenCalledWith('apex-barber-studio-7a8b', dto);
  });
});
