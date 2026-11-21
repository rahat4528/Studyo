# Online Course Platform - Requirements Specification

## 1. System Purpose & Scope
The Online Course Platform empowers independent educators, domain experts, and creators to operate sovereign, branded online academies. Unlike aggregated course marketplaces, this platform emphasizes creator ownership: custom school branding (logos, color palettes, hero sections), slug-based tenant domains (`/s/:schoolSlug`), direct course pricing (one-time purchases, subscriptions, coupons), drip curriculum scheduling, and secured media delivery.

## 2. Multi-Tenancy & School Role Matrix

Every record belongs to a `School` and queries enforce tenant boundaries. A user can be a student in multiple schools and hold an instructor role in another.

| Role | Browse & Enroll | Access Enrolled Lessons | Author & Publish Courses | Configure Branding & Payments | Manage School Members |
|---|---|---|---|---|---|
| STUDENT | Allowed | Allowed (if drip unlocked) | Denied | Denied | Denied |
| ASSISTANT | Allowed | Allowed | Allowed (drafts) | Denied | Denied |
| INSTRUCTOR | Allowed | Allowed | Allowed | Denied | Denied |
| ADMIN | Allowed | Allowed | Allowed | Allowed | Allowed |
| OWNER | Allowed | Allowed | Allowed | Allowed | Allowed (all) |

## 3. Core Functional Requirements

### 3.1 Course Authoring & Drip Scheduling
- **Course Structure:** Modules containing video lessons, text guides, and downloadable file resources.
- **Drip Schedule Engine:**
  - *Immediate:* Available upon enrollment.
  - *Days After Enrollment:* Unlocked strictly $N$ days post-enrollment date ($now \ge enrolledAt + N\text{ days}$).
  - *Specific Calendar Date:* Unlocked at an absolute timestamp ($now \ge releaseDate$).
  - *Server Enforcement:* Attempting to access or stream a locked drip lesson by ID is strictly blocked with `403 Forbidden`.

### 3.2 Secure Media Delivery
- Paid video lessons are never served via public static URLs.
- Video playback URLs are generated dynamically as time-expiring signed tokens (e.g. valid for 15 minutes) only after validating active enrollment and drip release.

### 3.3 Payments, Webhooks & Decimal Precision
- **Pricing Models:** Free, One-Time Purchase, and Recurring Subscriptions.
- **Minor Units & Precision:** All monetary calculations use integer cents / minor units (e.g. $49.00 = 4900 cents) with zero floating-point roundoff errors.
- **Webhook Idempotency:** Signature verification ensures webhook authenticity. Duplicate or out-of-order webhook deliveries are processed idempotently using transactional event tracking.
- **Coupons:** Percent or fixed discounts with expiration windows, total usage limits, per-user limits, and course restrictions.

### 3.4 Progress & Completion Certificates
- Lesson progress stores completion flag and last playback position. Updates are idempotent.
- Certificates are issued only when 100% of required lessons are completed, generating a verifiable code and public validation page.
