# Student Portal System - Architecture Specification

## 1. System Architecture

```
+-------------------------------------------------------------+
|               Next.js Multi-Role Web Portal                 |
|  - Student Workspace (Dashboard, Schedule, Grades, Fees)    |
|  - Faculty Workspace (Class Sections, Attendance, Grading)  |
|  - Administrator Desk (Admissions, Curriculum, Audit Logs)  |
|  - Guardian View (Read-Only Attendance, Results, Balances)  |
+-------------------------------------------------------------+
                              │ REST JSON API / Bearer JWT
                              ▼
+-------------------------------------------------------------+
|              Registrar Application Tier (Modular API)       |
|  ├── RBAC & Contextual Ownership Authorization Engine       |
|  ├── Enrollment & Conflict Detection Engine                 |
|  │   ├── Atomic Seat Allocation                             |
|  │   ├── Prerequisite Graph Traversal                       |
|  │   └── Hold Verification Filter                           |
|  ├── Gradebook, GPA/CGPA & Repeat Calculation Engine        |
|  ├── Attendance & Excused Leave Synchronizer                |
|  ├── Append-Only Financial Ledger Service                   |
|  └── Immutable Transcript Snapshot & Verification Service   |
+-------------------------------------------------------------+
                              │
               ┌──────────────┴──────────────┐
               ▼                             ▼
+-----------------------------+ +---------------------------+
| PostgreSQL (Prisma ORM)     | | Redis (Cache & Session)   |
| - studyo_student_portal_db  | | - Registration Locks      |
+-----------------------------+ +---------------------------+
```

## 2. Architectural Security & Data Protection

### 2.1 Contextual Ownership Authorization
- The permission engine enforces that students access only their private records (`userId = student.userId`).
- Guardians are authorized only after an administrator reviews and approves a verified `GuardianLink`. Guardians hold read-only scopes.
- Faculty are restricted strictly to sections they teach (`facultyId = section.instructorId`).

### 2.2 Concurrency Control on Course Seats
- To prevent overselling limited course section capacity during registration rushes, enrollments utilize transactional checks with atomic counter locks.

### 2.3 Transcript Immutability & Public Verification
- Official transcripts are sealed at issuance: an immutable snapshot of credit totals, course grades, GPA, and graduation status is signed and assigned an unforgeable verification code (`TRN-PORTAL-XXXXXXXX`).
- The public verification endpoint reveals minimal metadata (student name, degree program, conferral date, and authenticity status) without exposing grades or sensitive personal data.
