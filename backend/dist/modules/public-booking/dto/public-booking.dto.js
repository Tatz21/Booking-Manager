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
exports.PublicAvailabilityQueryDto = exports.PublicBookingRequestDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class PublicBookingRequestDto {
}
exports.PublicBookingRequestDto = PublicBookingRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'srv-luxe-1', description: 'Service identifier or UUID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PublicBookingRequestDto.prototype, "serviceId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'stf-luxe-1', description: 'Staff identifier or UUID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PublicBookingRequestDto.prototype, "staffId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2026-09-01T10:00:00.000Z',
        description: 'Appointment start timestamp in UTC ISO format',
    }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PublicBookingRequestDto.prototype, "startAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Alex Johnson', description: 'Customer full name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Customer name is required' }),
    (0, class_validator_1.MaxLength)(100),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], PublicBookingRequestDto.prototype, "customerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'alex.johnson@example.com', description: 'Customer email' }),
    (0, class_validator_1.IsEmail)({}, { message: 'Valid email is required for booking confirmation' }),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value)),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PublicBookingRequestDto.prototype, "customerEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+919876543210', description: 'Customer phone number' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Phone number is required for booking confirmation' }),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], PublicBookingRequestDto.prototype, "customerPhone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Please prepare the beard trim first' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], PublicBookingRequestDto.prototype, "notes", void 0);
class PublicAvailabilityQueryDto {
}
exports.PublicAvailabilityQueryDto = PublicAvailabilityQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-09-01', description: 'Date formatted as YYYY-MM-DD' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be in YYYY-MM-DD format' }),
    __metadata("design:type", String)
], PublicAvailabilityQueryDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'srv-luxe-1', description: 'Service identifier or UUID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PublicAvailabilityQueryDto.prototype, "serviceId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'stf-luxe-1', description: 'Optional Staff identifier or UUID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PublicAvailabilityQueryDto.prototype, "staffId", void 0);
//# sourceMappingURL=public-booking.dto.js.map