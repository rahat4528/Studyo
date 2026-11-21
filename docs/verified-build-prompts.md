# Studyo Educational Technology Suite - Verified Build Prompts

This document contains the verified, complete, logically consistent, and build-ready implementation prompts for the **Studyo** monorepo and each of its 5 standalone educational applications.

---

## Prompt 0: Monorepo Foundation & Global Governance

```markdown
You are a senior full-stack engineer and software architect. Build the foundation and governance structure for the GitHub monorepo "Studyo" (category: Education and educational technology).

## 1. Monorepo Principles & Non-Negotiable Invariants
- Repository name: Studyo
- Architecture: Exactly 5 independent, decoupled, standalone educational applications in numbered folders:
  - 01-quiz-application
  - 02-student-portal-system
  - 03-online-course-platform
  - 04-lms-platform-udemy-clone
  - 05-code-learning-platform
- Independence Rule: No shared backend, no shared database, and no cross-app dependencies. Each application must be capable of running, building, testing, and deploying independently with its own database, authentication, backend API, frontend, and tests.
- Reference Policy: Strictly zero brand or attribution mentions (e.g., "inspired by", "clone of", or links to third-party LMS/quiz platforms). The ONLY exception is the exact folder and display title "LMS Platform (Udemy Clone)" / "04-lms-platform-udemy-clone".
- Secrets & Data: Zero real credentials or .env files in Git. All seed and test data must use synthetic names and identifiers.

## 2. Deliverables
1. Root Documentation:
   - README.md: Monorepo overview, directory tree, per-app quickstart, testing instructions.
   - PROGRESS.md: Phase execution checklist and test status matrix.
   - LICENSE: Custom educational software license.
   - .gitignore: Universal ignore for node_modules, build outputs, environment files, and IDE configs.
   - docs/repository-overview.md, docs/architecture.md, docs/technology-stack.md, docs/development-guide.md, docs/project-index.md, docs/final-delivery-report.md.
2. Verification:
   - Confirm that all 5 application directories exist with proper scaffolding and that the reference scan returns zero forbidden terms.
```

---

## Prompt 1: Quiz Application (`01-quiz-application`)

```markdown
Build application "01-quiz-application" (Display Name: "Quiz Application"), an independent high-integrity timed assessment system.

## 1. Core Requirements & Architecture
- Database: studyo_quiz_db (PostgreSQL + Prisma).
- Scoring Engine: Support exactly 7 distinct question types:
  1. MULTIPLE_CHOICE: Single correct option out of N.
  2. MULTI_SELECT: Multiple correct options with all-or-nothing or configurable partial credit.
  3. TRUE_FALSE: Binary evaluation.
  4. SHORT_ANSWER: Case-insensitive normalized whitespace string matching.
  5. NUMERIC: Numeric answer within a specified delta tolerance (e.g., target ± tolerance).
  6. FILL_IN_BLANKS: Multiple ordered text tokens.
  7. ESSAY: Open-ended response evaluated against a rubric (manual grading workflow).
- Security & Integrity:
  - Server-Authoritative Timer: The server records `startedAt` and enforces `timeLimitMinutes`. Any submission arriving after deadline + 10s grace window is automatically marked EXPIRED with zero score for unsubmitted questions.
  - Zero-Leak Answer Masking: Public attempt delivery APIs must strip `isCorrect` fields and answer keys to prevent client-side inspection.
  - Idempotent Versioned Autosaves: Periodic question responses saved with monotonically increasing version numbers to prevent overwrites or network loss.
  - Regrading & Audit Trail: Any teacher score revision or regrading creates an immutable GradeRevision audit log recording previous score, new score, reason, and teacher ID.
  - Verifiable Certificates: Issued upon passing the quiz threshold, with unique cryptographic verification codes and public verification endpoints.

## 2. Directory Structure & Stack
- backend/: Node.js, Express/NestJS, TypeScript, Jest.
- frontend/: Next.js 14 (App Router), Tailwind CSS, distraction-free examination player, teacher quiz builder & gradebook.
- database/: schema.prisma, seed.ts, docker-compose.yml (PostgreSQL on port 5432, Redis on 6379).
- docs/: requirements.md, architecture.md, api.md, completion-report.md.

## 3. Automated Test Requirements
Implement Jest test suites verifying:
1. 7-question-type scoring logic (partial credit, numeric tolerance, normalization).
2. Server-side timer deadline expiry.
3. Zero answer-key leakage in student attempt payloads.
4. Idempotent autosave persistence.
5. Grade revision audit log creation on manual score adjustments.
```

