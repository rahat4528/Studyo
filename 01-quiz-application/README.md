# 01-quiz-application: Quiz Application

## Overview
The Quiz Application is a dedicated educational assessment and evaluation system designed for timed formal examinations, question bank authoring, and formative practice quizzes. It maintains absolute server-side authority over assessment integrity, timers, and scoring, completely decoupled from full course management or student portal databases.

## Key Features
- **7 Question Types:** Multiple Choice, Multiple Select (with all-or-nothing and partial credit modes), True/False, Short Answer (with text normalization and numeric delta tolerance), Fill in the Blanks, Matching, and Essays (with rubric evaluation).
- **Assessment Integrity:**
  - Answer keys and accepted responses live exclusively on the backend; student API serializers strictly strip answer keys, accepted answers, and rubric criteria.
  - Server-side timer authority: `startedAt` and `deadline` are computed server-side. The client countdown timer is purely cosmetic; submissions past the deadline + grace period are automatically expired and finalized.
  - Atomic attempt verification preventing race conditions on `maxAttempts`.
  - Idempotent answer saving with incremental version tracking.
  - Double-submission rejection via state machine guards.
- **Scoring & Regrading:**
  - Multi-strategy scoring with configurable negative marking and zero score floor.
  - Answer key correction regrades with immutable `GradeRevision` audit logs.
- **Deterministic Randomization:**
  - Seed-based deterministic shuffling of questions and options, ensuring review reproducibility.
- **Verifiable Certificates:**
  - Issued strictly upon meeting formal pass criteria, with unique cryptographic verification codes and a public verification endpoint.
- **Psychometrics & Analytics:**
  - Score distribution histograms, item difficulty index ($P$), and item discrimination indicator ($D$).

## Architecture & Tech Stack
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Lucide React, Recharts.
- **Backend:** Node.js, Express, TypeScript, JWT with RBAC, Seeded Mulberry32 PRNG.
- **Database:** PostgreSQL (`studyo_quiz_db`), Prisma ORM schema, high-performance in-memory repository for instant isolated testing.
- **Infrastructure:** Docker Compose configuration for PostgreSQL, Redis, and Mailpit test email sink.

## Setup & Running Locally

### 1. Environment Configuration
```bash
cp .env.example .env
```

### 2. Launch Local Services (Docker)
```bash
docker-compose up -d
```

### 3. Install & Seed Backend
```bash
cd backend
npm install
npm run seed
npm run dev
```

### 4. Run Frontend
```bash
cd ../frontend
npm install
npm run dev
```

### 5. Running Tests
```bash
npm test
```

## REST API Overview
- `POST /api/v1/auth/register` & `/api/v1/auth/login` - User registration and authentication.
- `GET /api/v1/quizzes` & `POST /api/v1/quizzes` - Quiz catalog and instructor authoring.
- `GET /api/v1/quizzes/:id` - Sanitized student view or authorized instructor view.
- `POST /api/v1/quizzes/:id/attempts` - Start attempt with atomic attempt limit enforcement.
- `PUT /api/v1/attempts/:id/answers` - Idempotent answer autosave with versioning.
- `POST /api/v1/attempts/:id/submit` - Finalize attempt and execute scoring engine.
- `POST /api/v1/quizzes/:id/regrade` - Trigger regrade and record `GradeRevision` audit.
- `GET /api/v1/certificates/verify/:code` - Public verification of credential authenticity.
