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
exports.AppointmentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const appointments_service_1 = require("./appointments.service");
const create_appointment_dto_1 = require("./dto/create-appointment.dto");
const query_appointments_dto_1 = require("./dto/query-appointments.dto");
const update_status_dto_1 = require("./dto/update-status.dto");
const cancel_appointment_dto_1 = require("./dto/cancel-appointment.dto");
const appointment_response_dto_1 = require("./dto/appointment-response.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const tenant_guard_1 = require("../auth/guards/tenant.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let AppointmentsController = class AppointmentsController {
    constructor(appointmentsService) {
        this.appointmentsService = appointmentsService;
    }
    async findAll(businessId, query) {
        return this.appointmentsService.findAll(businessId, query);
    }
    async create(businessId, userId, dto) {
        return this.appointmentsService.create(businessId, dto, userId);
    }
    async findOne(businessId, id) {
        return this.appointmentsService.findOne(businessId, id);
    }
    async updateStatus(businessId, userId, id, dto) {
        return this.appointmentsService.updateStatus(businessId, id, dto.status, userId);
    }
    async cancel(businessId, userId, id, dto) {
        return this.appointmentsService.cancel(businessId, id, dto, userId);
    }
};
exports.AppointmentsController = AppointmentsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.BusinessRole.OWNER, client_1.BusinessRole.ADMIN, client_1.BusinessRole.STAFF),
    (0, swagger_1.ApiOperation)({ summary: 'List appointments with date filters and pagination' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Paginated appointment list',
    }),
    __param(0, (0, current_user_decorator_1.CurrentBusinessId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, query_appointments_dto_1.QueryAppointmentsDto]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.BusinessRole.OWNER, client_1.BusinessRole.ADMIN, client_1.BusinessRole.STAFF),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new appointment with concurrency protection' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Appointment booked successfully',
        type: appointment_response_dto_1.AppointmentResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'This appointment time is no longer available.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentBusinessId)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_appointment_dto_1.CreateAppointmentDto]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(client_1.BusinessRole.OWNER, client_1.BusinessRole.ADMIN, client_1.BusinessRole.STAFF),
    (0, swagger_1.ApiOperation)({ summary: 'Get appointment details by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Appointment UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Appointment details',
        type: appointment_response_dto_1.AppointmentResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Appointment not found',
    }),
    __param(0, (0, current_user_decorator_1.CurrentBusinessId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)(client_1.BusinessRole.OWNER, client_1.BusinessRole.ADMIN, client_1.BusinessRole.STAFF),
    (0, swagger_1.ApiOperation)({ summary: 'Update appointment status (CONFIRMED, COMPLETED, CANCELLED)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Appointment UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Status updated',
        type: appointment_response_dto_1.AppointmentResponseDto,
    }),
    __param(0, (0, current_user_decorator_1.CurrentBusinessId)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, update_status_dto_1.UpdateAppointmentStatusDto]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, roles_decorator_1.Roles)(client_1.BusinessRole.OWNER, client_1.BusinessRole.ADMIN, client_1.BusinessRole.STAFF),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel an appointment with a reason' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Appointment UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Appointment cancelled',
        type: appointment_response_dto_1.AppointmentResponseDto,
    }),
    __param(0, (0, current_user_decorator_1.CurrentBusinessId)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, cancel_appointment_dto_1.CancelAppointmentDto]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "cancel", null);
exports.AppointmentsController = AppointmentsController = __decorate([
    (0, swagger_1.ApiTags)('Appointments'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('appointments'),
    __metadata("design:paramtypes", [appointments_service_1.AppointmentsService])
], AppointmentsController);
//# sourceMappingURL=appointments.controller.js.map