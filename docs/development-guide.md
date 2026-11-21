# Development Guide

## Prerequisites
- Node.js >= 20.x
- Docker and Docker Compose
- Git
- PostgreSQL client tools (optional for inspection)

## Repository Layout
```
Studyo/
  docs/                   # High-level architecture and guides
  01-quiz-application/    # Assessment platform
  02-student-portal-system/# Academic registrar and portal
  03-online-course-platform/# Branded course academies
  04-lms-platform-udemy-clone/# Multi-instructor learning marketplace
  05-code-learning-platform/# Interactive programming environment
```

## Running an Application Locally

Each application is self-contained. To run an individual project:

```bash
# 1. Switch into the project folder
cd 01-quiz-application

# 2. Configure environment variables
cp .env.example .env

# 3. Launch isolated container services
docker-compose up -d

# 4. Install backend dependencies and migrate
cd backend
npm install
npx prisma migrate dev
npm run seed

# 5. Launch frontend
cd ../frontend
npm install
npm run dev
```

## Running Verification Tests
```bash
# In the application directory:
npm test
```
