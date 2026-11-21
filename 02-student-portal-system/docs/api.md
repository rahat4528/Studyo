# Student Portal System - REST API Specification

## Base URL
`/api/v1`

## 1. Authentication & Identity
- `POST /auth/login` - Authenticate student, faculty, admin, or guardian
- `GET /auth/me` - Retrieve current user profile and role details

## 2. Academic Catalog & Programs
- `GET /departments` - List departments
- `GET /programs` - List academic degree programs and credit requirements
- `GET /courses` - List catalog courses and prerequisite relationships
- `GET /semesters` - List academic terms and registration windows

## 3. Course Registration & Schedules
- `GET /sections` - List open course sections with remaining seat capacity
- `POST /enrollments/register` - Attempt course registration (verifies prerequisites, seats, holds, and schedule conflicts)
- `POST /enrollments/drop` - Drop a registered section
- `GET /students/me/schedule` - Get weekly timetable of enrolled classes

## 4. Attendance & Leave Management
- `GET /faculty/sections/:id/attendance` - Get attendance roster for a class section
- `POST /faculty/sections/:id/attendance` - Record or update daily attendance
- `POST /leave-applications` - Submit student leave application
- `PUT /leave-applications/:id/review` - Approve or reject leave application

## 5. Examinations, Grades & GPA
- `POST /examinations/submit-marks` - Faculty submits section exam marks (DRAFT -> SUBMITTED)
- `POST /examinations/publish-results` - Administrator approves and publishes semester results
- `GET /students/me/grades` - View published semester grades, GPA, and cumulative CGPA
- `POST /grades/:id/revision` - Registrar post-publication grade correction with audit reason

## 6. Financial Ledger & Clearance
- `GET /students/me/fees` - View student fee charges, payments, and outstanding balance
- `POST /finance/payments` - Record payment against student account
- `POST /finance/reversals` - Append reversing entry for payment adjustment
- `GET /students/me/clearance` - Check financial and graduation clearance status

## 7. Transcripts & Credential Verification
- `POST /transcripts/issue` - Generate sealed immutable official transcript
- `GET /transcripts/verify/:code` - Public verification of transcript authenticity
