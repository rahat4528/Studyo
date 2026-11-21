# Code Learning Platform - REST API Specification

## 1. Authentication
- `POST /api/auth/register` - Create student or author account
- `POST /api/auth/login` - Authenticate and return JWT token
- `GET /api/auth/me` - Current authenticated user profile

## 2. Curriculum & Challenges
- `GET /api/tracks` - List all learning tracks
- `GET /api/tracks/:slug` - Track details with chapters and challenge lists
- `GET /api/challenges/:id` - Challenge details (problem statement, starter code, public tests; NEVER leaks hidden tests)
- `GET /api/challenges/:id/hints` - Retrieve tiered hints (applies XP cost or cooldown)

## 3. Submissions & Code Execution
- `POST /api/challenges/:id/run` - Dry-run starter or user code against visible test cases only
- `POST /api/challenges/:id/submit` - Full evaluation against both public and hidden test cases
- `GET /api/submissions/:id` - Status of execution job and test verdicts

## 4. Gamification & Streaks
- `GET /api/users/profile/streaks` - User's current streak, longest streak, and daily activity calendar
- `GET /api/users/profile/badges` - Earned achievement badges
- `GET /api/leaderboard` - Global or track-specific XP leaderboard

## 5. Visualizer
- `POST /api/visualizer/trace` - Generate step-by-step state frames for algorithmic visualizer

## 6. Certificates
- `POST /api/tracks/:id/claim-certificate` - Verifies 100% track challenge completion and issues certificate
- `GET /api/certificates/verify/:code` - Public verification of certificate validity
