# LMS Platform (Udemy Clone) - Architecture Specification

## 1. System Architecture

```
+-------------------------------------------------------------+
|              Next.js Marketplace & Player Tier              |
|  - Course Discovery & Category Taxonomy                     |
|  - Detail Page with Curriculum Accordion & Purchase Card    |
|  - Course Player with Video, Notes, Q&A Tabs & Assignments  |
|  - Instructor Studio & Administrative Moderation Console    |
+-------------------------------------------------------------+
                              │ REST JSON API / Bearer JWT
                              ▼
+-------------------------------------------------------------+
|              Marketplace Service Tier (Modular API)         |
|  ├── Catalog Search & Facet Filtering Engine               |
|  ├── Access Control & Signed Media Token Issuance           |
|  ├── Multi-Item Cart & Promotional Campaign Engine          |
|  ├── Instructor Verification & Course Moderation State      |
|  ├── Assessment & Assignment Evaluation Service             |
|  ├── Notes & Discussion Moderation Engine                   |
|  └── Completion Criteria & Certificate Service              |
+-------------------------------------------------------------+
                              │
               ┌──────────────┴──────────────┐
               ▼                             ▼
+-----------------------------+ +---------------------------+
| PostgreSQL (Prisma ORM)     | | Redis (Cache & Queue)     |
| - studyo_lms_db             | | - BullMQ Async Workers    |
+-----------------------------+ +---------------------------+
```

## 2. Key Architectural Guarantees

### 2.1 Access Control Invariant
Every media endpoint validates user enrollment before issuing temporary video playback tokens. Locked lessons return neither video media IDs nor signed streaming URLs.

### 2.2 Transactional Consistency between Purchase and Enrollment
Orders and enrollments are created within a single database transaction or transactional outbox. A reconciliation worker ensures that no paid transaction exists without its corresponding enrollment.

### 2.3 Search & Recommendation Heuristic
Course search provides facet filtering (category, price, rating, level) with relevance ranking. Course recommendations incorporate user category enrollments and popular co-enrollment counts.
