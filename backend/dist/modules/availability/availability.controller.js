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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const availability_service_1 = require("./availability.service");
const business_hours_dto_1 = require("./dto/business-hours.dto");
const staff_availability_dto_1 = require("./dto/staff-availability.dto");
const query_slots_dto_1 = require("./dto/query-slots.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const tenant_guard_1 = require("../auth/guards/tenant.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let AvailabilityController = class AvailabilityController {
    constructor(availabilityService) {
        this.availabilityService = availabilityService;
    }
    async getBusinessHours(businessId) {
        return this.availabilityService.getBusinessHours(businessId);
    }
    async setBusinessHours(businessId, dto) {
        return this.availabilityService.setBusinessHours(businessId, dto);
    }
    async getStaffAvailability(businessId, staffId) {
        return this.availabilityService.getStaffAvailability(businessId, staffId);
    }
    async setStaffAvailability(businessId, staffId, dto) {
        return this.availabilityService.setStaffAvailability(businessId, staffId, dto);
    }
    async getAvailableSlots(businessId, query) {
        return this.availabilityService.getAvailableSlots(businessId, query);
    }
};
exports.AvailabilityController = AvailabilityController;
__decorate([
    (0, common_1.Get)('business-hours'),
    (0, roles_decorator_1.Roles)(client_1.BusinessRole.OWNER, client_1.BusinessRole.ADMIN, client_1.BusinessRole.STAFF),
    (0, swagger_1.ApiOperation)({ summary: 'Get business weekly operating hours and breaks' }),
    __param(0, (0, current_user_decorator_1.CurrentBusinessId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AvailabilityController.prototype, "getBusinessHours", null);
__decorate([
    (0, common_1.Put)('business-hours'),
    (0, roles_decorator_1.Roles)(client_1.BusinessRole.OWNER, client_1.BusinessRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Set business weekly operating hours and breaks' }),
    __param(0, (0, current_user_decorator_1.CurrentBusinessId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, business_hours_dto_1.SetBusinessHoursDto]),
    __metadata("design:returntype", Promise)
], AvailabilityController.prototype, "setBusinessHours", null);
__decorate([
    (0, common_1.Get)('staff/:staffId'),
    (0, roles_decorator_1.Roles)(client_1.BusinessRole.OWNER, client_1.BusinessRole.ADMIN, client_1.BusinessRole.STAFF),
    (0, swagger_1.ApiOperation)({ summary: 'Get staff weekly working shifts and breaks' }),
    (0, swagger_1.ApiParam)({ name: 'staffId', description: 'Staff UUID' }),
    __param(0, (0, current_user_decorator_1.CurrentBusinessId)()),
    __param(1, (0, common_1.Param)('staffId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AvailabilityController.prototype, "getStaffAvailability", null);
__decorate([
    (0, common_1.Put)('staff/:staffId'),
    (0, roles_decorator_1.Roles)(client_1.BusinessRole.OWNER, client_1.BusinessRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Set staff weekly working shifts and breaks' }),
    (0, swagger_1.ApiParam)({ name: 'staffId', description: 'Staff UUID' }),
    __param(0, (0, current_user_decorator_1.CurrentBusinessId)()),
    __param(1, (0, common_1.Param)('staffId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, staff_availability_dto_1.SetStaffAvailabilityDto]),
    __metadata("design:returntype", Promise)
], AvailabilityController.prototype, "setStaffAvailability", null);
__decorate([
    (0, common_1.Get)('slots'),
    (0, roles_decorator_1.Roles)(client_1.BusinessRole.OWNER, client_1.BusinessRole.ADMIN, client_1.BusinessRole.STAFF),
    (0, swagger_1.ApiOperation)({ summary: 'Compute available appointment slots for a service and date' }),
    __param(0, (0, current_user_decorator_1.CurrentBusinessId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, query_slots_dto_1.QuerySlotsDto]),
    __metadata("design:returntype", Promise)
], AvailabilityController.prototype, "getAvailableSlots", null);
exports.AvailabilityController = AvailabilityController = __decorate([
    (0, swagger_1.ApiTags)('Availability'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('availability'),
    __metadata("design:paramtypes", [availability_service_1.AvailabilityService])
], AvailabilityController);
//# sourceMappingURL=availability.controller.js.map