---

## Prompt 2: Student Portal System (`02-student-portal-system`)

```markdown
Build application "02-student-portal-system" (Display Name: "Student Portal System"), a standalone academic administration and student record platform.

## 1. Core Requirements & Architecture
- Database: studyo_student_portal_db (PostgreSQL + Prisma).
- Course Registration Engine:
  - Prerequisite DAG Graph: Enforce prerequisite course completion before permitting enrollment.
  - Race-Safe Capacity: Atomic seat locking to prevent class over-enrollment.
  - Schedule Conflict Detection: Timeslot overlap validation across days and hours.
  - Academic & Financial Holds: Block registration if an active administrative or billing hold exists.
  - Credit Limits: Hard cap on maximum credits allowed per semester (e.g., 18 credits).
- Attendance & Academic Progress:
  - 72-Hour Faculty Window: Attendance for class sessions can only be edited within 72 hours of session time.
  - Approved Leave Integration: Approved student leaves automatically mark matching sessions as EXCUSED.
  - Exam Clearance: Hall ticket/exam clearance is blocked if attendance falls below threshold (e.g., 75%).
  - GPA/CGPA Recalculation: Credit-weighted semester GPA and cumulative CGPA. Repeating a failed course replaces the prior grade in cumulative CGPA calculations while preserving the historical record.
- Financial Ledger & Transcripts:
  - Double-Entry Append-Only Ledger: Fee charges, payments, and reversals recorded with integer minor units (cents). Balances cannot be updated in-place.
  - Sealed Transcripts: Immutable graduation records with unique verification codes and public verification page.
  - Guardian Access: Explicit parental/guardian link verification before granting student record access.

## 2. Directory Structure & Stack
- backend/: Node.js, Express/NestJS, TypeScript, Jest.
- frontend/: Next.js 14 (App Router), Tailwind CSS, student dashboard, faculty gradebook, admin console, guardian view.
- database/: schema.prisma, seed.ts, docker-compose.yml (PostgreSQL on port 5433, Redis on 6380).
- docs/: requirements.md, architecture.md, api.md, completion-report.md.

## 3. Automated Test Requirements
Implement Jest test suites verifying:
1. Registration rules: prerequisite enforcement, seat capacity race safety, schedule conflicts, and hold blocking.
2. Attendance logging window (72h limit) and leave excuse auto-sync.
3. Credit-weighted GPA calculation and retake grade replacement rules.
4. Append-only ledger accounting and reversal tracking.
5. Transcript verification and guardian access security.
```

---

## Prompt 3: Online Course Platform (`03-online-course-platform`)

