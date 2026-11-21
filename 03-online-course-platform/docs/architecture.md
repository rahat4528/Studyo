# Online Course Platform - Architecture Specification

## 1. Multi-Tenant Architecture

```
+-------------------------------------------------------------+
|               Next.js Branded Storefront Tier               |
|  - Dynamic School Landing Pages (/s/:schoolSlug)            |
|  - Creator Studio (Curriculum Builder, Theme, Sales Stats)  |
|  - Focused Course Player with Drip Schedule & Notes         |
+-------------------------------------------------------------+
                              │ REST JSON API / Bearer JWT
                              ▼
+-------------------------------------------------------------+
|              School Service Tier (Multi-Tenant API)         |
|  ├── School Tenant Context Middleware (:schoolSlug)         |
|  ├── Role & Membership Authorization Guard                  |
|  ├── Course Content & Server Drip Release Engine            |
|  ├── Media Adapter (Expiring Signed Token Generator)        |
|  ├── Decimal Pricing & Coupon Redemption Engine             |
|  ├── Payment Adapter & Idempotent Webhook Processor         |
|  └── Progress Tracker & Verified Certificate Generator     |
+-------------------------------------------------------------+
                              │
               ┌──────────────┴──────────────┐
               ▼                             ▼
+-----------------------------+ +---------------------------+
| PostgreSQL (Prisma ORM)     | | Redis (Cache & Queue)     |
| - studyo_online_course_db   | | - BullMQ Webhook Workers  |
+-----------------------------+ +---------------------------+
```

## 2. Critical Security & Isolation Policies

### 2.1 Multi-Tenant Boundary Enforcement
All queries include `schoolId` in `WHERE` clauses. Requests to `/api/v1/schools/:schoolSlug/...` resolve the school context and reject any cross-tenant data access attempts.

### 2.2 Drip Security Authority
The server computes drip availability based on the student's enrollment timestamp. Non-enrolled students or students with unfulfilled drip requirements receive neither lesson text nor signed media tokens.

### 2.3 Webhook Verification & Out-of-Order Handling
Webhooks from payment providers are checked against HMAC SHA-256 signatures. Events are recorded in an `ProcessedWebhook` table with unique event IDs to prevent duplicate fulfillment.
