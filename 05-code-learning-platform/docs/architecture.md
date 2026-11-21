# Code Learning Platform - Architecture Specification

## 1. System Architecture

The Code Learning Platform decouples the web catalog and user state from the untrusted code execution sandbox.

```
+-------------------------------------------------------------------+
|                        Client Browser                             |
|  (Next.js 14 App Router, Monaco Editor, Interactive Visualizer)   |
+---------------------------------+---------------------------------+
                                  | HTTP / JSON REST API
+---------------------------------v---------------------------------+
|                       Main API Backend                            |
|             (Node.js / Express / TypeScript)                      |
|                                                                   |
|   +-----------------------+     +-------------------------------+ |
|   |  Curriculum Service   |     |    Gamification & Streaks     | |
|   +-----------------------+     +-------------------------------+ |
|   |  Submission Evaluator |     |    Certification Engine       | |
|   +-----------------------+     +-------------------------------+ |
+------------------+--------------------------------+---------------+
                   |                                |
       Enqueue Job |                                | Read / Write
                   v                                v
+-----------------------------------+   +---------------------------+
|    Execution Worker & Sandbox     |   |    PostgreSQL Database    |
| (Resource Quotas, Ephemeral tmpfs,|   | (studyo_code_learning_db) |
|  Network Block, PID Limits)       |   +---------------------------+
+-----------------------------------+
```

---

## 2. Multi-Layer Security Architecture

### 2.1 Defense-in-Depth Container Sandboxing
1. **Network Disconnection:** Containers run with `--net=none` to completely prevent outbound connections, data exfiltration, or reverse shells.
2. **Read-Only Root Filesystem:** Root filesystem mounted read-only (`--read-only`), with only `/tmp` mounted as an in-memory `tmpfs` volume with `noexec,nodev,nosuid` flags where applicable.
3. **PIDs Limit:** Set to `--pids-limit=64` to instantly terminate fork bombs (`:(){ :|:& };:`).
4. **Memory Hard Cap:** Set to `--memory=128m` with `--memory-swap=128m` to prevent swap exhaustion and OOM kills of the host system.
5. **CPU Throttling:** Restricted to `--cpus=0.5` to prevent denial-of-service CPU starvation.
6. **Execution User:** Runs as non-root unprivileged user (`nobody`, UID 65534 / UID 1000).

---

## 3. Database Architecture (`studyo_code_learning_db`)
- PostgreSQL database stores:
  - Users, Authentication credentials, Roles (`STUDENT`, `AUTHOR`, `ADMINISTRATOR`).
  - Tracks, Chapters, Challenges, Test Cases (isPublic flag).
  - Submissions, Verdicts, Execution Times, Memory Peaks.
  - User Streaks, Activity Logs, XP Balances, Achievement Badges.
  - Certificates with unique cryptographic verification codes.
