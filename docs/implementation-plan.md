# Backend Implementation Plan: Multi-Tenant Appointment-Booking SaaS

This document provides the exhaustive, phase-by-phase implementation plan for building the complete, production-ready NestJS backend for the multi-tenant appointment-booking SaaS.

---

## Phase Summary & Road Map

- **Phase 0 — Inspection & Architecture Planning** *(Completed)*
- **Phase 1 — Project Foundation**
- **Phase 2 — Database & Schema (Prisma / PostgreSQL)**
- **Phase 3 — Authentication & Token Rotation**
- **Phase 4 — Business Profile & Tenant Management**
- **Phase 5 — Services Management**
- **Phase 6 — Staff & Staff-Service Association**
- **Phase 7 — Availability & Working Hours Engine**
- **Phase 8 — Customer Management (Scoped to Business)**
- **Phase 9 — Appointment Engine & Concurrency Locking**
- **Phase 10 — Public Booking APIs & Rate Limiting**
- **Phase 11 — 7-Day Free Trial Engine & Server-Side Access Control**
- **Phase 12 — Razorpay Subscription & Idempotent Webhooks**
- **Phase 13 — Provider-Agnostic Notification Layer**
- **Phase 14 — Security Hardening & Boundary Audits**
- **Phase 15 — OpenAPI / Swagger Documentation**
- **Phase 16 — Comprehensive Testing Suite (Unit, Integration, Concurrency, Security)**
- **Phase 17 — Docker & Docker Compose Setup**
- **Phase 18 — CI/CD Pipeline (GitHub Actions)**
- **Phase 19 — Final End-to-End Verification & Production Build**

---

## Phase Details

### Phase 1 — Project Foundation
- **Objective**: Initialize clean NestJS project structure with strict TypeScript, ESLint, Prettier, typed environment validation (`@nestjs/config` + Joi/Zod/class-validator), global exception filters, logging interceptors, and a health check endpoint.
- **Files/Modules**:
  - `package.json`, `tsconfig.json`, `nest-cli.json`, `.eslintrc.js`, `.prettierrc`
  - `src/main.ts`, `src/app.module.ts`
  - `src/config/env.validation.ts`, `src/config/configuration.ts`
  - `src/common/filters/http-exception.filter.ts`
  - `src/common/interceptors/transform.interceptor.ts`, `logging.interceptor.ts`
  - `src/modules/health/health.module.ts`, `health.controller.ts`, `health.service.ts`
  - `.env.example`
- **APIs Introduced**:
  - `GET /api/v1/health`
- **Tests Required**:
  - Health endpoint test (200 OK + status payload)
  - Config validation test (fails to start when essential env vars are missing)
- **Acceptance Criteria**: App starts, health endpoint returns `{"status":"ok"}`, lint and typecheck pass cleanly.
- **Dependencies**: None.

---

### Phase 2 — Database & Schema Setup
- **Objective**: Configure Prisma ORM with PostgreSQL. Design normalized schema with UUID primary keys, foreign keys, unique constraints, and optimized indexes.
- **Models**:
  - `User` (id, email, passwordHash, name, role, createdAt, updatedAt)
  - `Business` (id, name, slug, type, description, phone, email, location, timezone, currency, logoUrl, createdAt, updatedAt)
  - `BusinessMembership` (id, userId, businessId, role, createdAt, updatedAt)
  - `Service` (id, businessId, name, description, durationMinutes, price, currency, isActive, isDeleted, createdAt, updatedAt)
  - `Staff` (id, businessId, name, email, phone, roleTitle, isActive, isDeleted, createdAt, updatedAt)
  - `StaffService` (id, staffId, serviceId, businessId, createdAt)
  - `BusinessHours` (id, businessId, dayOfWeek, openTime, closeTime, isClosed, breaksJson)
  - `StaffAvailability` (id, staffId, businessId, dayOfWeek, startTime, endTime, isOff, breaksJson)
  - `Customer` (id, businessId, name, email, phone, notes, createdAt, updatedAt)
  - `Appointment` (id, businessId, customerId, serviceId, staffId, startAt, endAt, status, price, currency, notes, cancelReason, createdAt, updatedAt)
  - `Subscription` (id, businessId, plan, status, trialStart, trialEnd, currentPeriodStart, currentPeriodEnd, razorpaySubscriptionId, razorpayCustomerId, createdAt, updatedAt)
  - `Payment` (id, businessId, subscriptionId, amount, currency, status, razorpayOrderId, razorpayPaymentId, razorpaySignature, createdAt)
  - `BookingSettings` (id, businessId, slotIntervalMinutes, advanceBookingDays, minNoticeMinutes, cancellationNoticeMinutes, createdAt, updatedAt)
  - `RefreshToken` (id, userId, tokenHash, expiresAt, isRevoked, replacedByTokenId, createdAt)
  - `AuditLog` (id, businessId, userId, action, entityType, entityId, payloadJson, ipAddress, userAgent, createdAt)
