import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import * as express from 'express';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Security Headers, Compression & Body Size Limits
  app.use(helmet());
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ limit: '1mb', extended: true }));

  // CORS
  const corsOrigin = process.env.CORS_ORIGIN || '*';
  app.enableCors({
    origin: corsOrigin === '*' ? true : corsOrigin.split(','),
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
  });

  // Global Prefix: /api/v1
  const apiPrefix = process.env.API_PREFIX || '/api/v1';
  app.setGlobalPrefix(apiPrefix.replace(/^\/+/, ''));

  // Global Pipes: Validation with strict sanitization
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global Filters & Interceptors
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

  // Swagger Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Appointment Booking SaaS API')
    .setDescription(
      'Multi-tenant appointment booking SaaS backend API documentation. Provides endpoints for business owners, staff management, scheduling, public booking, 7-day trials, and Razorpay subscriptions.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT Access Token',
        in: 'header',
      },
      'JWT-auth',
    )
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

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix.replace(/^\/+/, '')}/docs`, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3000;
  const server = app.getHttpAdapter().getInstance();
  server.get(['/book', '/book/', '/book/:slug'], (req: express.Request, res: express.Response) => {
    const slug = req.params?.slug || 'luxe-lounge';
    res.redirect(`http://localhost:5050/book/${slug}`);
  });

  await app.listen(port);
  logger.log(`Application running on http://localhost:${port}/${apiPrefix.replace(/^\/+/, '')}`);
  logger.log(`Swagger Docs available at http://localhost:${port}/${apiPrefix.replace(/^\/+/, '')}/docs`);
}

bootstrap();
