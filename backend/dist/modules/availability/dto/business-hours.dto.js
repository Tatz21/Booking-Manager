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
exports.SetBusinessHoursDto = exports.DayHoursDto = exports.BreakTimeDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class BreakTimeDto {
}
exports.BreakTimeDto = BreakTimeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '13:00', description: 'Break start time (HH:MM in 24-hr format)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Break start time must be in HH:MM format' }),
    __metadata("design:type", String)
], BreakTimeDto.prototype, "start", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '14:00', description: 'Break end time (HH:MM in 24-hr format)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Break end time must be in HH:MM format' }),
    __metadata("design:type", String)
], BreakTimeDto.prototype, "end", void 0);
class DayHoursDto {
}
exports.DayHoursDto = DayHoursDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Day of week: 0=Sun, 1=Mon, ..., 6=Sat' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(6),
    __metadata("design:type", Number)
], DayHoursDto.prototype, "dayOfWeek", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '09:00', description: 'Opening time (HH:MM)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Open time must be in HH:MM format' }),
    __metadata("design:type", String)
], DayHoursDto.prototype, "openTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '18:00', description: 'Closing time (HH:MM)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Close time must be in HH:MM format' }),
    __metadata("design:type", String)
], DayHoursDto.prototype, "closeTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false, description: 'True if business is closed this day' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], DayHoursDto.prototype, "isClosed", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [BreakTimeDto], description: 'Optional list of break intervals' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => BreakTimeDto),
    __metadata("design:type", Array)
], DayHoursDto.prototype, "breaks", void 0);
class SetBusinessHoursDto {
}
exports.SetBusinessHoursDto = SetBusinessHoursDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [DayHoursDto], description: 'Array of 7 day configurations (0-6)' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => DayHoursDto),
    __metadata("design:type", Array)
], SetBusinessHoursDto.prototype, "hours", void 0);
//# sourceMappingURL=business-hours.dto.js.map