# LMS Platform (Udemy Clone) - REST API Specification

## Base URL
`/api/v1`

## 1. Authentication & Profiles
- `POST /auth/register` & `/auth/login` - User registration and authentication
- `GET /auth/me` - Profile, verification status, and enrolled courses

## 2. Catalog & Discovery
- `GET /courses` - Search courses with facets (category, price, rating, level)
- `GET /courses/recommended` - Heuristic-based personalized recommendations
- `GET /courses/:id` - Public course overview, curriculum preview, instructor bio, reviews

## 3. Course Content & Streaming
- `GET /courses/:id/lessons/:lessonId` - Fetch lesson content and signed video stream URL (enrollment-checked)
- `PUT /courses/:id/lessons/:lessonId/progress` - Save lesson completion and playback position

## 4. Cart, Checkout & Orders
- `POST /cart/add` & `GET /cart` - Manage cart items
- `POST /checkout` - Process cart purchase with coupons and platform campaigns
- `POST /orders/:id/refund` - Request refund within policy window (revokes course access)

## 5. Assessments & Assignments
- `POST /courses/:id/assignments/:assignmentId/submit` - Submit student assignment text/file
- `POST /courses/:id/assignments/:assignmentId/grade` - Instructor grades assignment
- `POST /courses/:id/quizzes/:quizId/attempt` - Submit embedded quiz attempt

## 6. Discussions & Notes
- `GET /courses/:id/discussions` & `POST /courses/:id/discussions` - Lesson Q&A thread management
- `POST /courses/:id/notes` & `GET /courses/:id/notes` - Timestamped video notes

## 7. Instructor Studio & Moderation
- `POST /instructor/verification` - Submit instructor credentials for verification
- `POST /instructor/courses` - Create course
- `POST /instructor/courses/:id/publish-request` - Submit course to administrative review
- `POST /admin/courses/:id/review` - Approve or reject course publication
- `GET /certificates/verify/:code` - Public verification of credential authenticity
