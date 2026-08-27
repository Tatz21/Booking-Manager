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
exports.PublicBookingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const public_booking_service_1 = require("./public-booking.service");
const public_booking_dto_1 = require("./dto/public-booking.dto");
const public_response_dto_1 = require("./dto/public-response.dto");
let PublicBookingController = class PublicBookingController {
    constructor(publicBookingService) {
        this.publicBookingService = publicBookingService;
    }
    async getBusinessProfile(slug) {
        return this.publicBookingService.getBusinessProfile(slug);
    }
    async getServices(slug) {
        return this.publicBookingService.getServices(slug);
    }
    async getStaff(slug) {
        return this.publicBookingService.getStaff(slug);
    }
    async getAvailability(slug, query) {
        return this.publicBookingService.getAvailability(slug, query);
    }
    async bookAppointment(slug, dto) {
        return this.publicBookingService.bookAppointment(slug, dto);
    }
};
exports.PublicBookingController = PublicBookingController;
__decorate([
    (0, common_1.Get)(':slug'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get public business booking page by business slug',
        description: 'Returns publicly viewable details of the business (name, address, hours, currency, booking rules).',
    }),
    (0, swagger_1.ApiParam)({ name: 'slug', example: 'apex-barber-studio-7a8b', description: 'Unique business booking slug' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Business public profile',
        type: public_response_dto_1.PublicBusinessProfileDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Business not found',
    }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicBookingController.prototype, "getBusinessProfile", null);
__decorate([
    (0, common_1.Get)(':slug/services'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active services offered by the business' }),
    (0, swagger_1.ApiParam)({ name: 'slug', description: 'Business slug' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of bookable services with duration and price',
    }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicBookingController.prototype, "getServices", null);
__decorate([
    (0, common_1.Get)(':slug/staff'),
    (0, swagger_1.ApiOperation)({ summary: 'Get staff members and their qualified services' }),
    (0, swagger_1.ApiParam)({ name: 'slug', description: 'Business slug' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of active staff members',
    }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicBookingController.prototype, "getStaff", null);
__decorate([
    (0, common_1.Get)(':slug/availability'),
    (0, throttler_1.Throttle)({ default: { limit: 60, ttl: 60000 } }),
    (0, swagger_1.ApiOperation)({ summary: 'Get available time slots for a given service and date' }),
    (0, swagger_1.ApiParam)({ name: 'slug', description: 'Business slug' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Computed available time slots',
    }),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, public_booking_dto_1.PublicAvailabilityQueryDto]),
    __metadata("design:returntype", Promise)
], PublicBookingController.prototype, "getAvailability", null);
__decorate([
    (0, common_1.Post)(':slug/appointments'),
    (0, throttler_1.Throttle)({ default: { limit: 15, ttl: 60000 } }),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Public customer booking endpoint (No account creation needed)',
        description: 'Allows customer to reserve an appointment by providing contact info, chosen date/time slot, staff, and service.',
    }),
    (0, swagger_1.ApiParam)({ name: 'slug', description: 'Business slug' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Appointment booked successfully',
        type: public_response_dto_1.PublicBookingConfirmationDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Slot no longer available (race condition / double booking protection)',
    }),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, public_booking_dto_1.PublicBookingRequestDto]),
    __metadata("design:returntype", Promise)
], PublicBookingController.prototype, "bookAppointment", null);
exports.PublicBookingController = PublicBookingController = __decorate([
    (0, swagger_1.ApiTags)('Public Booking'),
    (0, common_1.Controller)('public'),
    __metadata("design:paramtypes", [public_booking_service_1.PublicBookingService])
], PublicBookingController);
//# sourceMappingURL=public-booking.controller.js.map