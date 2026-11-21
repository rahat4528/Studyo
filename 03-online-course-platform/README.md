# 03-online-course-platform: Online Course Platform

## Overview
The Online Course Platform is a creator-owned multi-tenant learning infrastructure allowing independent instructors to launch sovereign branded academies, publish free and paid modular courses, enforce server-side drip curriculum release, deliver private media via signed expiring tokens, and accept decimal-precise payments with webhook signature verification.

## Key Features
- **Creator Storefronts & Multi-Tenancy:**
  - Multi-tenant school resolution via slug-based subroutes (`/s/:schoolSlug`).
  - School branding themes: customizable primary colors, logo, and XSS-sanitized landing page blocks.
  - Independent school membership: users hold separate roles (`OWNER`, `ADMIN`, `INSTRUCTOR`, `ASSISTANT`, `STUDENT`) across different academies.
- **Server-Enforced Drip Curriculum:**
  - Drip release rules: Immediate, $N$ days post-enrollment, or specific calendar release dates.
  - Server authority: attempting to directly fetch locked lessons or media tokens is blocked with `403 Forbidden`.
  - Preview lessons: flagged lessons remain accessible to prospective students for discovery.
- **Secured Media Streaming:**
  - Private S3-compatible media keys are converted dynamically to time-expiring HMAC SHA-256 signed URLs (15-minute validity window) for enrolled students.
- **Decimal Pricing, Coupons & Webhooks:**
  - Currency minor units (integer cents) eliminate floating point rounding errors.
  - Promotional coupon engine: percentage or fixed minor discounts, expiry dates, and race-safe redemption limits.
  - Webhook processing with HMAC signature verification and transactional duplicate suppression (idempotency).
  - Explicit refund workflow revoking student enrollment.
- **100% Verified Completion Certificates:**
  - Issued strictly upon server verification that 100% of course lessons are completed.
  - Unique cryptographic verification codes with public verification page.

## Architecture & Tech Stack
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Lucide React.
- **Backend:** Node.js, Express, TypeScript, JWT with RBAC, HMAC SHA-256 cryptography.
- **Database:** PostgreSQL (`studyo_online_course_db`), Prisma ORM schema, high-performance in-memory repository for isolated instant testing.
- **Infrastructure:** Docker Compose configuration for PostgreSQL, Redis, MinIO (S3 object storage), and Mailpit test email sink.

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
- `POST /api/v1/schools` - Register new academy.
- `GET /api/v1/schools/:slug` - Public academy details & theme.
- `GET /api/v1/schools/:slug/courses` & `POST /api/v1/schools/:slug/courses` - Course catalog and authoring.
- `GET /api/v1/schools/:slug/lessons/:id` - Fetch lesson content and signed video token.
- `POST /api/v1/schools/:slug/checkout` - Price calculation with coupon discount.
- `POST /api/v1/webhooks/payment` - Webhook receiver with signature verification and idempotent fulfillment.
- `PUT /api/v1/schools/:slug/lessons/:id/progress` - Save lesson progress & position.
- `POST /api/v1/schools/:slug/courses/:id/certificate` - Claim 100% completion certificate.
- `GET /api/v1/certificates/verify/:code` - Public verification of credential authenticity.
