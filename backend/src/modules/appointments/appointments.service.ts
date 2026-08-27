import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { QueryAppointmentsDto } from './dto/query-appointments.dto';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';
import { AppointmentStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService?: NotificationsService,
    private readonly eventsGateway?: EventsGateway,
  ) {}

  async findAll(businessId: string, query: QueryAppointmentsDto) {
    if (!businessId) throw new ForbiddenException('Tenant context missing');

    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {
      businessId,
      ...(query.staffId && { staffId: query.staffId }),
      ...(query.customerId && { customerId: query.customerId }),
      ...(query.status && { status: query.status }),
      ...(query.startDate || query.endDate
        ? {
            startAt: {
              ...(query.startDate && { gte: new Date(query.startDate) }),
              ...(query.endDate && { lte: new Date(query.endDate) }),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startAt: 'asc' },
        include: {
          service: {
            select: { id: true, name: true, durationMinutes: true, price: true, currency: true },
          },
          staff: {
            select: { id: true, name: true, roleTitle: true },
          },
          customer: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(businessId: string, id: string) {
    if (!businessId) throw new ForbiddenException('Tenant context missing');

    const appointment = await this.prisma.appointment.findFirst({
      where: { id, businessId },
      include: {
        service: true,
        staff: true,
        customer: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID "${id}" not found`);
    }

    return appointment;
  }

  async create(businessId: string, dto: CreateAppointmentDto, actorUserId?: string) {
    if (!businessId) throw new ForbiddenException('Tenant context missing');

    const startAt = new Date(dto.startAt);
    if (isNaN(startAt.getTime())) {
      throw new BadRequestException('Invalid startAt timestamp');
    }

    // 1. Verify Service belongs to business
    const service = await this.prisma.service.findFirst({
      where: { id: dto.serviceId, businessId, isDeleted: false, isActive: true },
    });
    if (!service) {
      throw new NotFoundException('Service not found, inactive, or belongs to another business');
    }

    // 2. Verify Staff belongs to business
    const staff = await this.prisma.staff.findFirst({
      where: { id: dto.staffId, businessId, isDeleted: false, isActive: true },
    });
    if (!staff) {
      throw new NotFoundException('Staff member not found, inactive, or belongs to another business');
    }

    // 3. Verify Staff provides this Service
    const staffService = await this.prisma.staffService.findFirst({
      where: { staffId: dto.staffId, serviceId: dto.serviceId, businessId },
    });
    if (!staffService) {
      throw new BadRequestException('Staff member is not assigned to provide this service');
    }

    // Calculate endAt
    const endAt = new Date(startAt.getTime() + service.durationMinutes * 60 * 1000);

    // 4. Resolve or create Customer
    let customerId = dto.customerId;
    if (!customerId) {
      if (!dto.customerName || !dto.customerEmail || !dto.customerPhone) {
        throw new BadRequestException(
          'Customer details (name, email, phone) are required when customerId is not provided',
        );
      }

      const normalizedEmail = dto.customerEmail.trim().toLowerCase();
      const normalizedPhone = dto.customerPhone.trim();

      let customer = await this.prisma.customer.findFirst({
        where: {
          businessId,
          OR: [{ email: normalizedEmail }, { phone: normalizedPhone }],
        },
      });

      if (!customer) {
        customer = await this.prisma.customer.create({
          data: {
            businessId,
            name: dto.customerName.trim(),
            email: normalizedEmail,
            phone: normalizedPhone,
            notes: dto.notes?.trim(),
          },
        });
      }
      customerId = customer.id;
    } else {
      const existingCustomer = await this.prisma.customer.findFirst({
        where: { id: customerId, businessId },
      });
      if (!existingCustomer) {
        throw new NotFoundException('Customer not found for this business');
      }
    }

    // 5. Atomic Database Transaction with Concurrency & Overlap Protection
    const result = await this.prisma.$transaction(async (tx) => {
      // Check overlap for same staff in confirmed or pending status
      const existingConflict = await tx.appointment.findFirst({
        where: {
          businessId,
          staffId: dto.staffId,
          status: { in: [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING] },
          startAt: { lt: endAt },
          endAt: { gt: startAt },
        },
      });

      if (existingConflict) {
        throw new ConflictException('This appointment time is no longer available.');
      }

      const appointment = await tx.appointment.create({
        data: {
          businessId,
          customerId,
          serviceId: service.id,
          staffId: staff.id,
          startAt,
          endAt,
          status: AppointmentStatus.CONFIRMED,
          price: service.price,
          currency: service.currency,
          notes: dto.notes?.trim(),
        },
        include: {
          service: true,
          staff: true,
          customer: true,
          business: true,
        },
      });

      await tx.auditLog.create({
        data: {
          businessId,
          userId: actorUserId,
          action: 'APPOINTMENT_CREATED',
          entityType: 'Appointment',
          entityId: appointment.id,
          payloadJson: {
            serviceId: service.id,
            staffId: staff.id,
            customerId,
            startAt: startAt.toISOString(),
            endAt: endAt.toISOString(),
          },
        },
      });

      return appointment;
    });

    // Trigger asynchronous non-blocking multi-channel notification
    if (this.notificationsService) {
      this.notificationsService
        .sendAppointmentConfirmation({
          businessId: result.businessId,
          appointmentId: result.id,
          businessName: result.business?.name || 'Business',
          businessSlug: result.business?.slug,
          businessEmail: result.business?.email || undefined,
          businessPhone: result.business?.phone || undefined,
          businessLocation: result.business?.location || undefined,
          primaryColor: result.business?.primaryColor,
          logoUrl: result.business?.logoUrl || undefined,
          customerEmail: result.customer?.email || '',
          customerName: result.customer?.name || '',
          customerPhone: result.customer?.phone || undefined,
          serviceName: result.service?.name || 'Service',
          servicePricePaise: result.price,
          currency: result.currency,
          durationMinutes: result.service?.durationMinutes || 30,
          staffName: result.staff?.name || 'Staff',
          staffEmail: result.staff?.email || undefined,
          startAt: result.startAt,
          endAt: result.endAt,
          notes: result.notes || undefined,
        })
        .catch((err) => this.logger.error('Background notification dispatch failed:', err));
    }

    // Broadcast live WebSocket event to business dashboard
    this.eventsGateway?.emitAppointmentCreated(businessId, result);

    return result;
  }

  async updateStatus(
    businessId: string,
    id: string,
    status: AppointmentStatus,
    actorUserId?: string,
  ) {
    const appointment = await this.findOne(businessId, id);

    const updated = await this.prisma.appointment.update({
      where: { id: appointment.id },
      data: { status },
      include: {
        service: true,
        staff: true,
        customer: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        businessId,
        userId: actorUserId,
        action: 'APPOINTMENT_STATUS_UPDATED',
        entityType: 'Appointment',
        entityId: updated.id,
        payloadJson: { previousStatus: appointment.status, newStatus: status },
      },
    });

    // Broadcast live WebSocket event to business dashboard
    this.eventsGateway?.emitAppointmentStatusUpdated(businessId, updated.id, status, updated);

    return updated;
  }

  async cancel(
    businessId: string,
    id: string,
    dto: CancelAppointmentDto,
    actorUserId?: string,
  ) {
    const appointment = await this.findOne(businessId, id);

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException('Appointment is already cancelled');
    }

    const updated = await this.prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: AppointmentStatus.CANCELLED,
        cancelReason: dto.reason?.trim() || 'Cancelled by business',
      },
      include: {
        service: true,
        staff: true,
        customer: true,
        business: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        businessId,
        userId: actorUserId,
        action: 'APPOINTMENT_CANCELLED',
        entityType: 'Appointment',
        entityId: updated.id,
        payloadJson: { reason: dto.reason },
      },
    });

    if (this.notificationsService) {
      this.notificationsService
        .sendAppointmentCancellation({
          businessId: updated.businessId,
          appointmentId: updated.id,
          businessName: updated.business?.name || 'Business',
          customerEmail: updated.customer?.email || '',
          customerName: updated.customer?.name || '',
          customerPhone: updated.customer?.phone || undefined,
          serviceName: updated.service?.name || 'Service',
          staffName: updated.staff?.name || 'Staff',
          startAt: updated.startAt,
          endAt: updated.endAt,
          reason: dto.reason,
        })
        .catch((err) => this.logger.error('Background cancellation notification dispatch failed:', err));
    }

    // Broadcast live WebSocket event to business dashboard
    this.eventsGateway?.emitAppointmentStatusUpdated(businessId, updated.id, AppointmentStatus.CANCELLED, updated);

    return updated;
  }
}
