# Quiz Application - Architecture Specification

## 1. Architectural Overview

```
+-----------------------------------------------------------+
|              Next.js 14 Client Tier                       |
|  - Student Exam Player (Distraction-Free)                 |
|  - Teacher Quiz Builder & Question Bank                   |
|  - Analytics & Gradebook Dashboard                        |
+-----------------------------------------------------------+
                              │ REST JSON API / Bearer JWT
                              ▼
+-----------------------------------------------------------+
|              NestJS / Express Application Tier            |
|  ├── Auth & RBAC Guards                                   |
|  ├── Quiz & Question Bank Service                         |
|  ├── Assessment & Attempt Orchestrator                    |
|  │   ├── Server Timer Authority                           |
|  │   ├── Seed-based Deterministic Randomizer              |
|  │   └── Answer Serializer (Key Stripper)                 |
|  ├── Multi-Strategy Scoring Engine                        |
|  │   ├── Exact / Partial / Normalized Text / Pair Matches |
|  │   └── Negative Marking & Decimals                      |
|  ├── Regrading & GradeRevision Audit Service              |
|  └── Certificate Verification Service                     |
+-----------------------------------------------------------+
                              │
               ┌──────────────┴──────────────┐
               ▼                             ▼
+-----------------------------+ +---------------------------+
| PostgreSQL (Prisma ORM)     | | Redis (Cache & Expiry Job)|
| - studyo_quiz_db            | | - BullMQ for Auto-Submit  |
+-----------------------------+ +---------------------------+
```

## 2. Assessment Integrity & Threat Mitigation

### 2.1 Server Timer Authority
- **Threat:** Client manipulates machine clock to extend test duration.
- **Mitigation:** The server computes `startedAt = now()` and `deadline = startedAt + durationSeconds` upon attempt creation. The client receives the deadline timestamp strictly for UI rendering. Upon submission, the server rejects any answers submitted past `deadline + gracePeriod` (e.g. 5 seconds for network latency).

### 2.2 Answer Key Isolation
- **Threat:** Student inspects browser network payloads or local storage to retrieve answer keys.
- **Mitigation:** The student-facing serializer traverses the quiz object graph and strips `isCorrect`, `acceptedAnswers`, `rubric`, and `explanation` fields. Correct answers are revealed only when the quiz release policy permits and the attempt has been finalized.

### 2.3 Race Condition on Maximum Attempts
- **Threat:** Student triggers multiple simultaneous `POST /attempts/start` requests to exceed the maximum attempt allowance.
- **Mitigation:** Start requests execute inside a database transaction with serializable isolation or atomic count locks.

### 2.4 Seed-Based Reproducibility
- **Requirement:** Each attempt stores an integer `randomSeed`.
- **Implementation:** Pseudo-random permutations of question orders and option orders are computed using a linear congruential generator or Mulberry32 keyed by `attemptId + seed`. When a teacher reviews the attempt, the exact question and option sequence presented to the student is reproduced identically.
