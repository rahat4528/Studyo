# System Architecture

## Design Principles

1. **Autonomous Fault Domains:** No shared database instances or inter-app runtime dependencies. Failure or downtime in one application cannot affect another.
2. **Server-Side Security Authority:** Client state is treated as unverified. Time deadlines, answer correctness, pricing calculations, discount stacking, and code sandbox boundaries are validated exclusively on the backend.
3. **Auditability & Reversibility:** Critical administrative operations (grades, attendance edits, payments, refunds, and certifications) maintain append-only audit histories.
4. **Idempotent Operations:** State-modifying endpoints (test submissions, checkout webhooks, code execution runs) use idempotency tokens and transactional state machines.

## Application Architecture Overview

```
Client Tier (Next.js / TypeScript / Tailwind CSS)
                       │ REST / OpenAPI
                       ▼
Application Tier (NestJS / Express / Modular Services)
         │                       │
         ▼                       ▼
Data Tier (PostgreSQL)    Worker & Cache Tier (Redis / BullMQ)
```
