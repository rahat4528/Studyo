# LMS Platform (Udemy Clone) - Requirements Specification

## 1. System Purpose & Scope
The LMS Platform (Udemy Clone) is a comprehensive multi-instructor digital learning marketplace. In contrast to creator-owned isolated school academies, this platform operates a unified public catalog, multi-category taxonomy, search and recommendation engine, standardized learning player with synchronized notes, section Q&A discussions, integrated assignments, and an administrative moderation workflow.

## 2. Roles & Permissions

| Action | Student | Instructor | Platform Administrator |
|---|---|---|---|
| Browse public catalog & search | Allowed | Allowed | Allowed |
| Free lesson preview | Allowed | Allowed | Allowed |
| Access paid lessons & stream media | Allowed (if enrolled) | Allowed (own courses) | Allowed |
| Cart checkout & promotional purchase | Allowed | Allowed | Allowed |
| Timestamped notes & course Q&A | Allowed (enrolled) | Allowed (own courses) | Allowed (moderate) |
| Author course & manage curriculum | Denied | Allowed (own courses) | Allowed |
| Submit course for publication | Denied | Allowed (if verified) | Allowed |
| Approve / Reject course publication | Denied | Denied | Allowed |
| Grade assignments & evaluate quizzes | Denied | Allowed (own courses) | Allowed |
| Process refunds & manage platform campaigns | Denied | Denied | Allowed |

## 3. Core Business Rules & Integrity

### 3.1 Paid Content Access Control
- Enrolled students alone are authorized to retrieve paid lesson content, downloadable resources, or signed media playback tokens.
- Non-enrolled users, refunded users, or users attempting to request unpublished courses are denied access.

### 3.2 Publication Pipeline & Instructor Verification
- Instructors must complete identity and instructional verification before submitting paid courses for publication.
- Course publication follows an administrative approval flow:
  `DRAFT` -> `SUBMITTED` -> `IN_REVIEW` -> `APPROVED` / `REJECTED` -> `PUBLISHED` (and `UNPUBLISHED`).

### 3.3 Shopping Cart, Coupons & Promotional Campaigns
- Multi-course cart with decimal arithmetic (minor units in integer cents).
- Coupon stacking rules: instructor course coupons and platform-wide promotional campaigns with date windows.
- Transactional consistency: every successful payment atomically produces enrollment and order records.

### 3.4 Learning Experience & Assessments
- Video player with timestamped notes (`02:45 - Important architectural note`).
- Threaded course discussions with instructor responses and upvotes.
- Course assignments supporting student submissions, instructor grading, and resubmissions.
- Embedded quizzes with server-side scoring and hidden answer keys.
- Completion certificate issuance when all completion criteria (all lessons, passed quizzes, graded assignments) are met.
