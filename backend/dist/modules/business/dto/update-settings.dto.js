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
exports.UpdateBookingSettingsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UpdateBookingSettingsDto {
}
exports.UpdateBookingSettingsDto = UpdateBookingSettingsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 30, description: 'Slot duration interval in minutes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(5),
    (0, class_validator_1.Max)(240),
    __metadata("design:type", Number)
], UpdateBookingSettingsDto.prototype, "slotIntervalMinutes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 30, description: 'How many days in advance customers can book' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(365),
    __metadata("design:type", Number)
], UpdateBookingSettingsDto.prototype, "advanceBookingDays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 60, description: 'Minimum lead time in minutes required before appointment' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1440),
    __metadata("design:type", Number)
], UpdateBookingSettingsDto.prototype, "minNoticeMinutes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 24, description: 'Minimum notice in hours required for customer cancellation' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(168),
    __metadata("design:type", Number)
], UpdateBookingSettingsDto.prototype, "cancellationNoticeHours", void 0);
//# sourceMappingURL=update-settings.dto.js.map