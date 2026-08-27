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
exports.PublicBookingConfirmationDto = exports.PublicBusinessProfileDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class PublicBusinessProfileDto {
}
exports.PublicBusinessProfileDto = PublicBusinessProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Apex Barber Studio' }),
    __metadata("design:type", String)
], PublicBusinessProfileDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'apex-barber-studio-7a8b' }),
    __metadata("design:type", String)
], PublicBusinessProfileDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Barbershop', nullable: true }),
    __metadata("design:type", Object)
], PublicBusinessProfileDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Luxury grooming salon for men and women', nullable: true }),
    __metadata("design:type", Object)
], PublicBusinessProfileDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+919876543210', nullable: true }),
    __metadata("design:type", Object)
], PublicBusinessProfileDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'contact@apexbarber.com', nullable: true }),
    __metadata("design:type", Object)
], PublicBusinessProfileDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123 High Street, Indiranagar, Bengaluru', nullable: true }),
    __metadata("design:type", Object)
], PublicBusinessProfileDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Asia/Kolkata' }),
    __metadata("design:type", String)
], PublicBusinessProfileDto.prototype, "timezone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'INR' }),
    __metadata("design:type", String)
], PublicBusinessProfileDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://example.com/logo.png', nullable: true }),
    __metadata("design:type", Object)
], PublicBusinessProfileDto.prototype, "logoUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '#4F46E5' }),
    __metadata("design:type", String)
], PublicBusinessProfileDto.prototype, "primaryColor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '#6366F1' }),
    __metadata("design:type", String)
], PublicBusinessProfileDto.prototype, "secondaryColor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'book.apexbarber.com', nullable: true }),
    __metadata("design:type", Object)
], PublicBusinessProfileDto.prototype, "customDomain", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Crafting styles since 2018', nullable: true }),
    __metadata("design:type", Object)
], PublicBusinessProfileDto.prototype, "tagline", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://example.com/banner.jpg', nullable: true }),
    __metadata("design:type", Object)
], PublicBusinessProfileDto.prototype, "bannerUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: {
            slotIntervalMinutes: 30,
            advanceBookingDays: 30,
            minNoticeMinutes: 60,
            cancellationNoticeHours: 24,
        },
    }),
    __metadata("design:type", Object)
], PublicBusinessProfileDto.prototype, "bookingSettings", void 0);
class PublicBookingConfirmationDto {
}
exports.PublicBookingConfirmationDto = PublicBookingConfirmationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'a1a2a3a4-e5f6-7890-abcd-ef1234567890' }),
    __metadata("design:type", String)
], PublicBookingConfirmationDto.prototype, "appointmentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'CONFIRMED' }),
    __metadata("design:type", String)
], PublicBookingConfirmationDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-09-01T10:00:00.000Z' }),
    __metadata("design:type", Date)
], PublicBookingConfirmationDto.prototype, "startAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-09-01T10:45:00.000Z' }),
    __metadata("design:type", Date)
], PublicBookingConfirmationDto.prototype, "endAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Classic Haircut' }),
    __metadata("design:type", String)
], PublicBookingConfirmationDto.prototype, "serviceName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Alex Smith' }),
    __metadata("design:type", String)
], PublicBookingConfirmationDto.prototype, "staffName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 49900 }),
    __metadata("design:type", Number)
], PublicBookingConfirmationDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'INR' }),
    __metadata("design:type", String)
], PublicBookingConfirmationDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Apex Barber Studio' }),
    __metadata("design:type", String)
], PublicBookingConfirmationDto.prototype, "businessName", void 0);
//# sourceMappingURL=public-response.dto.js.map