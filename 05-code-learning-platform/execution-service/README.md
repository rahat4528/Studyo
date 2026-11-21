# Execution Service - Sandboxed Code Runner

The **Execution Service** is an isolated worker process designed to execute untrusted user code safely without risking the stability, security, or resources of the host system.

---

## 1. Security Architecture & Invariants

| Security Dimension | Defense Mechanism | Invariant Guaranteed |
|---|---|---|
| **Network Isolation** | `network_mode: none` | Container has zero inbound/outbound network interfaces; reverse shells and SSRF attempts fail immediately. |
| **Filesystem Isolation** | `--read-only` root with `tmpfs` | Root filesystem cannot be modified. Ephemeral `/tmp` is wiped on process exit. |
| **Privilege Escalation** | `USER runner` (UID 1000) | Process executes as an unprivileged non-root user. |
| **Fork Bombs** | `--pids-limit=64` | Process cannot spawn unlimited subprocesses; fork attacks are contained. |
| **Infinite Loops** | Hard wall-clock timeout (3000ms - 5000ms) | Runner sends `SIGKILL` if execution duration exceeds quota &rarr; `TIME_LIMIT_EXCEEDED`. |
| **OOM Floods** | Hard memory cap (128MB) | High memory usage triggers kernel OOM termination &rarr; `MEMORY_LIMIT_EXCEEDED`. |
| **Output Floods** | Standard output capped at 64 KB | Excessive logging truncated with `OUTPUT_LIMIT_EXCEEDED`. |

---

## 2. Supported Languages

- **Python 3.11** (`python`)
- **JavaScript / Node.js 20** (`javascript`)
- **TypeScript** (`typescript`)
- **C++ (g++ 13)** (`cpp`)
