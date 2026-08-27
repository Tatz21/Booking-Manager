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
exports.AppointmentResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class AppointmentResponseDto {
}
exports.AppointmentResponseDto = AppointmentResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'a1a2a3a4-e5f6-7890-abcd-ef1234567890' }),
    __metadata("design:type", String)
], AppointmentResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'b1b2c3d4-e5f6-7890-abcd-ef1234567890' }),
    __metadata("design:type", String)
], AppointmentResponseDto.prototype, "businessId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'c1c2c3c4-e5f6-7890-abcd-ef1234567890' }),
    __metadata("design:type", String)
], AppointmentResponseDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 's1s2s3s4-e5f6-7890-abcd-ef1234567890' }),
    __metadata("design:type", String)
], AppointmentResponseDto.prototype, "serviceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'st1st2st3-e5f6-7890-abcd-ef1234567890' }),
    __metadata("design:type", String)
], AppointmentResponseDto.prototype, "staffId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-09-01T10:00:00.000Z' }),
    __metadata("design:type", Date)
], AppointmentResponseDto.prototype, "startAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-09-01T10:45:00.000Z' }),
    __metadata("design:type", Date)
], AppointmentResponseDto.prototype, "endAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.AppointmentStatus, example: client_1.AppointmentStatus.CONFIRMED }),
    __metadata("design:type", String)
], AppointmentResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 49900, description: 'Price in minor units (paise)' }),
    __metadata("design:type", Number)
], AppointmentResponseDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'INR' }),
    __metadata("design:type", String)
], AppointmentResponseDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Special haircut', nullable: true }),
    __metadata("design:type", Object)
], AppointmentResponseDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: null, nullable: true }),
    __metadata("design:type", Object)
], AppointmentResponseDto.prototype, "cancelReason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-08-25T18:00:00.000Z' }),
    __metadata("design:type", Date)
], AppointmentResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-08-25T18:00:00.000Z' }),
    __metadata("design:type", Date)
], AppointmentResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=appointment-response.dto.js.map