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
exports.BusinessProfileDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class BusinessProfileDto {
}
exports.BusinessProfileDto = BusinessProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'b1b2c3d4-e5f6-7890-abcd-ef1234567890' }),
    __metadata("design:type", String)
], BusinessProfileDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Apex Barber Studio' }),
    __metadata("design:type", String)
], BusinessProfileDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'apex-barber-studio-7a8b' }),
    __metadata("design:type", String)
], BusinessProfileDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Barbershop', nullable: true }),
    __metadata("design:type", Object)
], BusinessProfileDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Premium haircut salon', nullable: true }),
    __metadata("design:type", Object)
], BusinessProfileDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+919876543210', nullable: true }),
    __metadata("design:type", Object)
], BusinessProfileDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'contact@apexbarber.com', nullable: true }),
    __metadata("design:type", Object)
], BusinessProfileDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123 High Street, Indiranagar, Bengaluru', nullable: true }),
    __metadata("design:type", Object)
], BusinessProfileDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Asia/Kolkata' }),
    __metadata("design:type", String)
], BusinessProfileDto.prototype, "timezone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'INR' }),
    __metadata("design:type", String)
], BusinessProfileDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://example.com/logo.png', nullable: true }),
    __metadata("design:type", Object)
], BusinessProfileDto.prototype, "logoUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-08-25T17:50:00.000Z' }),
    __metadata("design:type", Date)
], BusinessProfileDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-08-25T17:50:00.000Z' }),
    __metadata("design:type", Date)
], BusinessProfileDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=business-response.dto.js.map