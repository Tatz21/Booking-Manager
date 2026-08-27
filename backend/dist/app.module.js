"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const configuration_1 = require("./config/configuration");
const env_validation_1 = require("./config/env.validation");
const health_module_1 = require("./modules/health/health.module");
const prisma_module_1 = require("./database/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const business_module_1 = require("./modules/business/business.module");
const services_module_1 = require("./modules/services/services.module");
const staff_module_1 = require("./modules/staff/staff.module");
const availability_module_1 = require("./modules/availability/availability.module");
const customers_module_1 = require("./modules/customers/customers.module");
const appointments_module_1 = require("./modules/appointments/appointments.module");
const public_booking_module_1 = require("./modules/public-booking/public-booking.module");
const trial_module_1 = require("./modules/trial/trial.module");
const payments_module_1 = require("./modules/payments/payments.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const events_module_1 = require("./modules/events/events.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.default],
                validate: env_validation_1.validate,
                envFilePath: ['.env', '.env.local'],
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: parseInt(process.env.THROTTLE_TTL || '60', 10) * 1000,
                    limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
                },
            ]),
            schedule_1.ScheduleModule.forRoot(),
            health_module_1.HealthModule,
            prisma_module_1.PrismaModule,
            events_module_1.EventsModule,
            auth_module_1.AuthModule,
            business_module_1.BusinessModule,
            services_module_1.ServicesModule,
            staff_module_1.StaffModule,
            availability_module_1.AvailabilityModule,
            customers_module_1.CustomersModule,
            appointments_module_1.AppointmentsModule,
            public_booking_module_1.PublicBookingModule,
            trial_module_1.TrialModule,
            payments_module_1.PaymentsModule,
            notifications_module_1.NotificationsModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map