# Multi-Tenant Appointment Booking SaaS

A production-ready, high-concurrency multi-tenant appointment-booking SaaS platform engineered with a standalone **NestJS Backend API** and a cross-platform **Flutter Frontend App** (Mobile & Web).

---

## 📁 Repository Structure

```
├── backend/                    # NestJS Backend API
│   ├── src/                    # Controllers, Services, Guards, DTOs, Modules
│   ├── prisma/                 # PostgreSQL Database Schema & Migrations
│   ├── test/                   # Unit, E2E, Security & Concurrency Test Suites
│   ├── Dockerfile              # Production Multi-Stage Containerfile
│   └── package.json            # Node.js Dependencies & Scripts
│
├── frontend/                   # Flutter Client Application (Mobile & Web)
│   ├── lib/                    # Riverpod Providers, Screens, Theme, Router
│   ├── test/                   # Flutter Unit & Widget Tests
│   └── pubspec.yaml            # Flutter Dependencies & Assets
│
├── .github/workflows/          # CI/CD Workflows (Backend & Frontend matrix CI)
├── docker-compose.yml          # Container cluster (NestJS Backend + PostgreSQL)
└── docs/                       # Architectural & phase completion documentation
```

---

## 🚀 Running the Project

### 1. Backend (NestJS + PostgreSQL)
```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Generate Prisma Client & Migrate DB
npx prisma generate
npx prisma db push

# Run development server
npm run dev

# Run full test suite
npm run test
npm run test:e2e
```
- **Backend API**: `http://localhost:3000/api/v1`
- **Interactive Swagger Docs**: `http://localhost:3000/api/v1/docs`

---

### 2. Frontend (Flutter App)
```bash
cd frontend

# Install Flutter dependencies
flutter pub get

# Run on Chrome (Web)
flutter run -d chrome

# Run on iOS / Android / macOS Desktop
flutter run

# Run Flutter tests
flutter test

# Build for Web Production
flutter build web
```

---

### 3. Docker Compose (Full Stack)
```bash
docker-compose up --build -d
```
