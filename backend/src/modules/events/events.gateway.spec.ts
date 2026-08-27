import { Test, TestingModule } from '@nestjs/testing';
import { EventsGateway } from './events.gateway';

describe('EventsGateway', () => {
  let gateway: EventsGateway;
  let mockServer: any;

  beforeEach(async () => {
    mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [EventsGateway],
    }).compile();

    gateway = module.get<EventsGateway>(EventsGateway);
    gateway.server = mockServer;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should join business room', () => {
    const mockSocket: any = {
      id: 'socket-123',
      join: jest.fn(),
    };

    const result = gateway.handleJoinBusiness(mockSocket, { businessId: 'biz-1' });

    expect(mockSocket.join).toHaveBeenCalledWith('business:biz-1');
    expect(result).toEqual({ event: 'joined', room: 'business:biz-1' });
  });

  it('should leave business room', () => {
    const mockSocket: any = {
      id: 'socket-123',
      leave: jest.fn(),
    };

    const result = gateway.handleLeaveBusiness(mockSocket, { businessId: 'biz-1' });

    expect(mockSocket.leave).toHaveBeenCalledWith('business:biz-1');
    expect(result).toEqual({ event: 'left', room: 'business:biz-1' });
  });

  it('should broadcast appointment:created to business room', () => {
    const appointment = { id: 'app-1', serviceName: 'Haircut', price: 49900 };

    gateway.emitAppointmentCreated('biz-1', appointment);

    expect(mockServer.to).toHaveBeenCalledWith('business:biz-1');
    expect(mockServer.emit).toHaveBeenCalledWith(
      'appointment:created',
      expect.objectContaining({
        type: 'APPOINTMENT_CREATED',
        businessId: 'biz-1',
        appointment,
      }),
    );
  });

  it('should broadcast appointment:status_updated to business room', () => {
    gateway.emitAppointmentStatusUpdated('biz-1', 'app-1', 'COMPLETED');

    expect(mockServer.to).toHaveBeenCalledWith('business:biz-1');
    expect(mockServer.emit).toHaveBeenCalledWith(
      'appointment:status_updated',
      expect.objectContaining({
        type: 'APPOINTMENT_STATUS_UPDATED',
        businessId: 'biz-1',
        appointmentId: 'app-1',
        status: 'COMPLETED',
      }),
    );
  });
});
