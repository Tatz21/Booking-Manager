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
var CustomersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let CustomersService = CustomersService_1 = class CustomersService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CustomersService_1.name);
    }
    async findAll(businessId, query) {
        if (!businessId)
            throw new common_1.ForbiddenException('Tenant context missing');
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;
        const where = {
            businessId,
        };
        if (query.search) {
            const search = query.search.trim();
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [items, total] = await Promise.all([
            this.prisma.customer.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { appointments: true },
                    },
                },
            }),
            this.prisma.customer.count({ where }),
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
        const customer = await this.prisma.customer.findFirst({
            where: { id, businessId },
            include: {
                appointments: {
                    orderBy: { startAt: 'desc' },
                    include: {
                        service: { select: { id: true, name: true, price: true, durationMinutes: true } },
                        staff: { select: { id: true, name: true, roleTitle: true } },
                    },
                },
            },
        });
        if (!customer) {
            throw new common_1.NotFoundException(`Customer with ID "${id}" not found`);
        }
        return customer;
    }
    async update(businessId, id, dto) {
        await this.findOne(businessId, id);
        return this.prisma.customer.update({
            where: { id },
            data: {
                ...(dto.name !== undefined && { name: dto.name.trim() }),
                ...(dto.email !== undefined && { email: dto.email.trim().toLowerCase() }),
                ...(dto.phone !== undefined && { phone: dto.phone.trim() }),
                ...(dto.notes !== undefined && { notes: dto.notes.trim() }),
            },
        });
    }
    async findOrCreate(businessId, data) {
        const normalizedEmail = data.email.trim().toLowerCase();
        const normalizedPhone = data.phone.trim();
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
                    name: data.name.trim(),
                    email: normalizedEmail,
                    phone: normalizedPhone,
                    notes: data.notes?.trim(),
                },
            });
        }
        else {
            customer = await this.prisma.customer.update({
                where: { id: customer.id },
                data: {
                    name: data.name.trim(),
                    ...(data.notes && { notes: data.notes.trim() }),
                },
            });
        }
        return customer;
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = CustomersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map