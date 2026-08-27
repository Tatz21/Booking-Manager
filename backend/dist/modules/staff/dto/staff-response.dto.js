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
exports.StaffResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class StaffResponseDto {
}
exports.StaffResponseDto = StaffResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'st1st2st3-e5f6-7890-abcd-ef1234567890' }),
    __metadata("design:type", String)
], StaffResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'b1b2c3d4-e5f6-7890-abcd-ef1234567890' }),
    __metadata("design:type", String)
], StaffResponseDto.prototype, "businessId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Alex Smith' }),
    __metadata("design:type", String)
], StaffResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'alex.smith@example.com', nullable: true }),
    __metadata("design:type", Object)
], StaffResponseDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+919876543211', nullable: true }),
    __metadata("design:type", Object)
], StaffResponseDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Senior Stylist', nullable: true }),
    __metadata("design:type", Object)
], StaffResponseDto.prototype, "roleTitle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], StaffResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-08-25T18:00:00.000Z' }),
    __metadata("design:type", Date)
], StaffResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-08-25T18:00:00.000Z' }),
    __metadata("design:type", Date)
], StaffResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=staff-response.dto.js.map