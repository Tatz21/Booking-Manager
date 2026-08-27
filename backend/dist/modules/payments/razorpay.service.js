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
var RazorpayService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RazorpayService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = require("crypto");
let RazorpayService = RazorpayService_1 = class RazorpayService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(RazorpayService_1.name);
    }
    getKeyId() {
        return this.configService.get('RAZORPAY_KEY_ID', 'rzp_test_placeholder');
    }
    getKeySecret() {
        return this.configService.get('RAZORPAY_KEY_SECRET', 'rzp_test_secret_placeholder');
    }
    getWebhookSecret() {
        return this.configService.get('RAZORPAY_WEBHOOK_SECRET', 'rzp_webhook_secret_placeholder');
    }
    verifyPaymentSignature(orderId, paymentId, signature) {
        try {
            const secret = this.getKeySecret();
            const body = `${orderId}|${paymentId}`;
            const expectedSignature = crypto
                .createHmac('sha256', secret)
                .update(body)
                .digest('hex');
            return crypto.timingSafeEqual(Buffer.from(signature, 'utf8'), Buffer.from(expectedSignature, 'utf8'));
        }
        catch (err) {
            this.logger.error('Error verifying payment signature', err);
            return false;
        }
    }
    verifyWebhookSignature(rawBody, signature) {
        try {
            const secret = this.getWebhookSecret();
            const payload = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
            const expectedSignature = crypto
                .createHmac('sha256', secret)
                .update(payload)
                .digest('hex');
            return crypto.timingSafeEqual(Buffer.from(signature, 'utf8'), Buffer.from(expectedSignature, 'utf8'));
        }
        catch (err) {
            this.logger.error('Error verifying webhook signature', err);
            return false;
        }
    }
    generateOrderId() {
        return `order_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    }
};
exports.RazorpayService = RazorpayService;
exports.RazorpayService = RazorpayService = RazorpayService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RazorpayService);
//# sourceMappingURL=razorpay.service.js.map