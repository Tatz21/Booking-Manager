"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = require("helmet");
const compression = require("compression");
const express = require("express");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, helmet_1.default)());
    app.use(compression());
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ limit: '1mb', extended: true }));
    const corsOrigin = process.env.CORS_ORIGIN || '*';
    app.enableCors({
        origin: corsOrigin === '*' ? true : corsOrigin.split(','),
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
    });
    const apiPrefix = process.env.API_PREFIX || '/api/v1';
    app.setGlobalPrefix(apiPrefix.replace(/^\/+/, ''));
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalFilters(new http_exception_filter_1.AllExceptionsFilter());
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor(), new transform_interceptor_1.TransformInterceptor());
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('Appointment Booking SaaS API')
        .setDescription('Multi-tenant appointment booking SaaS backend API documentation. Provides endpoints for business owners, staff management, scheduling, public booking, 7-day trials, and Razorpay subscriptions.')
        .setVersion('1.0.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT Access Token',
        in: 'header',
    }, 'JWT-auth')
        .addTag('Health', 'Health and system diagnostics')
        .addTag('Auth', 'Authentication, registration, token rotation, and logout')
        .addTag('Business', 'Business profile and tenant settings')
        .addTag('Services', 'Service catalog and pricing')
        .addTag('Staff', 'Staff members and service assignments')
        .addTag('Availability', 'Business operating hours and staff working shifts')
        .addTag('Customers', 'Business customer records')
        .addTag('Appointments', 'Appointment scheduling and concurrency management')
        .addTag('Public Booking', 'Unauthenticated public booking endpoints for customers')
        .addTag('Payments & Subscriptions', 'Razorpay subscriptions, verification, and webhooks')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup(`${apiPrefix.replace(/^\/+/, '')}/docs`, app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });
    const port = process.env.PORT || 3000;
    const server = app.getHttpAdapter().getInstance();
    server.get(['/book', '/book/', '/book/:slug'], (req, res) => {
        const slug = req.params?.slug || 'luxe-lounge';
        res.redirect(`http://localhost:5050/book/${slug}`);
    });
    await app.listen(port);
    logger.log(`Application running on http://localhost:${port}/${apiPrefix.replace(/^\/+/, '')}`);
    logger.log(`Swagger Docs available at http://localhost:${port}/${apiPrefix.replace(/^\/+/, '')}/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map