```markdown
Build application "03-online-course-platform" (Display Name: "Online Course Platform"), a creator-owned academy and course delivery system.

## 1. Core Requirements & Architecture
- Database: studyo_online_course_db (PostgreSQL + Prisma).
- Multi-Tenant Academy Routing:
  - Dynamic subdomain/slug routing (`/s/:schoolSlug`) with strict tenant data isolation. Queries must never leak cross-school records.
  - School customization: School title, branding color accents, and creator bio.
- Drip Content & Media Delivery:
  - 3 Drip Modes: IMMEDIATE (available at enrollment), DAYS_AFTER_ENROLLMENT (e.g., 7 days post-join), and SPECIFIC_DATE (calendar locked).
  - Server DRM: Premium video URLs delivered via short-lived HMAC-SHA256 signed tokens (15-minute validity). Unenrolled users or users whose drip schedule has not unlocked cannot access video streams.
- Commercial Engine & Subscriptions:
  - Minor-Unit Integer Pricing: All currencies and prices stored in integer cents ($49.00 -> 4900).
  - Coupon Engine: Fixed discount and percentage discount coupons with expiration and `maxUses` limits.
  - Webhook-Verified Payments: HMAC webhook signature validation with idempotency keys preventing replay attacks.
  - 30-Day Money-Back Guarantee: Student-initiated refund requests approved by admin immediately revoke course enrollment and media access.
  - Subscriptions: Status lifecycle (ACTIVE, PAST_DUE, CANCELED) governing access gates.
  - Verifiable Certificates: Issued upon 100% course lesson completion.

## 2. Directory Structure & Stack
- backend/: Node.js, Express/NestJS, TypeScript, Jest.
- frontend/: Next.js 14 (App Router), Tailwind CSS, school storefront, student learning dashboard, drip curriculum player.
- database/: schema.prisma, seed.ts, docker-compose.yml (PostgreSQL on port 5434, Redis on 6381, MinIO storage).
- docs/: requirements.md, architecture.md, api.md, completion-report.md.

## 3. Automated Test Requirements
Implement Jest test suites verifying:
1. Multi-tenant isolation: Tenant queries never return data from other schools.
2. Drip content scheduling enforcement across all 3 release modes.
3. Webhook signature verification and replay prevention.
4. 30-day refund processing and immediate access revocation.
5. 100% lesson completion certificate verification.
```

---

## Prompt 4: LMS Platform (Udemy Clone) (`04-lms-platform-udemy-clone`)

```markdown
Build application "04-lms-platform-udemy-clone" (Display Name: "LMS Platform (Udemy Clone)"), a commercial multi-instructor educational marketplace.

## 1. Core Requirements & Architecture
- Database: studyo_lms_db (PostgreSQL + Prisma).
- Multi-Instructor KYC & Moderation Pipeline:
  - Instructor Profiles: Initial status UNVERIFIED. Must submit KYC identity documents (e.g., government ID, academic credentials) transitioning to PENDING.
  - Administrative Approval: Only VERIFIED instructors can submit paid courses for publication.
  - Course Publication State Machine: DRAFT -> SUBMITTED -> IN_REVIEW -> APPROVED/REJECTED -> PUBLISHED/UNPUBLISHED.
  - Ownership Guard: Only the course creator or administrators can edit or publish courses.
- Marketplace Catalog & Search:
  - Multi-faceted search: Category slug, difficulty level (BEGINNER, INTERMEDIATE, EXPERT), minimum rating threshold, max price filter, and keyword search across title/description.
- Multi-Course Cart & Decimal Accounting:
  - Cart holding multiple courses with integer minor units pricing (cents).
  - Stacking coupon codes and site-wide promotional campaigns (`FLASH2026`).
  - 30-day refund guarantee with automatic enrollment revocation upon approval.
- Course Player, Community & Assessment:
  - Video player with DRM signed tokens and free preview lessons accessible without authentication.
  - Synchronized video notes with `timestampSec`.
  - Section Q&A discussion threads with replies, upvotes, and resolved flags.
  - In-course quizzes (answer keys masked in student view) and assignments with instructor grading.
  - Review Gating: Students can only leave ratings/reviews if they have an active enrollment AND have completed at least 20% of course lessons.
  - Verifiable Certificates: Issued upon 100% lesson completion.

## 2. Directory Structure & Stack
- backend/: Node.js, Express/NestJS, TypeScript, Jest.
- frontend/: Next.js 14 (App Router), Tailwind CSS, marketplace catalog, course landing page, course player with notes/Q&A, instructor studio.
- database/: schema.prisma, seed.ts, docker-compose.yml (PostgreSQL on port 5435, Redis on 6382, MinIO storage).
- docs/: requirements.md, architecture.md, api.md, completion-report.md.

## 3. Automated Test Requirements
Implement Jest test suites verifying:
1. Multi-faceted catalog search and recommendation filtering.
2. DRM access control: free preview access vs. paid lesson blocking vs. refunded revocation.
3. Instructor KYC verification gating and course publication lifecycle.
4. Multi-course cart calculations, coupon stacking, and 30-day refund revocations.
5. Quiz grading, assignment submission/grading, review 20% gating, and certificate issuance.
```

