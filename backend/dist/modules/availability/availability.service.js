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
var AvailabilityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let AvailabilityService = AvailabilityService_1 = class AvailabilityService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AvailabilityService_1.name);
    }
    async getBusinessHours(businessId) {
        if (!businessId)
            throw new common_1.ForbiddenException('Tenant context missing');
        const hours = await this.prisma.businessHours.findMany({
            where: { businessId },
            orderBy: { dayOfWeek: 'asc' },
        });
        return hours;
    }
    async setBusinessHours(businessId, dto) {
        if (!businessId)
            throw new common_1.ForbiddenException('Tenant context missing');
        return this.prisma.$transaction(async (tx) => {
            for (const day of dto.hours) {
                await tx.businessHours.upsert({
                    where: {
                        businessId_dayOfWeek: {
                            businessId,
                            dayOfWeek: day.dayOfWeek,
                        },
                    },
                    update: {
                        openTime: day.openTime,
                        closeTime: day.closeTime,
                        isClosed: day.isClosed ?? false,
                        breaksJson: day.breaks ? day.breaks : undefined,
                    },
                    create: {
                        businessId,
                        dayOfWeek: day.dayOfWeek,
                        openTime: day.openTime,
                        closeTime: day.closeTime,
                        isClosed: day.isClosed ?? false,
                        breaksJson: day.breaks ? day.breaks : undefined,
                    },
                });
            }
            return tx.businessHours.findMany({
                where: { businessId },
                orderBy: { dayOfWeek: 'asc' },
            });
        });
    }
    async getStaffAvailability(businessId, staffId) {
        if (!businessId)
            throw new common_1.ForbiddenException('Tenant context missing');
        const staff = await this.prisma.staff.findFirst({
            where: { id: staffId, businessId, isDeleted: false },
        });
        if (!staff) {
            throw new common_1.NotFoundException(`Staff member with ID "${staffId}" not found`);
        }
        return this.prisma.staffAvailability.findMany({
            where: { staffId, businessId },
            orderBy: { dayOfWeek: 'asc' },
        });
    }
    async setStaffAvailability(businessId, staffId, dto) {
        if (!businessId)
            throw new common_1.ForbiddenException('Tenant context missing');
        const staff = await this.prisma.staff.findFirst({
            where: { id: staffId, businessId, isDeleted: false },
        });
        if (!staff) {
            throw new common_1.NotFoundException(`Staff member with ID "${staffId}" not found`);
        }
        return this.prisma.$transaction(async (tx) => {
            for (const shift of dto.shifts) {
                await tx.staffAvailability.upsert({
                    where: {
                        staffId_dayOfWeek: {
                            staffId,
                            dayOfWeek: shift.dayOfWeek,
                        },
                    },
                    update: {
                        startTime: shift.startTime,
                        endTime: shift.endTime,
                        isOff: shift.isOff ?? false,
                        breaksJson: shift.breaks ? shift.breaks : undefined,
                    },
                    create: {
                        businessId,
                        staffId,
                        dayOfWeek: shift.dayOfWeek,
                        startTime: shift.startTime,
                        endTime: shift.endTime,
                        isOff: shift.isOff ?? false,
                        breaksJson: shift.breaks ? shift.breaks : undefined,
                    },
                });
            }
            return tx.staffAvailability.findMany({
                where: { staffId, businessId },
                orderBy: { dayOfWeek: 'asc' },
            });
        });
    }
    parseTimeToMinutes(timeStr) {
        const [h, m] = timeStr.split(':').map((v) => parseInt(v, 10));
        return h * 60 + m;
    }
    formatMinutesToTime(totalMinutes) {
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }
    async getAvailableSlots(businessId, query) {
        if (!businessId)
            throw new common_1.ForbiddenException('Tenant context missing');
        const [business, service, settings] = await Promise.all([
            this.prisma.business.findUnique({
                where: { id: businessId },
                include: { businessHours: true },
            }),
            this.prisma.service.findFirst({
                where: { id: query.serviceId, businessId, isDeleted: false, isActive: true },
            }),
            this.prisma.bookingSettings.findUnique({
                where: { businessId },
            }),
        ]);
        if (!business)
            throw new common_1.NotFoundException('Business not found');
        if (!service)
            throw new common_1.NotFoundException('Service not found or inactive');
        const slotInterval = settings?.slotIntervalMinutes || 30;
        const minNoticeMinutes = settings?.minNoticeMinutes || 60;
        const [year, month, day] = query.date.split('-').map(Number);
        const targetDateObj = new Date(Date.UTC(year, month - 1, day));
        const dayOfWeek = targetDateObj.getUTCDay();
        const bizHours = business.businessHours.find((bh) => bh.dayOfWeek === dayOfWeek);
        if (!bizHours || bizHours.isClosed) {
            return {
                date: query.date,
                timezone: business.timezone,
                availableSlots: [],
            };
        }
        const bizOpenMin = this.parseTimeToMinutes(bizHours.openTime);
        const bizCloseMin = this.parseTimeToMinutes(bizHours.closeTime);
        const bizBreaks = bizHours.breaksJson || [];
        let staffList = await this.prisma.staff.findMany({
            where: {
                businessId,
                isDeleted: false,
                isActive: true,
                ...(query.staffId ? { id: query.staffId } : {}),
                staffServices: {
                    some: { serviceId: query.serviceId },
                },
            },
            include: {
                staffAvailability: {
                    where: { dayOfWeek },
                },
            },
        });
        if (query.staffId && staffList.length === 0) {
            throw new common_1.BadRequestException('Selected staff member is not available for this service');
        }
        const startOfDayUTC = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
        const endOfDayUTC = new Date(Date.UTC(year, month - 1, day, 23, 59, 59));
        const appointments = await this.prisma.appointment.findMany({
            where: {
                businessId,
                staffId: { in: staffList.map((s) => s.id) },
                status: { in: ['CONFIRMED', 'PENDING'] },
                startAt: { gte: startOfDayUTC, lte: endOfDayUTC },
            },
        });
        const now = new Date();
        const serviceDuration = service.durationMinutes;
        const availableSlots = [];
        for (const staff of staffList) {
            const shift = staff.staffAvailability[0];
            if (!shift || shift.isOff)
                continue;
            const staffStartMin = this.parseTimeToMinutes(shift.startTime);
            const staffEndMin = this.parseTimeToMinutes(shift.endTime);
            const staffBreaks = shift.breaksJson || [];
            const effectiveStartMin = Math.max(bizOpenMin, staffStartMin);
            const effectiveEndMin = Math.min(bizCloseMin, staffEndMin);
            const staffAppointments = appointments.filter((a) => a.staffId === staff.id);
            for (let slotMin = effectiveStartMin; slotMin + serviceDuration <= effectiveEndMin; slotMin += slotInterval) {
                const slotStartMin = slotMin;
                const slotEndMin = slotMin + serviceDuration;
                const overlapsBizBreak = bizBreaks.some((brk) => {
                    const bStart = this.parseTimeToMinutes(brk.start);
                    const bEnd = this.parseTimeToMinutes(brk.end);
                    return slotStartMin < bEnd && slotEndMin > bStart;
                });
                if (overlapsBizBreak)
                    continue;
                const overlapsStaffBreak = staffBreaks.some((brk) => {
                    const bStart = this.parseTimeToMinutes(brk.start);
                    const bEnd = this.parseTimeToMinutes(brk.end);
                    return slotStartMin < bEnd && slotEndMin > bStart;
                });
                if (overlapsStaffBreak)
                    continue;
                const slotStartHours = Math.floor(slotStartMin / 60);
                const slotStartMins = slotStartMin % 60;
                const slotEndHours = Math.floor(slotEndMin / 60);
                const slotEndMins = slotEndMin % 60;
                const slotStartDate = new Date(Date.UTC(year, month - 1, day, slotStartHours, slotStartMins, 0));
                const slotEndDate = new Date(Date.UTC(year, month - 1, day, slotEndHours, slotEndMins, 0));
                const minNoticeThreshold = new Date(now.getTime() + minNoticeMinutes * 60 * 1000);
                if (slotStartDate < minNoticeThreshold) {
                    continue;
                }
                const overlapsAppointment = staffAppointments.some((app) => {
                    return app.startAt < slotEndDate && app.endAt > slotStartDate;
                });
                if (overlapsAppointment)
                    continue;
                availableSlots.push({
                    time: this.formatMinutesToTime(slotStartMin),
                    startAt: slotStartDate.toISOString(),
                    endAt: slotEndDate.toISOString(),
                    staffId: staff.id,
                    staffName: staff.name,
                });
            }
        }
        availableSlots.sort((a, b) => a.startAt.localeCompare(b.startAt));
        return {
            date: query.date,
            timezone: business.timezone,
            availableSlots,
        };
    }
};
exports.AvailabilityService = AvailabilityService;
exports.AvailabilityService = AvailabilityService = AvailabilityService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AvailabilityService);
//# sourceMappingURL=availability.service.js.map