"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleNotificationProvider = void 0;
const common_1 = require("@nestjs/common");
let ConsoleNotificationProvider = class ConsoleNotificationProvider {
    constructor() {
        this.logger = new common_1.Logger('NotificationService');
    }
    async send(payload) {
        try {
            this.logger.log(`[EMAIL NOTIFICATION DISPATCHED] To: ${payload.recipientEmail} (${payload.recipientName}) | Subject: "${payload.subject}" | Message: ${payload.message}`);
            return { success: true, messageId: `msg_${Date.now()}` };
        }
        catch (err) {
            this.logger.error(`Failed to dispatch notification to ${payload.recipientEmail}`, err);
            return { success: false, error: err.message };
        }
    }
};
exports.ConsoleNotificationProvider = ConsoleNotificationProvider;
exports.ConsoleNotificationProvider = ConsoleNotificationProvider = __decorate([
    (0, common_1.Injectable)()
], ConsoleNotificationProvider);
//# sourceMappingURL=console-notification.provider.js.map