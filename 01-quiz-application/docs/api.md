# Quiz Application - REST API Specification

## Base URL
`/api/v1`

## 1. Authentication
- `POST /auth/register` - Create student or teacher account
- `POST /auth/login` - Authenticate and return JWT token
- `GET /auth/me` - Retrieve authenticated user profile

## 2. Quizzes
- `GET /quizzes` - List available quizzes (filtered by category, difficulty, published state)
- `POST /quizzes` - Create a new quiz (Teacher / Admin)
- `GET /quizzes/:id` - Get quiz details (Student view strips answer keys; Teacher view includes keys)
- `PUT /quizzes/:id` - Update quiz configuration (Teacher / Admin)
- `DELETE /quizzes/:id` - Delete quiz (Teacher / Admin)
- `POST /quizzes/:id/regrade` - Trigger regrade for all attempts after key corrections

## 3. Question Bank
- `GET /questions` - List questions in question bank
- `POST /questions` - Create question (supports 7 question types)
- `PUT /questions/:id` - Update question and answer criteria
- `DELETE /questions/:id` - Delete question
- `POST /questions/import` - Bulk import questions via CSV or JSON
- `GET /questions/export` - Export questions as JSON

## 4. Assessment Attempts
- `POST /quizzes/:id/attempts` - Start a new attempt (enforces availability and max attempt limits)
- `GET /attempts/:id` - Retrieve attempt state and questions (serialized without answer keys)
- `PUT /attempts/:id/answers` - Autosave an answer (idempotent, version-checked)
- `POST /attempts/:id/submit` - Submit quiz for evaluation
- `GET /attempts/:id/results` - Get attempt results (governed by release policy)

## 5. Grading & Analytics
- `GET /grading/queue` - List pending essays requiring manual grading
- `POST /grading/grade-essay` - Submit essay score and rubric feedback
- `GET /quizzes/:id/analytics` - Score distribution, difficulty index, and discrimination index

## 6. Certificates
- `GET /certificates/:id` - Retrieve certificate details
- `GET /certificates/verify/:code` - Public verification of certificate authenticity
