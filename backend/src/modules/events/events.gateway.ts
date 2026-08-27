import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/ws',
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join:business')
  handleJoinBusiness(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { businessId: string },
  ) {
    if (data?.businessId) {
      const room = `business:${data.businessId}`;
      client.join(room);
      this.logger.log(`Client ${client.id} joined room: ${room}`);
      return { event: 'joined', room };
    }
  }

  @SubscribeMessage('leave:business')
  handleLeaveBusiness(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { businessId: string },
  ) {
    if (data?.businessId) {
      const room = `business:${data.businessId}`;
      client.leave(room);
      this.logger.log(`Client ${client.id} left room: ${room}`);
      return { event: 'left', room };
    }
  }

  /**
   * Broadcast a new appointment booking event to all active dashboard clients
   */
  emitAppointmentCreated(businessId: string, appointment: Record<string, any>) {
    const room = `business:${businessId}`;
    this.logger.log(`Emitting appointment:created to room: ${room}`);
    if (this.server) {
      this.server.to(room).emit('appointment:created', {
        type: 'APPOINTMENT_CREATED',
        businessId,
        appointment,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Broadcast appointment status update (e.g. COMPLETED, CANCELLED, CONFIRMED)
   */
  emitAppointmentStatusUpdated(
    businessId: string,
    appointmentId: string,
    status: string,
    appointment?: Record<string, any>,
  ) {
    const room = `business:${businessId}`;
    this.logger.log(`Emitting appointment:status_updated (${status}) to room: ${room}`);
    if (this.server) {
      this.server.to(room).emit('appointment:status_updated', {
        type: 'APPOINTMENT_STATUS_UPDATED',
        businessId,
        appointmentId,
        status,
        appointment,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
