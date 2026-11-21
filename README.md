# Studyo: Educational Technology Suite

Studyo is a repository of five standalone, production-ready educational systems. Each application is architecturally decoupled, maintains its own persistent storage, manages its own authentication credentials, and operates independently.

## Applications Overview

1. **01-quiz-application (Quiz Application)**
   - High-integrity assessment system featuring timed examinations, random question pools, automated scoring across 7 question types, negative marking, practice modes, and teacher grading workflows.
2. **02-student-portal-system (Student Portal System)**
   - Academic administration platform for institutional operations, student records, course registration with conflict checking, attendance logs, transcript generation, and fee ledgers.
3. **03-online-course-platform (Online Course Platform)**
   - Creator-centric school system enabling independent educators to launch branded learning storefronts, deliver drip-scheduled curriculum, handle secure media streaming, and process enrollments.
4. **04-lms-platform-udemy-clone (LMS Platform (Udemy Clone))**
   - Multi-instructor course marketplace featuring catalog discovery, video learning with synchronized notes, Q&A discussions, assignments, reviews, and promotional campaign engines.
5. **05-code-learning-platform (Code Learning Platform)**
   - Developer learning environment with browser-based code editing, an isolated sandbox execution service supporting multiple programming languages, automated unit-test verification, and algorithm visualization.

## Core Technical Foundations

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Lucide Icons, Recharts, Monaco Editor.
- **Backend:** NestJS / Node.js modular micro-architectures with OpenAPI/Swagger specifications.
- **Data Persistence:** PostgreSQL with dedicated isolated databases, Prisma ORM, and Redis cache/job brokers.
- **Asynchronous Processing:** BullMQ for background job distribution, automated expiry, and sandbox execution queues.
- **Media & Storage:** Local S3-compatible MinIO object stores with expiring signed URL issuance.
- **Testing:** Jest unit and integration suites alongside Playwright end-to-end browser verification.

## Directory Structure

```text
Studyo/
├── README.md
├── LICENSE
├── PROGRESS.md
├── docs/
│   ├── repository-overview.md
│   ├── architecture.md
│   ├── technology-stack.md
│   ├── development-guide.md
│   ├── project-index.md
│   └── final-delivery-report.md
├── 01-quiz-application/
├── 02-student-portal-system/
├── 03-online-course-platform/
├── 04-lms-platform-udemy-clone/
└── 05-code-learning-platform/
```

## Running the Applications

Each application folder contains its own self-contained environment:
1. Navigate to the project directory: `cd 01-quiz-application` (or any other application).
2. Consult the local `README.md` and copy `.env.example` to `.env`.
3. Start dependencies: `docker-compose up -d`.
4. Install and run database migrations: `npm install && npx prisma migrate deploy && npm run seed`.
5. Start services: `npm run dev`.
6. Run tests: `npm test`.