---

## Prompt 5: Code Learning Platform (`05-code-learning-platform`)

```markdown
Build application "05-code-learning-platform" (Display Name: "Code Learning Platform"), an interactive gamified coding platform with sandboxed execution.

## 1. Core Requirements & Architecture
- Database: studyo_code_learning_db (PostgreSQL + Prisma).
- Decoupled Sandboxed Execution Service (`execution-service/`):
  - Untrusted code MUST NEVER execute directly in the main API server process.
  - Submissions are evaluated in an isolated worker with strict resource constraints:
    - Network isolation: `network_mode: none`.
    - Filesystem: Read-only root with ephemeral in-memory tmpfs working directory.
    - User: Unprivileged non-root user (`nobody` / UID 1000).
    - Hard wall-clock timeout: 3000ms - 5000ms to stop infinite loops (verdict: TIME_LIMIT_EXCEEDED).
    - Memory cap: 128 MB to prevent OOM floods (verdict: MEMORY_LIMIT_EXCEEDED).
    - Process cap: Maximum 64 PIDs to block fork bombs.
    - Output ceiling: Stdout truncated at 64 KB (verdict: OUTPUT_LIMIT_EXCEEDED).
    - Prohibited modules: Block imports of `child_process`, `fs`, `net`, and `process.exit`.
  - Pinned Docker runtime images in `runtime-images/`: Python 3.11 (`python`), Node.js 20 (`node`), C++ g++ 13 (`cpp`).
- Zero-Leak Evaluation:
  - Curriculum tracks (Tracks -> Chapters -> Challenges) with starter boilerplate and public test cases.
  - Confidential hidden test cases (edge cases, large numbers, boundary tests) are evaluated server-side.
  - Neither hidden test inputs nor expected outputs are ever exposed to the client in challenge APIs or failed test result payloads.
- Gamification & Progression:
  - Daily coding streaks tracking consecutive active days with longest streak persistence and `STREAK_7` milestone badge unlocking.
  - XP rewards granted only on the user's first accepted solution per challenge.
- Interactive Algorithm Visualizer:
  - Step-by-step state trace generator for array sorting algorithms (Bubble Sort, Selection Sort) emitting array states and pointer highlights (`i`, `j`, `currentMin`, `comparing`, `swapped`).
- Verifiable Track Certification:
  - Track completion requires 100% accepted challenges across all chapters of the track.
  - Issues cryptographic certificates with unique verification codes verifiable publicly.

## 2. Directory Structure & Stack
- backend/: Node.js, Express/NestJS, TypeScript, Jest.
- execution-service/: Sandboxed worker with isolated runner, Dockerfile, package.json, and README.md.
- runtime-images/: Pinned Dockerfiles for python, node, and cpp.
- frontend/: Next.js 14 (App Router), Tailwind CSS, curriculum map, split-pane IDE coding interface with console drawer, algorithm visualizer canvas, and certificate verification.
- database/: schema.prisma, seed.ts, docker-compose.yml (PostgreSQL on port 5436, Redis on 6383).
- docs/: requirements.md, architecture.md, api.md, completion-report.md.

## 3. Automated Test Requirements
Implement Jest test suites verifying:
1. Sandboxed security: Infinite loop timeout termination, prohibited module access blocking, stdout buffer capping.
2. Test runner verdicts: ACCEPTED on correct solution, WRONG_ANSWER on flawed logic, RUNTIME_ERROR on exceptions.
3. Zero-leak verification: Public challenge serializers and failed test results never expose hidden test data.
4. Gamification: Consecutive daily streak tracking, first-solve XP allocation (no duplicate inflation), 7-day badge unlocking.
5. Algorithm visualizer sequential frame generation and 100% track completion certificate gating.
```
