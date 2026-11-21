# Code Learning Platform - Application 05

The **Code Learning Platform** is an interactive, gamified computer science and software development platform featuring multi-language curriculum tracks, disposable sandboxed code execution, zero-leak hidden edge case testing, interactive algorithm state visualizers, streaks, and verifiable achievement certifications.

---

## 1. Key Architectural & Security Capabilities

- **Isolated Execution Service:**
  - Untrusted user code is completely decoupled from the web server.
  - Hard wall-clock timeout (3000ms &ndash; 5000ms) prevents infinite loops (`TIME_LIMIT_EXCEEDED`).
  - Hard memory cap (128 MB) prevents out-of-memory crashes (`MEMORY_LIMIT_EXCEEDED`).
  - Strict PID limits (64 PIDs) protect host environments from fork bombs.
  - Standard output truncation (64 KB ceiling) prevents buffer flood attacks (`OUTPUT_LIMIT_EXCEEDED`).
  - Prohibited module isolation blocks unauthorized access to `child_process`, `fs`, and process controls.

- **Zero-Leak Test Evaluation:**
  - Public test cases provide immediate developer feedback (inputs, expected values, actual values).
  - Confidential hidden test cases (edge cases, boundary limits, negative inputs) are evaluated server-side.
  - Neither test inputs nor expected outputs for hidden test cases are ever transmitted to the client, preventing test scraping or hardcoded answers.

- **Gamification, Streaks & Badges:**
  - Consecutive calendar day tracking increments user streaks and updates immutable longest streak records.
  - 7-day streak automatically unlocks the `STREAK_7` achievement badge with bonus experience points.
  - First-time challenge solutions award experience points (XP); duplicate submissions do not inflate rewards.

- **Interactive Algorithm Visualizer:**
  - Real-time step-by-step array state representations for sorting algorithms (Bubble Sort, Selection Sort).
  - Pointers tracking (`i`, `j`, `currentMin`, `comparing`, `swapped`) for synchronized animated visual feedback.

- **Track Certification Engine:**
  - Track completion requires 100% accepted solutions across every challenge in all chapters of a track.
  - Issues cryptographic certificates with unique verification codes (`CERT-CODE-...`) verifiable via public endpoints.

---

## 2. Directory Structure

```
05-code-learning-platform/
├── backend/
│   ├── src/
│   │   ├── database/       # In-memory relational store & seed script
│   │   ├── services/       # Auth, Curriculum, Submission, Gamification, Visualizer, Certs
│   │   ├── types/          # Domain interfaces & verdicts
│   │   └── server.ts       # Express REST API endpoints
│   ├── tests/              # Jest test suites (16 unit & integration tests)
│   ├── package.json
│   └── tsconfig.json
├── execution-service/      # Sandboxed runner with resource quotas & isolation
│   ├── src/
│   │   ├── sandbox.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── runtime-images/         # Pinned Docker runtime images
│   ├── python/Dockerfile
│   ├── node/Dockerfile
│   └── cpp/Dockerfile
├── frontend/
│   ├── src/app/            # Next.js App Router (Curriculum map, IDE challenge, Visualizer, Certs)
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
├── database/
│   └── schema.prisma       # PostgreSQL relational schema
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
npm test            # Runs all 5 test suites (16 tests)
npm run seed        # Seeds curriculum tracks, chapters, challenges, and badges
npm run dev         # Starts API server on port 4005
```

### Running the Frontend
```bash
cd frontend
npm install
npm run dev         # Starts Next.js app on http://localhost:3005
```

---

## 4. Verification & Testing

Execute the test suites:
```bash
cd backend
npm test
```

### Test Coverage Highlights:
- `tests/sandbox-security.test.ts`: Infinite loop timeout protection, forbidden module restrictions, stdout buffer cap.
- `tests/test-runner.test.ts`: Evaluation of valid code (`ACCEPTED`), incorrect logic (`WRONG_ANSWER`), and syntax/exceptions (`RUNTIME_ERROR`).
- `tests/hidden-assertions.test.ts`: Zero leakage of hidden test inputs/outputs in challenge payload or execution failures.
- `tests/gamification-streaks.test.ts`: First-solve XP rewards, consecutive day streak increments, streak reset on missed days, 7-day badge unlocking.
- `tests/visualizer-certification.test.ts`: Sequential sorting state generation, 100% track completion certificate gating, public verification.
