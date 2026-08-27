# Architecture Design Document

## Multi-Tenant Appointment-Booking SaaS Backend

### 1. High-Level Overview
This backend is a modular monolith built with **NestJS**, **TypeScript**, **PostgreSQL**, and **Prisma ORM**. It powers a multi-tenant appointment-booking platform where business owners (e.g., barbers, salons, clinics, consultants, photographers) manage their schedule, staff, and services, while their customers book appointments via public booking links without creating accounts.

```
+-------------------------------------------------------------------+
|                        Client Layer                               |
|   +--------------------------+    +---------------------------+   |
|   | Flutter App (Admin/Owner)|    | Web / Customer Public Link|   |
|   +--------------------------+    +---------------------------+   |
+-------------------------------------------------------------------+
                                  |
                                  | REST (/api/v1)
                                  v
+-------------------------------------------------------------------+
|                  NestJS Modular Monolith Architecture             |
|                                                                   |
|   [Global Guards / Middlewares: RateLimiter, Helmet, CORS, Tracing] |
|   [Auth / Tenant Context Interceptor]                             |
|                                                                   |
|   +--------------------+  +-------------------+  +------------+   |
|   |    AuthModule      |  |   BusinessModule  |  | StaffModule|   |
|   +--------------------+  +-------------------+  +------------+   |
|   |   ServicesModule   |  | AvailabilityModule|  |CustomerMod |   |
|   +--------------------+  +-------------------+  +------------+   |
|   | AppointmentsEngine |  |  PublicBookingMod |  | TrialModule|   |
|   +--------------------+  +-------------------+  +------------+   |
|   |   PaymentsModule   |  |  NotificationsMod |  | AuditModule|   |
|   |    (Razorpay)      |  |  (Email/Webhook)  |  |            |   |
|   +--------------------+  +-------------------+  +------------+   |
|                                                                   |
|                     Prisma ORM / Data Access                      |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                PostgreSQL (Multi-tenant with businessId)          |
|    - Serializable / Pessimistic Locking for Concurrency Safety     |
|    - Strict Foreign Keys, Unique & Exclusion Constraints          |
+-------------------------------------------------------------------+
```

---

### 2. Core Architectural Decisions

#### 2.1 Multi-Tenancy Strategy
- **Logical Tenant Isolation**: Every tenant entity (Services, Staff, Availability, Appointments, Customers, Settings, Subscriptions) is keyed by `businessId`.
- **Tenant Context Extraction**: Authenticated requests resolve `User` -> `BusinessMembership` -> `businessId`.
- **Tenant Isolation Enforcement**: Prisma repository and service layers enforce `businessId` filters on all queries and mutations. Unauthorized attempts across tenants trigger `403 Forbidden` / `404 Not Found`.

#### 2.2 Double-Booking & Concurrency Protection
- **PostgreSQL Transaction Locking**: Appointment booking transactions execute with atomic verification against existing overlapping appointments for the target staff member.
- **Serializable Isolation / Transaction Conflict Checks**: Utilizes database-level atomic locking/checks during slot reservation:
  ```sql
  -- Overlap condition inside atomic transaction:
  -- existing.startAt < new.endAt AND existing.endAt > new.startAt
  ```
- Any simultaneous race condition fails gracefully with `409 Conflict` ("This appointment time is no longer available.").

#### 2.3 Timezone & Money Handling
- **Time Representation**: All database timestamps (`startAt`, `endAt`, `createdAt`, `trialEnd`, etc.) are stored in **UTC (ISO-8601)**.
- **Timezone Conversion**: The `Business.timezone` (e.g., `Asia/Kolkata`, `America/New_York`) is loaded dynamically to compute daily business hours, staff shifts, and slot boundaries.
- **Money Representation**: Stored strictly in **integer minor units** (e.g., ₹199 = `19900` paise) or exact decimal representations. JavaScript floating-point arithmetic is strictly prohibited for monetary calculations.

#### 2.4 Subscription & 7-Day Free Trial Lifecycle
- Business registration initiates a `Subscription` record with `status: TRIALING`, `trialStart = now()`, `trialEnd = now() + 7 days`.
- No credit/debit card is required during trial.
- Access guards inspect `Subscription.trialEnd` and `Subscription.status` on all authenticated business management APIs (except payment endpoints).
- Razorpay handles the recurring ₹199/month subscription with server-side signature verification and idempotent webhook processing.

#### 2.5 Notification Layer
- Decoupled event-driven / interface-based abstraction (`NotificationService`).
- Appointment creation triggers notifications asynchronously; any failure in the notification pipeline does **not** roll back or fail the booking transaction.

---

### 3. Module Breakdown
1. **Core / Common**: Config, database (PrismaService), custom decorators, exceptions, logging, filters, interceptors.
2. **AuthModule**: Registration (with atomic business & trial creation), Login, Token rotation, Argon2id hashing, Guards (JwtAuthGuard, RolesGuard).
3. **BusinessModule**: Profile management, business slug validation, settings, timezone, currency.
4. **ServicesModule**: Service catalog, duration, pricing (in integer minor units), active state.
5. **StaffModule**: Staff profiles, staff-service associations (`StaffService`).
6. **AvailabilityModule**: Business operating hours, breaks, staff-specific working schedules, slot calculation engine.
7. **CustomersModule**: Lightweight customer records scoped to business, no credentials or logins.
8. **AppointmentsModule**: Booking engine, transaction isolation, double-booking prevention, status lifecycle (`PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`).
9. **PublicBookingModule**: Unauthenticated, rate-limited public APIs exposing minimal public booking data by slug.
10. **TrialModule & PaymentsModule**: Subscription state machine, Razorpay order/subscription creation, signature verification, webhook processing.
11. **NotificationsModule**: Asynchronous notifications with provider interface.
