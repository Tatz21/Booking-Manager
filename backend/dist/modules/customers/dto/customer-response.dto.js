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
exports.CustomerResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class CustomerResponseDto {
}
exports.CustomerResponseDto = CustomerResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'c1c2c3c4-e5f6-7890-abcd-ef1234567890' }),
    __metadata("design:type", String)
], CustomerResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'b1b2c3d4-e5f6-7890-abcd-ef1234567890' }),
    __metadata("design:type", String)
], CustomerResponseDto.prototype, "businessId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Jane Smith' }),
    __metadata("design:type", String)
], CustomerResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'jane.smith@example.com' }),
    __metadata("design:type", String)
], CustomerResponseDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+919876543210' }),
    __metadata("design:type", String)
], CustomerResponseDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'VIP Customer', nullable: true }),
    __metadata("design:type", Object)
], CustomerResponseDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-08-25T18:00:00.000Z' }),
    __metadata("design:type", Date)
], CustomerResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-08-25T18:00:00.000Z' }),
    __metadata("design:type", Date)
], CustomerResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=customer-response.dto.js.map