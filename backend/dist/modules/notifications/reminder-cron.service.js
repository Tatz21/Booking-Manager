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
var ReminderCronService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReminderCronService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../database/prisma.service");
const notifications_service_1 = require("./notifications.service");
const client_1 = require("@prisma/client");
let ReminderCronService = ReminderCronService_1 = class ReminderCronService {
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
        this.logger = new common_1.Logger(ReminderCronService_1.name);
    }
    async handleScheduledReminders() {
        this.logger.log('⏰ Running automated appointment reminders cron sweep...');
        try {
            const results24h = await this.process24HourReminders();
            const results2h = await this.process2HourReminders();
            this.logger.log(`✅ Reminders processed: ${results24h.sent} (24H) sent, ${results2h.sent} (2H) sent`);
        }
        catch (err) {
            this.logger.error(`Failed executing reminder cron: ${err.message}`);
        }
    }
    async process24HourReminders() {
        const now = new Date();
        const windowStart = new Date(now.getTime() + 23.75 * 60 * 60 * 1000);
        const windowEnd = new Date(now.getTime() + 24.25 * 60 * 60 * 1000);
        const appointments = await this.prisma.appointment.findMany({
            where: {
                status: client_1.AppointmentStatus.CONFIRMED,
                startAt: {
                    gte: windowStart,
                    lte: windowEnd,
                },
            },
            include: {
                business: {
                    include: {
                        bookingSettings: true,
                    },
                },
                customer: true,
                service: true,
                staff: true,
                notifications: {
                    where: {
                        type: client_1.NotificationType.REMINDER_24H,
                        status: client_1.NotificationStatus.SENT,
                    },
                },
            },
        });
        let sent = 0;
        for (const appt of appointments) {
            if (appt.notifications && appt.notifications.length > 0) {
                continue;
            }
            if (appt.business.bookingSettings?.reminder24hEnabled === false) {
                continue;
            }
            await this.notificationsService.sendAppointmentReminder({
                businessId: appt.businessId,
                appointmentId: appt.id,
                businessName: appt.business.name,
                businessSlug: appt.business.slug,
                businessEmail: appt.business.email || undefined,
                businessPhone: appt.business.phone || undefined,
                businessLocation: appt.business.location || undefined,
                customerName: appt.customer.name,
                customerEmail: appt.customer.email,
                customerPhone: appt.customer.phone || undefined,
                serviceName: appt.service.name,
                servicePricePaise: appt.service.price,
                currency: appt.currency,
                durationMinutes: appt.service.durationMinutes,
                staffName: appt.staff.name,
                startAt: appt.startAt,
                endAt: appt.endAt,
            }, '24H');
            sent++;
        }
        return { checked: appointments.length, sent };
    }
    async process2HourReminders() {
        const now = new Date();
        const windowStart = new Date(now.getTime() + 1.75 * 60 * 60 * 1000);
        const windowEnd = new Date(now.getTime() + 2.25 * 60 * 60 * 1000);
        const appointments = await this.prisma.appointment.findMany({
            where: {
                status: client_1.AppointmentStatus.CONFIRMED,
                startAt: {
                    gte: windowStart,
                    lte: windowEnd,
                },
            },
            include: {
                business: {
                    include: {
                        bookingSettings: true,
                    },
                },
                customer: true,
                service: true,
                staff: true,
                notifications: {
                    where: {
                        type: client_1.NotificationType.REMINDER_2H,
                        status: client_1.NotificationStatus.SENT,
                    },
                },
            },
        });
        let sent = 0;
        for (const appt of appointments) {
            if (appt.notifications && appt.notifications.length > 0) {
                continue;
            }
            if (appt.business.bookingSettings?.reminder2hEnabled === false) {
                continue;
            }
            await this.notificationsService.sendAppointmentReminder({
                businessId: appt.businessId,
                appointmentId: appt.id,
                businessName: appt.business.name,
                businessSlug: appt.business.slug,
                businessEmail: appt.business.email || undefined,
                businessPhone: appt.business.phone || undefined,
                businessLocation: appt.business.location || undefined,
                customerName: appt.customer.name,
                customerEmail: appt.customer.email,
                customerPhone: appt.customer.phone || undefined,
                serviceName: appt.service.name,
                servicePricePaise: appt.service.price,
                currency: appt.currency,
                durationMinutes: appt.service.durationMinutes,
                staffName: appt.staff.name,
                startAt: appt.startAt,
                endAt: appt.endAt,
            }, '2H');
            sent++;
        }
        return { checked: appointments.length, sent };
    }
};
exports.ReminderCronService = ReminderCronService;
__decorate([
    (0, schedule_1.Cron)('*/5 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReminderCronService.prototype, "handleScheduledReminders", null);
exports.ReminderCronService = ReminderCronService = ReminderCronService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], ReminderCronService);
//# sourceMappingURL=reminder-cron.service.js.map