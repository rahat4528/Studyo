# LMS Platform (Udemy Clone) - Application 04

The **LMS Platform (Udemy Clone)** is a production-grade, multi-instructor educational marketplace platform designed for commercial course distribution, high-concurrency video delivery, and secure assessment. It provides independent authentication, instructor KYC verification workflows, decimal-accurate multi-course checkout with coupons and promotional campaigns, a 30-day money-back guarantee with automatic enrollment revocation, and tamper-proof certificates.

---

## 1. Key Architectural Capabilities

- **Instructor Onboarding & Moderation Pipeline:**
  - Instructors register profiles with `UNVERIFIED` state.
  - Verification documents (government ID, academic credentials) are reviewed by administrators before instructors can publish paid courses.
  - Multi-stage course publication state machine (`DRAFT` &rarr; `SUBMITTED` &rarr; `IN_REVIEW` &rarr; `APPROVED`/`REJECTED` &rarr; `PUBLISHED`/`UNPUBLISHED`).
  - Strict ownership guard: Only the course creator or administrators can edit or publish courses.

- **DRM Video & Content Access Control:**
  - Short-lived HMAC-SHA256 signed tokens protect all non-preview video streaming URLs.
  - Free preview lessons are publicly accessible without authentication.
  - Non-preview lessons are blocked unless a student possesses an active, non-refunded enrollment.

- **Multi-Course Cart & Decimal Pricing Engine:**
  - All financial transactions and calculations use integer minor units (cents) to eliminate JavaScript floating point rounding errors ($29.99 &rarr; 2999).
  - Multi-course cart supports site-wide promotional campaigns (`FLASH2026`) and course-specific percentage or fixed-amount discount coupons.
  - Expiration dates and usage limits (`maxUses`) are strictly enforced server-side.

- **30-Day Refund Workflow with Revocation:**
  - Students can request a refund within 30 days of purchase.
  - Administrator approval marks the purchase as `REFUNDED` and immediately flips enrollment `isRefunded = true`, blocking access to paid video streams and learning materials.

- **Assessment, Reviews & Verifiable Certificates:**
  - In-course quizzes with zero-leak student serializers (answer keys stripped before transit).
  - Assignment submissions and instructor grading with feedback.
  - Review gating: Only students with an active enrollment who have completed at least 20% of course lessons can post ratings and reviews.
  - Cryptographically verifiable certificates issued only upon 100% course lesson completion.

---

## 2. Directory Structure

```
04-lms-platform-udemy-clone/
├── backend/
│   ├── src/
│   │   ├── database/       # In-memory relational store & seed script
│   │   ├── services/       # Auth, Catalog, Content, Cart, Moderation, Assessment
│   │   ├── types/          # Strict TypeScript domain interfaces
│   │   └── server.ts       # Express REST API endpoints
│   ├── tests/              # Jest test suites (33 tests)
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   └── app/            # Next.js App Router (Marketplace, Player, Instructor Studio, Certs)
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
├── database/
│   └── schema.prisma       # Full PostgreSQL relational schema
├── docs/
│   ├── requirements.md
│   ├── architecture.md
│   ├── api.md
│   └── completion-report.md
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 3. Getting Started

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x

### Running the Backend
```bash
cd backend
npm install
npm test            # Runs all 6 test suites (33 unit & integration tests)
npm run seed        # Seeds sample categories, verified instructors, and courses
npm run dev         # Starts API server on port 4004
```

### Running the Frontend
```bash
cd frontend
npm install
npm run dev         # Starts Next.js app on http://localhost:3004
```

---

## 4. Verification & Testing

Run the automated test suite:
```bash
cd backend
npm test
```

### Test Coverage Highlights:
- `tests/catalog-search.test.ts`: Faceted search (categories, level, rating, max price, keyword matching).
- `tests/access-control.test.ts`: Free preview vs. paid DRM access, instructor bypass, refunded revocation.
- `tests/moderation-verification.test.ts`: KYC verification gating, approval lifecycle, course ownership guards.
- `tests/refund-workflow.test.ts`: 30-day refund window, admin approval, and instantaneous access revocation.
- `tests/assessment-grading.test.ts`: Quiz answer masking, auto-grading, assignment grading, review 20% gating, 100% certificate verification.
- `tests/cart-pricing.test.ts`: Multi-course integer minor units calculations, coupon stacking, expiration limits.
