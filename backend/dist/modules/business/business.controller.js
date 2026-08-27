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
exports.BusinessController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const business_service_1 = require("./business.service");
const update_business_dto_1 = require("./dto/update-business.dto");
const update_settings_dto_1 = require("./dto/update-settings.dto");
const business_response_dto_1 = require("./dto/business-response.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const tenant_guard_1 = require("../auth/guards/tenant.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let BusinessController = class BusinessController {
    constructor(businessService) {
        this.businessService = businessService;
    }
    async getBusiness(businessId) {
        return this.businessService.getBusinessProfile(businessId);
    }
    async updateBusiness(businessId, userId, dto) {
        return this.businessService.updateBusinessProfile(businessId, userId, dto);
    }
    async getSettings(businessId) {
        return this.businessService.getBookingSettings(businessId);
    }
    async updateSettings(businessId, userId, dto) {
        return this.businessService.updateBookingSettings(businessId, userId, dto);
    }
};
exports.BusinessController = BusinessController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.BusinessRole.OWNER, client_1.BusinessRole.ADMIN, client_1.BusinessRole.STAFF),
    (0, swagger_1.ApiOperation)({ summary: 'Get current tenant business profile and settings' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Business profile retrieved successfully',
        type: business_response_dto_1.BusinessProfileDto,
    }),
    __param(0, (0, current_user_decorator_1.CurrentBusinessId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "getBusiness", null);
__decorate([
    (0, common_1.Patch)(),
    (0, roles_decorator_1.Roles)(client_1.BusinessRole.OWNER, client_1.BusinessRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update business profile (Name, Location, Timezone, Phone, etc.)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Business updated successfully',
        type: business_response_dto_1.BusinessProfileDto,
    }),
    __param(0, (0, current_user_decorator_1.CurrentBusinessId)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_business_dto_1.UpdateBusinessDto]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "updateBusiness", null);
__decorate([
    (0, common_1.Get)('settings'),
    (0, roles_decorator_1.Roles)(client_1.BusinessRole.OWNER, client_1.BusinessRole.ADMIN, client_1.BusinessRole.STAFF),
    (0, swagger_1.ApiOperation)({ summary: 'Get booking rules & advance scheduling settings' }),
    __param(0, (0, current_user_decorator_1.CurrentBusinessId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Patch)('settings'),
    (0, roles_decorator_1.Roles)(client_1.BusinessRole.OWNER, client_1.BusinessRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update booking rules & notice intervals' }),
    __param(0, (0, current_user_decorator_1.CurrentBusinessId)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_settings_dto_1.UpdateBookingSettingsDto]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "updateSettings", null);
exports.BusinessController = BusinessController = __decorate([
    (0, swagger_1.ApiTags)('Business'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('business'),
    __metadata("design:paramtypes", [business_service_1.BusinessService])
], BusinessController);
//# sourceMappingURL=business.controller.js.map