# Quiz Application - Requirements Specification

## 1. System Purpose & Scope
The Quiz Application is a dedicated educational assessment engine designed for timed examinations, formative practice quizzes, and question bank administration. It isolates assessment workflows from full-course learning management, prioritizing server-side assessment integrity, accurate multi-strategy scoring, and anti-tampering measures.

## 2. User Roles & Permission Matrix

| Operation | Student | Teacher | Administrator |
|---|---|---|---|
| View public quiz catalog | Allowed | Allowed | Allowed |
| Start practice quiz | Allowed | Allowed | Allowed |
| Start formal assessment | Allowed (if assigned/eligible) | Allowed (preview) | Allowed |
| Save answer / autosave | Allowed (own attempt only) | Denied | Denied |
| Submit attempt | Allowed (own attempt only) | Denied | Allowed (override) |
| Review own results | Subject to release policy | Allowed | Allowed |
| Create / edit / delete quiz | Denied | Allowed (own quizzes) | Allowed (all) |
| Manage question bank | Denied | Allowed (own questions) | Allowed (all) |
| Manual grading (essays) | Denied | Allowed (assigned quizzes) | Allowed (all) |
| Trigger regrade & review audits | Denied | Allowed (own quizzes) | Allowed |
| Import / Export questions | Denied | Allowed | Allowed |
| Issue / Revoke certificates | Denied | Allowed | Allowed |

## 3. Functional Requirements

### 3.1 Quiz Configuration
- **Metadata:** Title, slug, description, category, difficulty level (Beginner, Intermediate, Advanced), instructions.
- **Constraints:** Time limit (minutes, 0 for untimed), maximum allowed attempts (1 to N, or unlimited for practice), pass percentage threshold.
- **Scheduling & Availability:** Scheduled start window and deadline timestamp.
- **Display & Security Policies:**
  - Randomize question order (deterministic per-attempt seed).
  - Randomize option order for multiple-choice questions.
  - Question pools: select N random questions from category/difficulty pools.
  - Negative marking configuration: enabled/disabled, penalty value (e.g. 0.25 points), optional zero score floor.
  - Results release policy: `IMMEDIATE`, `AFTER_CLOSE_DATE`, or `NEVER` (manual release).
  - Reveal correct answers policy: boolean flag combined with release policy.

### 3.2 Supported Question Types (7 Types)
1. **Multiple Choice (Single Select):** Single correct option among distractors.
2. **Multiple Select:** Multiple correct options. Supports two modes:
   - *All-or-Nothing:* Full marks if and only if exact set is chosen.
   - *Partial Credit with Penalty:* Marks awarded per correct selection and deducted per incorrect selection.
3. **True / False:** Binary proposition validation.
4. **Short Answer:** Exact or normalized text match against an accepted answer list. Supports case-insensitivity, whitespace trimming, and punctuation tolerance.
5. **Fill in the Blanks:** Multi-segment text with blank placeholders evaluated with normalized text comparison and optional numeric tolerance (+/- delta).
6. **Matching:** Paired association between prompt items and response items. Points awarded proportionally per correct pair.
7. **Essay:** Extended response evaluated manually by teachers using an optional rubric criteria scale.

### 3.3 Assessment Execution & State Machine
- **States:** `NOT_STARTED` -> `IN_PROGRESS` -> `SUBMITTED` -> (`AUTO_GRADED` or `PENDING_MANUAL`) -> `FINALIZED`.
- **Expiry:** If `IN_PROGRESS` and `now() > deadline`, transition to `EXPIRED` and trigger auto-submission of saved answers.
- **Parallel Start Guard:** Enforce atomic attempt check to prevent concurrent requests from bypassing max attempt limits.
- **Answer Versioning:** Answers carry incremental version numbers; autosaves are idempotent and race-safe.

### 3.4 Regrading & Audit Trails
- When a teacher updates an answer key or modifies points, a recalculation can be triggered.
- All manual score adjustments and regrades produce immutable `GradeRevision` audit records with timestamp, author, previous score, new score, and justification.
