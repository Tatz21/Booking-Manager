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
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const email_provider_1 = require("./providers/email.provider");
const sms_whatsapp_provider_1 = require("./providers/sms-whatsapp.provider");
const console_notification_provider_1 = require("./providers/console-notification.provider");
const client_1 = require("@prisma/client");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(prisma, emailProvider, smsWhatsappProvider, legacyConsoleProvider) {
        this.prisma = prisma;
        this.emailProvider = emailProvider;
        this.smsWhatsappProvider = smsWhatsappProvider;
        this.legacyConsoleProvider = legacyConsoleProvider;
        this.logger = new common_1.Logger(NotificationsService_1.name);
    }
    async sendAppointmentConfirmation(details) {
        const data = {
            businessName: details.businessName,
            businessSlug: details.businessSlug,
            businessEmail: details.businessEmail,
            businessPhone: details.businessPhone,
            businessLocation: details.businessLocation,
            primaryColor: details.primaryColor || '#4F46E5',
            logoUrl: details.logoUrl,
            customerName: details.customerName,
            customerEmail: details.customerEmail,
            customerPhone: details.customerPhone,
            serviceName: details.serviceName,
            servicePricePaise: details.servicePricePaise || 0,
            currency: details.currency || 'INR',
            durationMinutes: details.durationMinutes || 30,
            staffName: details.staffName,
            startAt: new Date(details.startAt),
            endAt: details.endAt
                ? new Date(details.endAt)
                : new Date(new Date(details.startAt).getTime() + (details.durationMinutes || 30) * 60 * 1000),
            notes: details.notes,
            appointmentId: details.appointmentId,
        };
        const icsContent = this.emailProvider.generateIcsContent(data);
        const htmlReceipt = this.emailProvider.renderCustomerConfirmationHtml(data);
        const subject = `Booking Confirmed: ${data.serviceName} at ${data.businessName}`;
        try {
            const emailRes = await this.emailProvider.sendEmail({
                to: data.customerEmail,
                recipientName: data.customerName,
                subject,
                title: 'Booking Confirmed',
                html: htmlReceipt,
                text: `Your appointment for ${data.serviceName} with ${data.staffName} at ${data.businessName} is confirmed for ${data.startAt.toUTCString()}.`,
                attachments: [
                    {
                        filename: `invite-${data.appointmentId || 'booking'}.ics`,
                        content: icsContent,
                        contentType: 'text/calendar; charset=utf-8; method=REQUEST',
                    },
                ],
                metadata: { businessName: data.businessName },
            });
            await this.logNotification({
                businessId: details.businessId,
                appointmentId: details.appointmentId,
                channel: client_1.NotificationChannel.EMAIL,
                type: client_1.NotificationType.CONFIRMATION,
                status: emailRes.success ? client_1.NotificationStatus.SENT : client_1.NotificationStatus.FAILED,
                recipient: data.customerEmail,
                subject,
                content: `Confirmation email with ICS attachment sent to ${data.customerEmail}`,
                error: emailRes.error,
            });
        }
        catch (err) {
            this.logger.error(`Error sending customer email: ${err.message}`);
        }
        if (details.staffEmail) {
            try {
                const staffHtml = this.emailProvider.renderStaffAlertHtml(data);
                const staffSubject = `New Booking: ${data.customerName} - ${data.serviceName}`;
                const staffRes = await this.emailProvider.sendEmail({
                    to: details.staffEmail,
                    recipientName: data.staffName,
                    subject: staffSubject,
                    title: 'New Booking Assigned',
                    html: staffHtml,
                    text: `New booking: ${data.customerName} for ${data.serviceName} at ${data.startAt.toUTCString()}.`,
                });
                await this.logNotification({
                    businessId: details.businessId,
                    appointmentId: details.appointmentId,
                    channel: client_1.NotificationChannel.EMAIL,
                    type: client_1.NotificationType.STAFF_ALERT,
                    status: staffRes.success ? client_1.NotificationStatus.SENT : client_1.NotificationStatus.FAILED,
                    recipient: details.staffEmail,
                    subject: staffSubject,
                    content: `Staff assignment alert sent to ${details.staffEmail}`,
                    error: staffRes.error,
                });
            }
            catch (err) {
                this.logger.error(`Error sending staff email: ${err.message}`);
            }
        }
        if (details.customerPhone) {
            const smsMessage = this.smsWhatsappProvider.formatBookingConfirmation({
                customerName: data.customerName,
                businessName: data.businessName,
                serviceName: data.serviceName,
                staffName: data.staffName,
                startAt: data.startAt,
                businessLocation: data.businessLocation,
            });
            try {
                const smsRes = await this.smsWhatsappProvider.sendSms({
                    to: details.customerPhone,
                    recipientName: data.customerName,
                    channel: 'SMS',
                    message: smsMessage,
                });
                await this.logNotification({
                    businessId: details.businessId,
                    appointmentId: details.appointmentId,
                    channel: client_1.NotificationChannel.SMS,
                    type: client_1.NotificationType.CONFIRMATION,
                    status: smsRes.success ? client_1.NotificationStatus.SENT : client_1.NotificationStatus.FAILED,
                    recipient: details.customerPhone,
                    content: smsMessage,
                    error: smsRes.error,
                });
                const waRes = await this.smsWhatsappProvider.sendWhatsApp({
                    to: details.customerPhone,
                    recipientName: data.customerName,
                    channel: 'WHATSAPP',
                    message: smsMessage,
                });
                await this.logNotification({
                    businessId: details.businessId,
                    appointmentId: details.appointmentId,
                    channel: client_1.NotificationChannel.WHATSAPP,
                    type: client_1.NotificationType.CONFIRMATION,
                    status: waRes.success ? client_1.NotificationStatus.SENT : client_1.NotificationStatus.FAILED,
                    recipient: details.customerPhone,
                    content: smsMessage,
                    error: waRes.error,
                });
            }
            catch (err) {
                this.logger.error(`Error sending SMS/WhatsApp: ${err.message}`);
            }
        }
        return { success: true };
    }
    async sendAppointmentCancellation(details) {
        const data = {
            businessName: details.businessName,
            customerName: details.customerName,
            customerEmail: details.customerEmail,
            customerPhone: details.customerPhone,
            serviceName: details.serviceName,
            servicePricePaise: details.servicePricePaise || 0,
            currency: details.currency || 'INR',
            durationMinutes: details.durationMinutes || 30,
            staffName: details.staffName,
            startAt: new Date(details.startAt),
            endAt: new Date(details.endAt || details.startAt),
            cancellationReason: details.reason,
            appointmentId: details.appointmentId,
        };
        const cancelHtml = this.emailProvider.renderCancellationHtml(data);
        const subject = `Cancelled: ${data.serviceName} at ${data.businessName}`;
        try {
            const emailRes = await this.emailProvider.sendEmail({
                to: data.customerEmail,
                recipientName: data.customerName,
                subject,
                title: 'Booking Cancelled',
                html: cancelHtml,
                text: `Your appointment for ${data.serviceName} at ${data.businessName} scheduled for ${data.startAt.toUTCString()} has been cancelled. Reason: ${details.reason || 'None provided'}`,
            });
            await this.logNotification({
                businessId: details.businessId,
                appointmentId: details.appointmentId,
                channel: client_1.NotificationChannel.EMAIL,
                type: client_1.NotificationType.CANCELLATION,
                status: emailRes.success ? client_1.NotificationStatus.SENT : client_1.NotificationStatus.FAILED,
                recipient: data.customerEmail,
                subject,
                content: `Cancellation email sent to ${data.customerEmail}`,
                error: emailRes.error,
            });
        }
        catch (err) {
            this.logger.error(`Error sending cancellation email: ${err.message}`);
        }
        if (details.customerPhone) {
            const cancelSms = this.smsWhatsappProvider.formatCancellationMessage({
                customerName: data.customerName,
                businessName: data.businessName,
                serviceName: data.serviceName,
                startAt: data.startAt,
                reason: details.reason,
            });
            try {
                const smsRes = await this.smsWhatsappProvider.sendSms({
                    to: details.customerPhone,
                    recipientName: data.customerName,
                    channel: 'SMS',
                    message: cancelSms,
                });
                await this.logNotification({
                    businessId: details.businessId,
                    appointmentId: details.appointmentId,
                    channel: client_1.NotificationChannel.SMS,
                    type: client_1.NotificationType.CANCELLATION,
                    status: smsRes.success ? client_1.NotificationStatus.SENT : client_1.NotificationStatus.FAILED,
                    recipient: details.customerPhone,
                    content: cancelSms,
                    error: smsRes.error,
                });
            }
            catch (err) {
                this.logger.error(`Error sending cancellation SMS: ${err.message}`);
            }
        }
        return { success: true };
    }
    async sendAppointmentReminder(details, reminderType) {
        const data = {
            businessName: details.businessName,
            customerName: details.customerName,
            customerEmail: details.customerEmail,
            customerPhone: details.customerPhone,
            serviceName: details.serviceName,
            servicePricePaise: details.servicePricePaise || 0,
            currency: details.currency || 'INR',
            durationMinutes: details.durationMinutes || 30,
            staffName: details.staffName,
            startAt: new Date(details.startAt),
            endAt: new Date(details.endAt || details.startAt),
            businessLocation: details.businessLocation,
            appointmentId: details.appointmentId,
        };
        const notifType = reminderType === '24H'
            ? client_1.NotificationType.REMINDER_24H
            : client_1.NotificationType.REMINDER_2H;
        const htmlReminder = this.emailProvider.renderReminderHtml(data, reminderType);
        const subject = `Reminder: ${data.serviceName} ${reminderType === '24H' ? 'Tomorrow' : 'in 2 Hours'} at ${data.businessName}`;
        try {
            const emailRes = await this.emailProvider.sendEmail({
                to: data.customerEmail,
                recipientName: data.customerName,
                subject,
                title: `Appointment Reminder (${reminderType})`,
                html: htmlReminder,
                text: `Reminder: Your appointment for ${data.serviceName} at ${data.businessName} is on ${data.startAt.toUTCString()}.`,
            });
            await this.logNotification({
                businessId: details.businessId,
                appointmentId: details.appointmentId,
                channel: client_1.NotificationChannel.EMAIL,
                type: notifType,
                status: emailRes.success ? client_1.NotificationStatus.SENT : client_1.NotificationStatus.FAILED,
                recipient: data.customerEmail,
                subject,
                content: `Reminder ${reminderType} email sent`,
                error: emailRes.error,
            });
        }
        catch (err) {
            this.logger.error(`Error sending reminder email: ${err.message}`);
        }
        if (details.customerPhone) {
            const reminderMsg = this.smsWhatsappProvider.formatReminderMessage({
                customerName: data.customerName,
                businessName: data.businessName,
                serviceName: data.serviceName,
                staffName: data.staffName,
                startAt: data.startAt,
                reminderType,
                businessLocation: data.businessLocation,
            });
            try {
                const smsRes = await this.smsWhatsappProvider.sendSms({
                    to: details.customerPhone,
                    recipientName: data.customerName,
                    channel: 'SMS',
                    message: reminderMsg,
                });
                await this.logNotification({
                    businessId: details.businessId,
                    appointmentId: details.appointmentId,
                    channel: client_1.NotificationChannel.SMS,
                    type: notifType,
                    status: smsRes.success ? client_1.NotificationStatus.SENT : client_1.NotificationStatus.FAILED,
                    recipient: details.customerPhone,
                    content: reminderMsg,
                    error: smsRes.error,
                });
            }
            catch (err) {
                this.logger.error(`Error sending reminder SMS: ${err.message}`);
            }
        }
        return { success: true };
    }
    async logNotification(params) {
        if (!params.businessId)
            return;
        try {
            await this.prisma.notificationLog.create({
                data: {
                    businessId: params.businessId,
                    appointmentId: params.appointmentId,
                    channel: params.channel,
                    type: params.type,
                    status: params.status,
                    recipient: params.recipient,
                    subject: params.subject,
                    content: params.content,
                    error: params.error,
                },
            });
        }
        catch (err) {
            this.logger.warn(`Failed to record notification log to database: ${err.message}`);
        }
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_provider_1.EmailProvider,
        sms_whatsapp_provider_1.SmsWhatsappProvider,
        console_notification_provider_1.ConsoleNotificationProvider])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map