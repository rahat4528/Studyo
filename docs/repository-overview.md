# Repository Overview

Studyo provides five dedicated software solutions addressing distinct domains of modern education technology.

## Domain Segregation

To maintain clean architectural boundaries and mirror enterprise separation of concerns, the applications are partitioned by domain:

```
+-------------------------------------------------------------------+
|                            Studyo                                 |
+-------------------------------------------------------------------+
|  [01-quiz-application]       | Dedicated Assessment & Evaluation  |
|  [02-student-portal-system]  | Academic Registrar & Administration|
|  [03-online-course-platform] | Creator-Owned Branded Academies    |
|  [04-lms-platform-udemy-clone]| Multi-Instructor Marketplace       |
|  [05-code-learning-platform] | Interactive Code Execution Sandbox |
+-------------------------------------------------------------------+
```

### Architectural Distinctions
- **Assessment vs. Course Delivery:** Assessment engines require strict server-side authority over timers, hidden answer keys, and idempotent answer versioning. The Quiz Application isolates these rules from standard media-streaming LMS platforms.
- **Institutional Records vs. Commercial Delivery:** The Student Portal manages accredited degree structures, transcripts, prerequisite trees, and attendance ledgers. Commercial course platforms prioritize marketing, storefronts, and checkout funnels.
- **Creator Storefronts vs. Central Marketplace:** The Online Course Platform isolates tenants by school slug and domain, giving creators sovereign branding. The LMS Platform aggregates thousands of independent instructors into a single unified search and catalog taxonomy.
- **Code Execution Sandbox Isolation:** The Code Learning Platform decouples untrusted code execution from the primary API server, executing user code inside ephemeral, network-disabled containers.
