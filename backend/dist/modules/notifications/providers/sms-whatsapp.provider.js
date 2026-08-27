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
var SmsWhatsappProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsWhatsappProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let SmsWhatsappProvider = SmsWhatsappProvider_1 = class SmsWhatsappProvider {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(SmsWhatsappProvider_1.name);
        this.twilioAccountSid = this.configService.get('TWILIO_ACCOUNT_SID');
        this.twilioAuthToken = this.configService.get('TWILIO_AUTH_TOKEN');
        this.twilioPhoneNumber = this.configService.get('TWILIO_PHONE_NUMBER');
        this.twilioWhatsAppNumber = this.configService.get('TWILIO_WHATSAPP_NUMBER');
        this.isTwilioConfigured = !!(this.twilioAccountSid &&
            this.twilioAuthToken &&
            this.twilioPhoneNumber);
        if (this.isTwilioConfigured) {
            this.logger.log('📱 Twilio SMS & WhatsApp Gateway is configured and ready');
        }
        else {
            this.logger.log('📱 SMS & WhatsApp Gateway in development console mode');
        }
    }
    async sendSms(payload) {
        if (this.isTwilioConfigured) {
            try {
                const auth = Buffer.from(`${this.twilioAccountSid}:${this.twilioAuthToken}`).toString('base64');
                const params = new URLSearchParams({
                    From: this.twilioPhoneNumber,
                    To: payload.to,
                    Body: payload.message,
                });
                const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.twilioAccountSid}/Messages.json`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Basic ${auth}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: params.toString(),
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || 'Twilio SMS dispatch failed');
                }
                this.logger.log(`📱 Live SMS sent to ${payload.to} (SID: ${data.sid})`);
                return {
                    success: true,
                    messageId: data.sid,
                    channel: 'SMS',
                };
            }
            catch (err) {
                this.logger.error(`Failed to send SMS to ${payload.to}: ${err.message}`);
                return {
                    success: false,
                    channel: 'SMS',
                    error: err.message,
                };
            }
        }
        this.logger.log(`\n================= 💬 [DEV SMS NOTIFICATION] =================\n` +
            `To: ${payload.to} (${payload.recipientName})\n` +
            `Message: ${payload.message}\n` +
            `============================================================\n`);
        return {
            success: true,
            messageId: `dev-sms-${Date.now()}`,
            channel: 'SMS',
        };
    }
    async sendWhatsApp(payload) {
        const waFrom = this.twilioWhatsAppNumber || (this.twilioPhoneNumber ? `whatsapp:${this.twilioPhoneNumber}` : null);
        if (this.isTwilioConfigured && waFrom) {
            try {
                const auth = Buffer.from(`${this.twilioAccountSid}:${this.twilioAuthToken}`).toString('base64');
                const toWa = payload.to.startsWith('whatsapp:') ? payload.to : `whatsapp:${payload.to}`;
                const fromWa = waFrom.startsWith('whatsapp:') ? waFrom : `whatsapp:${waFrom}`;
                const params = new URLSearchParams({
                    From: fromWa,
                    To: toWa,
                    Body: payload.message,
                });
                const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.twilioAccountSid}/Messages.json`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Basic ${auth}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: params.toString(),
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || 'Twilio WhatsApp dispatch failed');
                }
                this.logger.log(`🟢 Live WhatsApp sent to ${payload.to} (SID: ${data.sid})`);
                return {
                    success: true,
                    messageId: data.sid,
                    channel: 'WHATSAPP',
                };
            }
            catch (err) {
                this.logger.error(`Failed to send WhatsApp message to ${payload.to}: ${err.message}`);
                return {
                    success: false,
                    channel: 'WHATSAPP',
                    error: err.message,
                };
            }
        }
        this.logger.log(`\n============= 🟢 [DEV WHATSAPP NOTIFICATION] =============\n` +
            `To: ${payload.to} (${payload.recipientName})\n` +
            `Message: ${payload.message}\n` +
            `==========================================================\n`);
        return {
            success: true,
            messageId: `dev-wa-${Date.now()}`,
            channel: 'WHATSAPP',
        };
    }
    formatBookingConfirmation(data) {
        const dateStr = data.startAt.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
        const timeStr = data.startAt.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
        return `Hi ${data.customerName}! Your appointment for "${data.serviceName}" with ${data.staffName} at ${data.businessName} is confirmed for ${dateStr} at ${timeStr}.${data.businessLocation ? ` Location: ${data.businessLocation}` : ''} See you soon!`;
    }
    formatReminderMessage(data) {
        const timeFrame = data.reminderType === '24H' ? 'tomorrow' : 'in 2 hours';
        const timeStr = data.startAt.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
        return `Reminder from ${data.businessName}: Your ${data.serviceName} appointment with ${data.staffName} is ${timeFrame} at ${timeStr}.${data.businessLocation ? ` Location: ${data.businessLocation}` : ''}`;
    }
    formatCancellationMessage(data) {
        const timeStr = data.startAt.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
        return `Notice: Your ${data.serviceName} booking at ${data.businessName} on ${timeStr} has been cancelled.${data.reason ? ` Reason: ${data.reason}` : ''}`;
    }
};
exports.SmsWhatsappProvider = SmsWhatsappProvider;
exports.SmsWhatsappProvider = SmsWhatsappProvider = SmsWhatsappProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SmsWhatsappProvider);
//# sourceMappingURL=sms-whatsapp.provider.js.map