"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsModule = void 0;
const common_1 = require("@nestjs/common");
const notifications_service_1 = require("./notifications.service");
const email_provider_1 = require("./providers/email.provider");
const sms_whatsapp_provider_1 = require("./providers/sms-whatsapp.provider");
const console_notification_provider_1 = require("./providers/console-notification.provider");
const reminder_cron_service_1 = require("./reminder-cron.service");
let NotificationsModule = class NotificationsModule {
};
exports.NotificationsModule = NotificationsModule;
exports.NotificationsModule = NotificationsModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            notifications_service_1.NotificationsService,
            email_provider_1.EmailProvider,
            sms_whatsapp_provider_1.SmsWhatsappProvider,
            console_notification_provider_1.ConsoleNotificationProvider,
            reminder_cron_service_1.ReminderCronService,
        ],
        exports: [
            notifications_service_1.NotificationsService,
            email_provider_1.EmailProvider,
            sms_whatsapp_provider_1.SmsWhatsappProvider,
            reminder_cron_service_1.ReminderCronService,
        ],
    })
], NotificationsModule);
//# sourceMappingURL=notifications.module.js.map