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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentVerificationResponseDto = exports.CreatePaymentOrderResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class CreatePaymentOrderResponseDto {
}
exports.CreatePaymentOrderResponseDto = CreatePaymentOrderResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'order_NxABC123456789' }),
    __metadata("design:type", String)
], CreatePaymentOrderResponseDto.prototype, "orderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 19900, description: 'Amount in minor currency units (paise: ₹199 = 19900)' }),
    __metadata("design:type", Number)
], CreatePaymentOrderResponseDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'INR' }),
    __metadata("design:type", String)
], CreatePaymentOrderResponseDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'rzp_test_placeholder' }),
    __metadata("design:type", String)
], CreatePaymentOrderResponseDto.prototype, "keyId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Apex Barber Studio' }),
    __metadata("design:type", String)
], CreatePaymentOrderResponseDto.prototype, "businessName", void 0);
class PaymentVerificationResponseDto {
}
exports.PaymentVerificationResponseDto = PaymentVerificationResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], PaymentVerificationResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Subscription activated successfully' }),
    __metadata("design:type", String)
], PaymentVerificationResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ACTIVE' }),
    __metadata("design:type", String)
], PaymentVerificationResponseDto.prototype, "subscriptionStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-09-25T18:00:00.000Z' }),
    __metadata("design:type", Date)
], PaymentVerificationResponseDto.prototype, "currentPeriodEnd", void 0);
//# sourceMappingURL=payment-response.dto.js.map