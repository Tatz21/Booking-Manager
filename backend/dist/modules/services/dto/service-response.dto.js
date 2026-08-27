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
exports.ServiceResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class ServiceResponseDto {
}
exports.ServiceResponseDto = ServiceResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 's1s2s3s4-e5f6-7890-abcd-ef1234567890' }),
    __metadata("design:type", String)
], ServiceResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'b1b2c3d4-e5f6-7890-abcd-ef1234567890' }),
    __metadata("design:type", String)
], ServiceResponseDto.prototype, "businessId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Classic Haircut' }),
    __metadata("design:type", String)
], ServiceResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Precision cut and styling', nullable: true }),
    __metadata("design:type", Object)
], ServiceResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 45 }),
    __metadata("design:type", Number)
], ServiceResponseDto.prototype, "durationMinutes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 49900, description: 'Price in minor currency units (paise)' }),
    __metadata("design:type", Number)
], ServiceResponseDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'INR' }),
    __metadata("design:type", String)
], ServiceResponseDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], ServiceResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-08-25T18:00:00.000Z' }),
    __metadata("design:type", Date)
], ServiceResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-08-25T18:00:00.000Z' }),
    __metadata("design:type", Date)
], ServiceResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=service-response.dto.js.map