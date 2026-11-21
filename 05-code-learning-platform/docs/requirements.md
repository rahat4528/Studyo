# Code Learning Platform - Requirements Specification

## 1. System Overview
The **Code Learning Platform** is an interactive, gamified computer science and software development education platform. It allows learners to solve coding challenges directly in the browser across multiple programming languages (JavaScript, TypeScript, Python, C++), execute code securely against automated test suites, visualize algorithmic data structures step-by-step, maintain daily coding streaks, earn achievement badges, and receive verifiable certifications.

---

## 2. Functional Requirements

### 2.1 Interactive Curriculum & Tracks
- Structured hierarchy: `Track` (e.g. "Data Structures & Algorithms", "Full-Stack Web Foundations") &rarr; `Chapter` &rarr; `Challenge`.
- Each challenge includes:
  - Rich markdown problem statement.
  - Starter boilerplate code in supported languages.
  - Public test cases with visible expected outputs.
  - Hidden test cases with edge cases, stress tests, and large inputs for strict grading.
  - Tiered hints with cooldowns or XP costs.

### 2.2 Sandboxed Execution Service
- Untrusted user code MUST NEVER execute inside the main web server process.
- Execution requests are isolated with strict multi-layered security constraints:
  - **Network Isolation:** No external internet access (`network_mode: none`).
  - **Filesystem Isolation:** Read-only root filesystem with ephemeral tmpfs working directory.
  - **Process & Privilege Drop:** Execution as unprivileged user (`nobody`, UID 1000).
  - **Resource Quotas:**
    - Wall-clock execution timeout (e.g., 3.0s - 5.0s) &rarr; `TIME_LIMIT_EXCEEDED`.
    - Memory ceiling (e.g., 128 MB) &rarr; `MEMORY_LIMIT_EXCEEDED`.
    - Maximum process count / PID limit (e.g., 64) &rarr; Fork bomb protection.
    - Standard output / error buffer truncation (e.g., max 64 KB) &rarr; `OUTPUT_LIMIT_EXCEEDED`.
  - **Verdicts:**
    - `ACCEPTED`: All public and hidden test assertions passed within time and memory constraints.
    - `WRONG_ANSWER`: One or more test assertions returned unexpected results.
    - `TIME_LIMIT_EXCEEDED`: Process exceeded wall-clock timeout.
    - `MEMORY_LIMIT_EXCEEDED`: Process exceeded memory limits.
    - `RUNTIME_ERROR`: Unhandled exception, segmentation fault, or non-zero exit code.
    - `COMPILATION_ERROR`: Syntax or type checking failures before execution.

### 2.3 Zero-Leak Hidden Test Cases
- Hidden test inputs and expected outputs are NEVER sent to the client browser in challenge payloads.
- Test runner executes assertions securely server-side and only returns boolean pass/fail status and assertion failure count without leaking confidential test data.

### 2.4 Gamification, Streaks & Achievements
- **Streaks:** Tracks consecutive calendar days of solving at least one challenge. Broken streaks can be restored with streak freezes.
- **Experience Points (XP):** Awarded on challenge completion based on difficulty (Beginner: 50 XP, Intermediate: 100 XP, Hard: 250 XP).
- **Achievements:** Badges awarded for milestones (e.g., "7-Day Streak Master", "Algorithmic Pioneer", "Polyglot Coder").

### 2.5 Algorithm Visualizer
- Interactive execution visualizer step-by-step state representation (e.g., Bubble Sort, Quick Sort, Binary Search, Graph BFS/DFS).
- Emits execution trace snapshots (arrays, pointers, visited sets) for synchronized animated playback.

### 2.6 Verifiable Certifications
- Awarded upon 100% completion of a designated learning path or capstone project.
- Sealed with an immutable cryptographic verification hash and publicly verifiable via verification codes.
