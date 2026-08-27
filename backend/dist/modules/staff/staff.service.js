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
var StaffService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let StaffService = StaffService_1 = class StaffService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(StaffService_1.name);
    }
    async findAll(businessId, includeInactive = false) {
        if (!businessId) {
            throw new common_1.ForbiddenException('Tenant context missing');
        }
        return this.prisma.staff.findMany({
            where: {
                businessId,
                isDeleted: false,
                ...(includeInactive ? {} : { isActive: true }),
            },
            include: {
                staffServices: {
                    include: {
                        service: {
                            select: {
                                id: true,
                                name: true,
                                durationMinutes: true,
                                price: true,
                                currency: true,
                                isActive: true,
                            },
                        },
                    },
                },
            },
            orderBy: { name: 'asc' },
        });
    }
    async findOne(businessId, id) {
        if (!businessId) {
            throw new common_1.ForbiddenException('Tenant context missing');
        }
        const staff = await this.prisma.staff.findFirst({
            where: {
                id,
                businessId,
                isDeleted: false,
            },
            include: {
                staffServices: {
                    include: {
                        service: true,
                    },
                },
                staffAvailability: {
                    orderBy: { dayOfWeek: 'asc' },
                },
            },
        });
        if (!staff) {
            throw new common_1.NotFoundException(`Staff member with ID "${id}" not found`);
        }
        return staff;
    }
    async create(businessId, dto) {
        if (!businessId) {
            throw new common_1.ForbiddenException('Tenant context missing');
        }
        if (dto.serviceIds && dto.serviceIds.length > 0) {
            const validServices = await this.prisma.service.findMany({
                where: {
                    id: { in: dto.serviceIds },
                    businessId,
                    isDeleted: false,
                },
                select: { id: true },
            });
            if (validServices.length !== dto.serviceIds.length) {
                throw new common_1.BadRequestException('One or more selected services are invalid or belong to another business');
            }
        }
        return this.prisma.$transaction(async (tx) => {
            const staff = await tx.staff.create({
                data: {
                    businessId,
                    name: dto.name.trim(),
                    email: dto.email?.trim().toLowerCase(),
                    phone: dto.phone?.trim(),
                    roleTitle: dto.roleTitle?.trim(),
                    isActive: dto.isActive !== undefined ? dto.isActive : true,
                },
            });
            if (dto.serviceIds && dto.serviceIds.length > 0) {
                for (const serviceId of dto.serviceIds) {
                    await tx.staffService.create({
                        data: {
                            businessId,
                            staffId: staff.id,
                            serviceId,
                        },
                    });
                }
            }
            const defaultShifts = [
                { dayOfWeek: 0, startTime: '09:00', endTime: '18:00', isOff: true },
                { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isOff: false },
                { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', isOff: false },
                { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', isOff: false },
                { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', isOff: false },
                { dayOfWeek: 5, startTime: '09:00', endTime: '18:00', isOff: false },
                { dayOfWeek: 6, startTime: '09:00', endTime: '18:00', isOff: false },
            ];
            for (const shift of defaultShifts) {
                await tx.staffAvailability.create({
                    data: {
                        businessId,
                        staffId: staff.id,
                        dayOfWeek: shift.dayOfWeek,
                        startTime: shift.startTime,
                        endTime: shift.endTime,
                        isOff: shift.isOff,
                    },
                });
            }
            return staff;
        });
    }
    async update(businessId, id, dto) {
        await this.findOne(businessId, id);
        if (dto.serviceIds !== undefined) {
            await this.assignServices(businessId, id, dto.serviceIds);
        }
        return this.prisma.staff.update({
            where: { id },
            data: {
                ...(dto.name !== undefined && { name: dto.name.trim() }),
                ...(dto.email !== undefined && { email: dto.email?.trim().toLowerCase() }),
                ...(dto.phone !== undefined && { phone: dto.phone?.trim() }),
                ...(dto.roleTitle !== undefined && { roleTitle: dto.roleTitle?.trim() }),
                ...(dto.isActive !== undefined && { isActive: dto.isActive }),
            },
        });
    }
    async remove(businessId, id) {
        await this.findOne(businessId, id);
        return this.prisma.staff.update({
            where: { id },
            data: {
                isDeleted: true,
                isActive: false,
            },
        });
    }
    async assignServices(businessId, staffId, serviceIds) {
        await this.findOne(businessId, staffId);
        if (serviceIds.length > 0) {
            const validServices = await this.prisma.service.findMany({
                where: {
                    id: { in: serviceIds },
                    businessId,
                    isDeleted: false,
                },
                select: { id: true },
            });
            if (validServices.length !== serviceIds.length) {
                throw new common_1.BadRequestException('One or more selected services are invalid or belong to another business');
            }
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.staffService.deleteMany({
                where: { staffId, businessId },
            });
            for (const serviceId of serviceIds) {
                await tx.staffService.create({
                    data: {
                        businessId,
                        staffId,
                        serviceId,
                    },
                });
            }
            return { success: true, assignedCount: serviceIds.length };
        });
    }
};
exports.StaffService = StaffService;
exports.StaffService = StaffService = StaffService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StaffService);
//# sourceMappingURL=staff.service.js.map