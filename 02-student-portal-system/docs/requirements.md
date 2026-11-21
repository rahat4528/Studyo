# Student Portal System - Requirements Specification

## 1. System Purpose & Scope
The Student Portal System is an institutional student information management and academic registrar platform for schools, colleges, and higher education universities. It manages official academic structures, student admissions, course registrations, attendance logs, examination grading, transcript issuance, and student fee ledgers. It is an administrative registrar system, not a commercial course marketplace or quiz generator.

## 2. User Roles & Permission Matrix

| Operation | Student | Faculty | Department Administrator | Registrar / Central Admin | Guardian |
|---|---|---|---|---|---|
| View own student profile | Allowed | Denied | Allowed (dept) | Allowed (all) | Read-only (linked student) |
| Register for courses | Allowed (if no holds) | Denied | Denied | Allowed (override) | Denied |
| View class schedule | Allowed (enrolled) | Allowed (assigned) | Allowed | Allowed | Read-only (linked student) |
| Enter attendance | Denied | Allowed (assigned section) | Allowed | Allowed | Denied |
| Submit examination marks | Denied | Allowed (assigned section) | Denied | Denied | Denied |
| Approve / Publish marks | Denied | Denied | Allowed (dept) | Allowed (central) | Denied |
| Request official transcript | Allowed (cleared) | Denied | Denied | Allowed (issue) | Denied |
| View fee ledger & receipts | Allowed (own) | Denied | Denied | Allowed (manage) | Read-only (linked student) |
| Apply for leave | Allowed | Denied | Denied | Denied | Allowed (on behalf) |
| Approve leave application | Denied | Allowed (advisor/faculty)| Allowed | Allowed | Denied |

## 3. Core Academic Rules & State Machines

### 3.1 Course Registration & Enrollment Rules
- **Prerequisites Enforcement:** Enrolling in Course B requires a passing grade in prerequisite Course A.
- **Seat Capacity & Race Safety:** Sections have strict max capacities. Seat counting is race-safe with transactional locks.
- **Credit Limits:** Semester maximum credit ceiling (e.g. 18.0 credits per regular semester).
- **Schedule Conflict Detection:** Overlapping time slots in registered course sections are blocked with conflict details.
- **Registration Windows:** Enforced against the academic calendar semester start/end registration dates.
- **Administrative & Financial Holds:** Students with active holds (`FINANCIAL_HOLD`, `ACADEMIC_SUSPENSION`, `DISCIPLINARY`) are blocked from registration and document generation.
- **Enrollment States:** `REQUESTED` -> `ENROLLED` -> `DROPPED` / `WITHDRAWN` / `COMPLETED`.

### 3.2 Attendance & Leave Workflow
- Sessions record: `PRESENT`, `ABSENT`, `LATE`, `EXCUSED`.
- Edits allowed only within a configurable window (e.g. 72 hours) with an immutable audit log.
- Leave applications: `PENDING` -> `APPROVED` / `REJECTED`. Approved leave automatically marks corresponding sessions as `EXCUSED`.

### 3.3 Examination & Gradebook Pipeline
- Result lifecycle: `DRAFT` -> `SUBMITTED` -> `APPROVED` -> `PUBLISHED`.
- Students and guardians cannot view grades until official administrative publication.
- GPA and CGPA calculation: credit-weighted points scale ($GPA = \sum (credits \times points) / \sum credits$).
- Course repeats replace prior lower grades according to retake policies.
- Post-publication modifications require justification, authorized registrar credentials, and immutable audit logging.

### 3.4 Append-Only Financial Ledger
- Fee structures define tuition, lab, library, and activity fees per program and semester.
- All payments and adjustments are recorded in an append-only transaction ledger.
- Corrections are made strictly via explicit reversing ledger entries.
- Unpaid balances generate `FINANCIAL_HOLD` preventing registration or transcript generation.