- **Files/Modules**:
  - `prisma/schema.prisma`
  - `src/database/prisma.service.ts`, `src/database/prisma.module.ts`
  - Seed file & migrations
- **Tests Required**:
  - Database connectivity test
  - Model CRUD and relation integrity integration test
- **Acceptance Criteria**: Schema validates, migrations execute smoothly, relations enforce referential integrity.

---

### Phase 3 — Authentication & Token Rotation
- **Objective**: Implement robust multi-tenant authentication with Argon2id password hashing, access JWTs, rotating refresh tokens with reuse detection, and transactional owner onboarding.
- **Files/Modules**:
  - `src/modules/auth/auth.module.ts`, `auth.controller.ts`, `auth.service.ts`
  - `src/modules/auth/guards/jwt-auth.guard.ts`, `roles.guard.ts`, `tenant.guard.ts`
  - `src/modules/auth/strategies/jwt.strategy.ts`
  - `src/modules/auth/dto/register.dto.ts`, `login.dto.ts`, `refresh.dto.ts`
  - `src/common/decorators/current-user.decorator.ts`, `roles.decorator.ts`
- **APIs Introduced**:
  - `POST /api/v1/auth/register` (creates User, Business, Owner Membership, 7-Day Trial Subscription, BookingSettings in 1 transaction)
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/refresh`
  - `POST /api/v1/auth/logout`
- **Tests Required**:
  - Register success & duplicate email rejection
  - Password strength validation
  - Login success & invalid credentials rejection
  - Refresh token rotation & reuse attack detection (revoking family)
  - Logout token revocation
- **Acceptance Criteria**: Full auth workflow with secure headers, Argon2id, and JWT issuance verified.

---

### Phase 4 — Business Profile & Tenant Management
- **Objective**: Enable business owners to manage their profile, timezone, currency, business slug, and contact details with strict tenant authorization.
- **Files/Modules**:
  - `src/modules/business/business.module.ts`, `business.controller.ts`, `business.service.ts`
  - `src/modules/business/dto/update-business.dto.ts`, `business-response.dto.ts`
- **APIs Introduced**:
  - `GET /api/v1/business`
  - `PATCH /api/v1/business`
- **Tests Required**:
  - Read own business
  - Update business fields (name, phone, timezone, etc.)
  - Cross-tenant isolation verification
  - Unauthenticated access rejection
- **Acceptance Criteria**: Business profile operations are strictly scoped to the authenticated tenant.

---

### Phase 5 — Services Management
- **Objective**: Service catalog CRUD for tenant. Enforce integer minor unit pricing (paise/cents), positive duration minutes, soft-deletion, and tenant isolation.
- **Files/Modules**:
  - `src/modules/services/services.module.ts`, `services.controller.ts`, `services.service.ts`
  - DTOs (`create-service.dto.ts`, `update-service.dto.ts`, etc.)
- **APIs Introduced**:
  - `GET /api/v1/services`
  - `POST /api/v1/services`
  - `GET /api/v1/services/:id`
  - `PATCH /api/v1/services/:id`
  - `DELETE /api/v1/services/:id`
- **Tests Required**:
  - Service CRUD operations
  - Price & duration validation
  - Soft deletion preservation for past appointments
  - Cross-tenant isolation
- **Acceptance Criteria**: All CRUD endpoints operational and strictly isolated by `businessId`.

---

### Phase 6 — Staff Management
- **Objective**: Staff management supporting solo operators and multi-staff teams, including staff-service assignment (`StaffService`).
- **Files/Modules**:
  - `src/modules/staff/staff.module.ts`, `staff.controller.ts`, `staff.service.ts`
  - DTOs (`create-staff.dto.ts`, `update-staff.dto.ts`, `assign-services.dto.ts`)
- **APIs Introduced**:
  - `GET /api/v1/staff`
  - `POST /api/v1/staff`
  - `GET /api/v1/staff/:id`
  - `PATCH /api/v1/staff/:id`
  - `DELETE /api/v1/staff/:id`
  - `POST /api/v1/staff/:id/services`
- **Tests Required**:
  - Staff CRUD and soft deletion
  - Staff-service mapping and unassigned service prevention
  - Cross-tenant isolation checks
- **Acceptance Criteria**: Staff creation and service assignment fully validated.

---

### Phase 7 — Availability Engine
- **Objective**: Manage weekly business operating hours, breaks, and staff-specific schedules. Convert between UTC and business timezone seamlessly.
- **Files/Modules**:
  - `src/modules/availability/availability.module.ts`, `availability.controller.ts`, `availability.service.ts`
  - DTOs (`set-business-hours.dto.ts`, `set-staff-availability.dto.ts`)
- **APIs Introduced**:
  - `GET /api/v1/availability/business-hours`
  - `PUT /api/v1/availability/business-hours`
  - `GET /api/v1/availability/staff/:staffId`
  - `PUT /api/v1/availability/staff/:staffId`
- **Tests Required**:
  - Setting and retrieving weekly business hours & breaks
  - Setting and retrieving staff-specific availability
  - Closed days and out-of-hours handling
  - Timezone boundary computations
- **Acceptance Criteria**: Working hours properly saved and queried with full timezone awareness.

---

### Phase 8 — Customer Management
- **Objective**: Lightweight customer records scoped to business created dynamically during booking or managed by business owners. No passwords or customer logins.
- **Files/Modules**:
  - `src/modules/customers/customers.module.ts`, `customers.controller.ts`, `customers.service.ts`
  - DTOs (`create-customer.dto.ts`, `update-customer.dto.ts`, `customer-query.dto.ts`)
- **APIs Introduced**:
  - `GET /api/v1/customers`
  - `GET /api/v1/customers/:id`
  - `PATCH /api/v1/customers/:id`
- **Tests Required**:
  - Customer listing with pagination and search
  - Customer detail retrieval
  - Cross-tenant isolation
- **Acceptance Criteria**: Customer data cleanly managed per business without authentication overhead.

---

### Phase 9 — Appointment Engine & Concurrency Locking
- **Objective**: Implement the core appointment scheduling engine. Ensure database-level concurrency protection to prevent double bookings.
- **Files/Modules**:
  - `src/modules/appointments/appointments.module.ts`, `appointments.controller.ts`, `appointments.service.ts`
  - `src/modules/appointments/appointment-scheduler.service.ts`
  - DTOs (`create-appointment.dto.ts`, `update-appointment-status.dto.ts`, `cancel-appointment.dto.ts`)
- **APIs Introduced**:
  - `GET /api/v1/appointments`
  - `GET /api/v1/appointments/:id`
  - `POST /api/v1/appointments`
  - `PATCH /api/v1/appointments/:id/status`
  - `POST /api/v1/appointments/:id/cancel`
- **Tests Required**:
  - Valid appointment creation, completion, and cancellation
  - Availability validation (within working hours, not on breaks)
  - Staff qualification validation (staff must provide the service)
  - Concurrency test: simultaneous requests for the same slot (one succeeds, one gets 409 Conflict)
- **Acceptance Criteria**: Atomic reservation guarantees zero double-booking under high concurrency.

---

### Phase 10 — Public Booking APIs
- **Objective**: Expose unauthenticated, safe, rate-limited public booking endpoints resolved by business `slug`.
- **Files/Modules**:
  - `src/modules/public-booking/public-booking.module.ts`, `public-booking.controller.ts`, `public-booking.service.ts`
  - DTOs (`public-booking-request.dto.ts`, `public-availability-query.dto.ts`)
- **APIs Introduced**:
  - `GET /api/v1/public/:slug`
  - `GET /api/v1/public/:slug/services`
  - `GET /api/v1/public/:slug/staff`
  - `GET /api/v1/public/:slug/availability`
  - `POST /api/v1/public/:slug/appointments`
- **Tests Required**:
  - Public business/service/staff retrieval by slug
  - Available slots generation based on working hours, breaks, and existing appointments
  - Public booking flow execution
  - Rate limiting and bad slug error handling
- **Acceptance Criteria**: Customers can view available slots and book appointments seamlessly without authentication.

---

### Phase 11 — 7-Day Free Trial Engine & Server-Side Access Control
- **Objective**: Enforce 7-day free trial on server-side time. Apply `TrialGuard` across all authenticated business mutation endpoints.
- **Files/Modules**:
  - `src/modules/trial/trial.module.ts`, `trial.service.ts`, `guards/subscription.guard.ts`
- **APIs Introduced**:
  - `GET /api/v1/business/subscription-status`
- **Tests Required**:
  - Fresh registration creates active 7-day trial
  - Active trial grants full access
  - Expired trial blocks business operations with `402 Payment Required`
  - Data remains intact after trial expiration
- **Acceptance Criteria**: Expiration is calculated strictly on the backend and guards enforce access.

---

### Phase 12 — Razorpay Subscription & Webhook Processing
- **Objective**: Integrate Razorpay ₹199/month recurring subscription creation, signature verification, and idempotent webhook handling.
- **Files/Modules**:
  - `src/modules/payments/payments.module.ts`, `payments.controller.ts`, `payments.service.ts`
  - `src/modules/payments/razorpay.service.ts`, `webhooks.controller.ts`
  - DTOs (`create-subscription.dto.ts`, `razorpay-webhook.dto.ts`)
- **APIs Introduced**:
  - `POST /api/v1/payments/create-subscription`
  - `POST /api/v1/payments/verify`
  - `POST /api/v1/webhooks/razorpay`
- **Tests Required**:
  - Subscription creation
  - Payment signature verification
  - Fake payment / forged signature rejection
  - Idempotent webhook handling (duplicate event ID detection)
  - Subscription activation on payment success
- **Acceptance Criteria**: Secure payment handling with verified signatures and idempotent webhooks.

---

### Phase 13 — Provider-Agnostic Notification Layer
- **Objective**: Asynchronous notification service with clean interface for email and future channels. Non-blocking delivery.
- **Files/Modules**:
  - `src/modules/notifications/notifications.module.ts`, `notifications.service.ts`
  - `src/modules/notifications/interfaces/notification-provider.interface.ts`
  - `src/modules/notifications/providers/console-email.provider.ts`
- **Tests Required**:
  - Notification dispatch on booking and cancellation
  - Notification failure resilience (booking transaction succeeds even if email provider throws)
- **Acceptance Criteria**: Notifications triggered cleanly without blocking primary business flows.

---

### Phase 14 — Security Hardening & Boundary Audits
- **Objective**: Harden backend with Helmet, CORS, Throttler, input sanitization, mass assignment protection, parameter pollution defense, and security audits.
- **Files/Modules**:
  - `src/main.ts`, `src/common/guards/security-headers.middleware.ts`, `rate-limit.config.ts`
- **Tests Required**:
  - Cross-tenant injection attempts
  - Malformed payload rejection
  - Rate limiting enforcement
  - Security headers verification
- **Acceptance Criteria**: High security score across OWASP Top 10 API vulnerabilities.

---

### Phase 15 — OpenAPI / Swagger Documentation
- **Objective**: Generate complete Swagger documentation on `/api/v1/docs` with DTO schemas, request/response models, and auth security schemes.
- **Files/Modules**:
  - `src/main.ts`, Swagger decorators across all controllers and DTOs
- **Acceptance Criteria**: `/api/v1/docs` renders complete, interactive API documentation.

---

### Phase 16 — Comprehensive Testing Suite
- **Objective**: Execute and consolidate unit, integration, concurrency, and security tests.
- **Files/Modules**:
  - `test/auth.e2e-spec.ts`
  - `test/business.e2e-spec.ts`
  - `test/services.e2e-spec.ts`
  - `test/staff.e2e-spec.ts`
  - `test/availability.e2e-spec.ts`
  - `test/appointments.e2e-spec.ts`
  - `test/concurrency.e2e-spec.ts`
  - `test/public-booking.e2e-spec.ts`
  - `test/trial-subscription.e2e-spec.ts`
  - `test/payments-webhook.e2e-spec.ts`
- **Acceptance Criteria**: 100% of test suites pass cleanly.

---

### Phase 17 — Docker & Containerization
- **Objective**: Multi-stage production-ready Dockerfile and docker-compose.yml for backend and PostgreSQL.
- **Files/Modules**:
  - `Dockerfile`, `.dockerignore`, `docker-compose.yml`
- **Acceptance Criteria**: Backend and PostgreSQL start and communicate seamlessly via `docker compose up`.

---

### Phase 18 — CI/CD Pipeline
- **Objective**: Configure GitHub Actions workflow running lint, typecheck, prisma validate, test suite, and production build.
- **Files/Modules**:
  - `.github/workflows/ci.yml`
- **Acceptance Criteria**: GitHub Actions pipeline defined and verified.

---

### Phase 19 — Final Verification & Deliverable Documentation
- **Objective**: Complete end-to-end flow verification, production build validation, and comprehensive README.md.
- **Files/Modules**:
  - `README.md`, `docs/implementation-progress.md`
- **Acceptance Criteria**: Production build succeeds, zero warnings, complete documentation.
