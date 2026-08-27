"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AppointmentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const client_1 = require("@prisma/client");
const notifications_service_1 = require("../notifications/notifications.service");
const events_gateway_1 = require("../events/events.gateway");
let AppointmentsService = AppointmentsService_1 = class AppointmentsService {
    constructor(prisma, notificationsService, eventsGateway) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
        this.eventsGateway = eventsGateway;
        this.logger = new common_1.Logger(AppointmentsService_1.name);
    }
    async findAll(businessId, query) {
        if (!businessId)
            throw new common_1.ForbiddenException('Tenant context missing');
        const page = query.page || 1;
        const limit = query.limit || 50;
        const skip = (page - 1) * limit;
        const where = {
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
    async findOne(businessId, id) {
        if (!businessId)
            throw new common_1.ForbiddenException('Tenant context missing');
        const appointment = await this.prisma.appointment.findFirst({
            where: { id, businessId },
            include: {
                service: true,
                staff: true,
                customer: true,
            },
        });
        if (!appointment) {
            throw new common_1.NotFoundException(`Appointment with ID "${id}" not found`);
        }
        return appointment;
    }
    async create(businessId, dto, actorUserId) {
        if (!businessId)
            throw new common_1.ForbiddenException('Tenant context missing');
        const startAt = new Date(dto.startAt);
        if (isNaN(startAt.getTime())) {
            throw new common_1.BadRequestException('Invalid startAt timestamp');
        }
        const service = await this.prisma.service.findFirst({
            where: { id: dto.serviceId, businessId, isDeleted: false, isActive: true },
        });
        if (!service) {
            throw new common_1.NotFoundException('Service not found, inactive, or belongs to another business');
        }
        const staff = await this.prisma.staff.findFirst({
            where: { id: dto.staffId, businessId, isDeleted: false, isActive: true },
        });
        if (!staff) {
            throw new common_1.NotFoundException('Staff member not found, inactive, or belongs to another business');
        }
        const staffService = await this.prisma.staffService.findFirst({
            where: { staffId: dto.staffId, serviceId: dto.serviceId, businessId },
        });
        if (!staffService) {
            throw new common_1.BadRequestException('Staff member is not assigned to provide this service');
        }
        const endAt = new Date(startAt.getTime() + service.durationMinutes * 60 * 1000);
        let customerId = dto.customerId;
        if (!customerId) {
            if (!dto.customerName || !dto.customerEmail || !dto.customerPhone) {
                throw new common_1.BadRequestException('Customer details (name, email, phone) are required when customerId is not provided');
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
        }
        else {
            const existingCustomer = await this.prisma.customer.findFirst({
                where: { id: customerId, businessId },
            });
            if (!existingCustomer) {
                throw new common_1.NotFoundException('Customer not found for this business');
            }
        }
        const result = await this.prisma.$transaction(async (tx) => {
            const existingConflict = await tx.appointment.findFirst({
                where: {
                    businessId,
                    staffId: dto.staffId,
                    status: { in: [client_1.AppointmentStatus.CONFIRMED, client_1.AppointmentStatus.PENDING] },
                    startAt: { lt: endAt },
                    endAt: { gt: startAt },
                },
            });
            if (existingConflict) {
                throw new common_1.ConflictException('This appointment time is no longer available.');
            }
            const appointment = await tx.appointment.create({
                data: {
                    businessId,
                    customerId,
                    serviceId: service.id,
                    staffId: staff.id,
                    startAt,
                    endAt,
                    status: client_1.AppointmentStatus.CONFIRMED,
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
        this.eventsGateway?.emitAppointmentCreated(businessId, result);
        return result;
    }
    async updateStatus(businessId, id, status, actorUserId) {
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
        this.eventsGateway?.emitAppointmentStatusUpdated(businessId, updated.id, status, updated);
        return updated;
    }
    async cancel(businessId, id, dto, actorUserId) {
        const appointment = await this.findOne(businessId, id);
        if (appointment.status === client_1.AppointmentStatus.CANCELLED) {
            throw new common_1.BadRequestException('Appointment is already cancelled');
        }
        const updated = await this.prisma.appointment.update({
            where: { id: appointment.id },
            data: {
                status: client_1.AppointmentStatus.CANCELLED,
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
        this.eventsGateway?.emitAppointmentStatusUpdated(businessId, updated.id, client_1.AppointmentStatus.CANCELLED, updated);
        return updated;
    }
};
exports.AppointmentsService = AppointmentsService;
exports.AppointmentsService = AppointmentsService = AppointmentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService,
        events_gateway_1.EventsGateway])
], AppointmentsService);
//# sourceMappingURL=appointments.service.js.map