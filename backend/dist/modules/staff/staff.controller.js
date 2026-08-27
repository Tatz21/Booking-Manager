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
exports.StaffController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const staff_service_1 = require("./staff.service");
const create_staff_dto_1 = require("./dto/create-staff.dto");
const update_staff_dto_1 = require("./dto/update-staff.dto");
const assign_services_dto_1 = require("./dto/assign-services.dto");
const staff_response_dto_1 = require("./dto/staff-response.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const tenant_guard_1 = require("../auth/guards/tenant.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let StaffController = class StaffController {
    constructor(staffService) {
        this.staffService = staffService;
    }
    async findAll(businessId, includeInactive) {
        return this.staffService.findAll(businessId, includeInactive);
    }
    async create(businessId, dto) {
        return this.staffService.create(businessId, dto);
    }
    async findOne(businessId, id) {
        return this.staffService.findOne(businessId, id);
    }
    async update(businessId, id, dto) {
        return this.staffService.update(businessId, id, dto);
    }
    async remove(businessId, id) {
        return this.staffService.remove(businessId, id);
    }
    async assignServices(businessId, id, dto) {
        return this.staffService.assignServices(businessId, id, dto.serviceIds);
    }
};
exports.StaffController = StaffController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.BusinessRole.OWNER, client_1.BusinessRole.ADMIN, client_1.BusinessRole.STAFF),
    (0, swagger_1.ApiOperation)({ summary: 'List all staff members for the business' }),
    (0, swagger_1.ApiQuery)({ name: 'includeInactive', required: false, type: Boolean }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of staff members with assigned services',
        type: [staff_response_dto_1.StaffResponseDto],
    }),
    __param(0, (0, current_user_decorator_1.CurrentBusinessId)()),
    __param(1, (0, common_1.Query)('includeInactive', new common_1.DefaultValuePipe(false), common_1.ParseBoolPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], StaffController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.BusinessRole.OWNER, client_1.BusinessRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new staff member' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Staff member created successfully',
        type: staff_response_dto_1.StaffResponseDto,
    }),
    __param(0, (0, current_user_decorator_1.CurrentBusinessId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_staff_dto_1.CreateStaffDto]),
    __metadata("design:returntype", Promise)
], StaffController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(client_1.BusinessRole.OWNER, client_1.BusinessRole.ADMIN, client_1.BusinessRole.STAFF),
    (0, swagger_1.ApiOperation)({ summary: 'Get staff details, assigned services, and availability' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Staff UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Staff details',
        type: staff_response_dto_1.StaffResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Staff member not found',
    }),
    __param(0, (0, current_user_decorator_1.CurrentBusinessId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StaffController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.BusinessRole.OWNER, client_1.BusinessRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update staff member profile and services' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Staff UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Staff updated successfully',
        type: staff_response_dto_1.StaffResponseDto,
    }),
    __param(0, (0, current_user_decorator_1.CurrentBusinessId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_staff_dto_1.UpdateStaffDto]),
    __metadata("design:returntype", Promise)
], StaffController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.BusinessRole.OWNER, client_1.BusinessRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete a staff member' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Staff UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Staff member soft deleted',
    }),
    __param(0, (0, current_user_decorator_1.CurrentBusinessId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StaffController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/services'),
    (0, roles_decorator_1.Roles)(client_1.BusinessRole.OWNER, client_1.BusinessRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Assign qualified services to staff member' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Staff UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Services assigned successfully',
    }),
    __param(0, (0, current_user_decorator_1.CurrentBusinessId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, assign_services_dto_1.AssignServicesDto]),
    __metadata("design:returntype", Promise)
], StaffController.prototype, "assignServices", null);
exports.StaffController = StaffController = __decorate([
    (0, swagger_1.ApiTags)('Staff'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('staff'),
    __metadata("design:paramtypes", [staff_service_1.StaffService])
], StaffController);
//# sourceMappingURL=staff.controller.js.map