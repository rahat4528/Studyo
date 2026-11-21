# Online Course Platform - REST API Specification

## Base URL
`/api/v1`

## 1. Authentication
- `POST /auth/register` - Create account
- `POST /auth/login` - Authenticate user
- `GET /auth/me` - Get profile and school memberships

## 2. School Management & Branding
- `POST /schools` - Create new school / academy
- `GET /schools/:slug` - Public school details, theme colors, and landing page
- `PUT /schools/:slug/theme` - Update branding (logo, primary color, hero text)

## 3. Courses & Drip Curriculum
- `GET /schools/:slug/courses` - List published courses for the school
- `POST /schools/:slug/courses` - Create course (Owner / Instructor)
- `GET /schools/:slug/courses/:id` - Course details with curriculum overview
- `GET /schools/:slug/lessons/:id` - Fetch lesson content & signed media URL (checks enrollment & drip release)

## 4. Enrollments & Checkout
- `POST /schools/:slug/checkout` - Create checkout session with optional coupon validation
- `POST /webhooks/payment` - Webhook receiver with signature verification and idempotent fulfillment
- `GET /schools/:slug/students/me/enrollments` - List student's enrolled courses

## 5. Progress & Certificates
- `PUT /schools/:slug/lessons/:id/progress` - Update lesson playback progress & completion
- `POST /schools/:slug/courses/:id/certificate` - Issue certificate upon 100% course completion
- `GET /certificates/verify/:code` - Public verification of credential authenticity
