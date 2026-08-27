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
exports.SetStaffAvailabilityDto = exports.StaffDayShiftDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const business_hours_dto_1 = require("./business-hours.dto");
class StaffDayShiftDto {
}
exports.StaffDayShiftDto = StaffDayShiftDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Day of week: 0=Sun, 1=Mon, ..., 6=Sat' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(6),
    __metadata("design:type", Number)
], StaffDayShiftDto.prototype, "dayOfWeek", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '09:00', description: 'Shift start time (HH:MM)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Start time must be in HH:MM format' }),
    __metadata("design:type", String)
], StaffDayShiftDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '18:00', description: 'Shift end time (HH:MM)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'End time must be in HH:MM format' }),
    __metadata("design:type", String)
], StaffDayShiftDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false, description: 'True if staff is off duty this day' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], StaffDayShiftDto.prototype, "isOff", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [business_hours_dto_1.BreakTimeDto], description: 'Optional list of staff break intervals' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => business_hours_dto_1.BreakTimeDto),
    __metadata("design:type", Array)
], StaffDayShiftDto.prototype, "breaks", void 0);
class SetStaffAvailabilityDto {
}
exports.SetStaffAvailabilityDto = SetStaffAvailabilityDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [StaffDayShiftDto], description: 'Array of shift configurations for staff member' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => StaffDayShiftDto),
    __metadata("design:type", Array)
], SetStaffAvailabilityDto.prototype, "shifts", void 0);
//# sourceMappingURL=staff-availability.dto.js.map