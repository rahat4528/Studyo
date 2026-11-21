# 02-student-portal-system: Student Portal System

## Overview
The Student Portal System is an enterprise academic administration and student information platform for higher education institutions, colleges, and universities. It serves as the authoritative registrar for student records, enrollment conflict validation, attendance logs, credit-weighted GPA/CGPA calculations, append-only financial ledgers, and officially sealed transcripts.

## Key Features
- **Strict Role-Based Scopes:**
  - Dedicated portals for Students, Faculty, Department Administrators, Registrars, and Guardians.
  - Contextual access controls: students access only their private records; faculty only their assigned sections; guardians only linked and administratively approved students.
- **Race-Safe Course Registration:**
  - Automated prerequisite traversal (e.g. CS101 passing grade required for CS102).
  - Atomic seat capacity locks preventing class overselling.
  - Schedule conflict detector identifying day/time overlaps across enrolled classes.
  - Semester credit limits (18.0 max) and administrative/financial hold gates.
- **Attendance & Excused Leave Sync:**
  - Faculty session logging with 72-hour modification window and audit trail.
  - Leave application review workflow; approving medical leave automatically converts overlapping sessions to `EXCUSED`.
- **Examination Pipeline & Gradebook:**
  - State machine: `DRAFT` -> `SUBMITTED` -> `APPROVED` -> `PUBLISHED`.
  - Publication gating: students and guardians cannot view unpublished grades.
  - Credit-weighted GPA/CGPA calculation ($GPA = \sum (\text{credits} \times \text{gradePoints}) / \sum \text{credits}$).
  - Course repeat/retake policy: higher grade on retake replaces prior lower grade in cumulative calculations.
  - Post-publication registrar revisions record an immutable `AuditLog` entry.
- **Append-Only Financial Ledger:**
  - Fee structures, partial payments, and reversing entries for corrections.
  - Unpaid balances generate `FINANCIAL_HOLD` blocking registration and transcript issuance.
- **Official Sealed Transcripts:**
  - Immutable snapshots carrying a unique verification code (`TRN-PORTAL-XXXXXXXX`) verifiable via a public verification page.

## Architecture & Tech Stack
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Lucide React.
- **Backend:** Node.js, Express, TypeScript, JWT with RBAC, Cryptographic hashing.
- **Database:** PostgreSQL (`studyo_student_portal_db`), Prisma ORM schema, high-performance in-memory repository for isolated instant testing.
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
- `POST /api/v1/auth/login` - User login.
- `GET /api/v1/departments`, `/programs`, `/courses`, `/sections` - Catalog hierarchy.
- `POST /api/v1/enrollments/register` - Course registration with conflict, seat, and hold validation.
- `POST /api/v1/faculty/sections/:id/attendance` - Faculty daily session attendance entry.
- `POST /api/v1/examinations/submit-marks` - Faculty mark submission.
- `POST /api/v1/examinations/publish-results` - Administrative result publication.
- `GET /api/v1/students/:id/grades` - View published grades and credit-weighted GPA/CGPA.
- `GET /api/v1/students/:id/fees` & `POST /api/v1/finance/payments` - Ledger operations.
- `POST /api/v1/transcripts/issue` - Official transcript generation gated by financial clearance.
- `GET /api/v1/transcripts/verify/:code` - Public verification of official transcript authenticity.
