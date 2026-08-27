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
var ServicesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let ServicesService = ServicesService_1 = class ServicesService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ServicesService_1.name);
    }
    async findAll(businessId, includeInactive = false) {
        if (!businessId) {
            throw new common_1.ForbiddenException('Tenant context missing');
        }
        return this.prisma.service.findMany({
            where: {
                businessId,
                isDeleted: false,
                ...(includeInactive ? {} : { isActive: true }),
            },
            orderBy: { name: 'asc' },
        });
    }
    async findOne(businessId, id) {
        if (!businessId) {
            throw new common_1.ForbiddenException('Tenant context missing');
        }
        const service = await this.prisma.service.findFirst({
            where: {
                id,
                businessId,
                isDeleted: false,
            },
            include: {
                staffServices: {
                    include: {
                        staff: {
                            select: {
                                id: true,
                                name: true,
                                roleTitle: true,
                                isActive: true,
                            },
                        },
                    },
                },
            },
        });
        if (!service) {
            throw new common_1.NotFoundException(`Service with ID "${id}" not found`);
        }
        return service;
    }
    async create(businessId, dto) {
        if (!businessId) {
            throw new common_1.ForbiddenException('Tenant context missing');
        }
        let currency = dto.currency;
        if (!currency) {
            const business = await this.prisma.business.findUnique({
                where: { id: businessId },
                select: { currency: true },
            });
            currency = business?.currency || 'INR';
        }
        return this.prisma.service.create({
            data: {
                businessId,
                name: dto.name.trim(),
                description: dto.description?.trim(),
                durationMinutes: dto.durationMinutes,
                price: dto.price,
                currency,
                isActive: dto.isActive !== undefined ? dto.isActive : true,
            },
        });
    }
    async update(businessId, id, dto) {
        await this.findOne(businessId, id);
        return this.prisma.service.update({
            where: { id },
            data: {
                ...(dto.name !== undefined && { name: dto.name.trim() }),
                ...(dto.description !== undefined && { description: dto.description?.trim() }),
                ...(dto.durationMinutes !== undefined && { durationMinutes: dto.durationMinutes }),
                ...(dto.price !== undefined && { price: dto.price }),
                ...(dto.currency !== undefined && { currency: dto.currency }),
                ...(dto.isActive !== undefined && { isActive: dto.isActive }),
            },
        });
    }
    async remove(businessId, id) {
        await this.findOne(businessId, id);
        return this.prisma.service.update({
            where: { id },
            data: {
                isDeleted: true,
                isActive: false,
            },
        });
    }
};
exports.ServicesService = ServicesService;
exports.ServicesService = ServicesService = ServicesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ServicesService);
//# sourceMappingURL=services.service.js.map