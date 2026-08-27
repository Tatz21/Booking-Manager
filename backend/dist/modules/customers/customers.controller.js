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
exports.CustomersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const customers_service_1 = require("./customers.service");
const query_customers_dto_1 = require("./dto/query-customers.dto");
const update_customer_dto_1 = require("./dto/update-customer.dto");
const customer_response_dto_1 = require("./dto/customer-response.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const tenant_guard_1 = require("../auth/guards/tenant.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let CustomersController = class CustomersController {
    constructor(customersService) {
        this.customersService = customersService;
    }
    async findAll(businessId, query) {
        return this.customersService.findAll(businessId, query);
    }
    async findOne(businessId, id) {
        return this.customersService.findOne(businessId, id);
    }
    async update(businessId, id, dto) {
        return this.customersService.update(businessId, id, dto);
    }
};
exports.CustomersController = CustomersController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.BusinessRole.OWNER, client_1.BusinessRole.ADMIN, client_1.BusinessRole.STAFF),
    (0, swagger_1.ApiOperation)({ summary: 'List customers for the business with pagination and search' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Paginated customer list',
    }),
    __param(0, (0, current_user_decorator_1.CurrentBusinessId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, query_customers_dto_1.QueryCustomersDto]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(client_1.BusinessRole.OWNER, client_1.BusinessRole.ADMIN, client_1.BusinessRole.STAFF),
    (0, swagger_1.ApiOperation)({ summary: 'Get customer profile and full appointment history' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Customer UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Customer profile with booking history',
        type: customer_response_dto_1.CustomerResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Customer not found',
    }),
    __param(0, (0, current_user_decorator_1.CurrentBusinessId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.BusinessRole.OWNER, client_1.BusinessRole.ADMIN, client_1.BusinessRole.STAFF),
    (0, swagger_1.ApiOperation)({ summary: 'Update customer details or notes' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Customer UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Customer updated successfully',
        type: customer_response_dto_1.CustomerResponseDto,
    }),
    __param(0, (0, current_user_decorator_1.CurrentBusinessId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_customer_dto_1.UpdateCustomerDto]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "update", null);
exports.CustomersController = CustomersController = __decorate([
    (0, swagger_1.ApiTags)('Customers'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('customers'),
    __metadata("design:paramtypes", [customers_service_1.CustomersService])
], CustomersController);
//# sourceMappingURL=customers.controller.js.map