import { db } from './db';
import { authService } from '../services/auth.service';
import { catalogService } from '../services/catalog.service';
import { moderationService } from '../services/moderation.service';
import { assessmentService } from '../services/assessment.service';
import { cartService } from '../services/cart.service';

export function seedLMS(): void {
  db.clear();

  // 1. Users & Instructors
  const admin = authService.register(
    'admin@studyo-lms.local',
    'AdminPass123!',
    'System Administrator',
    'ADMINISTRATOR'
  );

  const instructorUser = authService.register(
    'instructor@studyo-lms.local',
    'InstructorPass123!',
    'Dr. Alex Vance',
    'INSTRUCTOR'
  );

  const student = authService.register(
    'student@studyo-lms.local',
    'StudentPass123!',
    'Morgan Reed',
    'STUDENT'
  );

  const instProfile = moderationService.registerInstructorProfile(
    instructorUser.id,
    'Senior Software Architect & Distributed Systems Specialist',
    'Educator with 15+ years experience building enterprise microservices and cloud-native systems.'
  );
  moderationService.submitVerificationDocs(instructorUser.id, 'doc-vault://vance-phd-gov-id-2026.pdf');
  moderationService.reviewInstructorVerification(instructorUser.id, 'VERIFIED', admin.role);

  // 2. Categories
  const catWeb = catalogService.createCategory('Web Development', 'web-development', 'Modern full-stack web applications and APIs');
  const catCloud = catalogService.createCategory('Cloud & DevOps', 'cloud-devops', 'Kubernetes, containerization, and AWS architecture');
  const catData = catalogService.createCategory('Data Science', 'data-science', 'Machine learning, data pipelines, and analytics');

  // 3. Courses
  const course1 = catalogService.createCourse(
    instructorUser.id,
    catWeb.id,
    'Advanced TypeScript & Enterprise Architecture',
    'advanced-typescript-architecture',
    'Master production-grade TypeScript, domain-driven design, and scalable backend patterns',
    2999, // $29.99
    'USD',
    'INTERMEDIATE',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800'
  );

  // Add Curriculum
  const sec1 = catalogService.addSection(course1.id, 'Module 1: Type Systems & Advanced Generics', instructorUser.id, 'INSTRUCTOR');
  const sec2 = catalogService.addSection(course1.id, 'Module 2: Clean Architecture in Node.js', instructorUser.id, 'INSTRUCTOR');

  const l1 = catalogService.addLesson(
    course1.id,
    sec1.id,
    'Conditional Types & Template Literal Types',
    'Deep dive into mapped types and type inference',
    'media/videos/ts-m1-l1.mp4',
    600,
    true, // preview
    instructorUser.id,
    'INSTRUCTOR'
  );

  const l2 = catalogService.addLesson(
    course1.id,
    sec1.id,
    'Distributive Conditional Types in Practice',
    'How unions distribute across conditional type branches',
    'media/videos/ts-m1-l2.mp4',
    750,
    false,
    instructorUser.id,
    'INSTRUCTOR'
  );

  const l3 = catalogService.addLesson(
    course1.id,
    sec2.id,
    'Decoupling Core Domain from External I/O',
    'Ports and Adapters architecture pattern in TypeScript',
    'media/videos/ts-m2-l1.mp4',
    900,
    false,
    instructorUser.id,
    'INSTRUCTOR'
  );

  // Course submit & publish
  moderationService.submitCourseForReview(course1.id, instructorUser.id);
  moderationService.startReview(course1.id, admin.role);
  moderationService.approveCourse(course1.id, admin.role);
  moderationService.publishCourse(course1.id, instructorUser.id, 'INSTRUCTOR');

  // Course 2 (Free beginner course)
  const course2 = catalogService.createCourse(
    instructorUser.id,
    catCloud.id,
    'Docker & Container Fundamentals for Developers',
    'docker-container-fundamentals',
    'Learn how to package, isolate, and orchestrate containers locally',
    0, // Free
    'USD',
    'BEGINNER',
    'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800'
  );
  const secCloud1 = catalogService.addSection(course2.id, 'Getting Started with Containers', instructorUser.id, 'INSTRUCTOR');
  catalogService.addLesson(course2.id, secCloud1.id, 'Images, Layers, and Dockerfile Directives', 'Core primitives of container images', 'media/videos/docker-l1.mp4', 500, true, instructorUser.id, 'INSTRUCTOR');

  moderationService.submitCourseForReview(course2.id, instructorUser.id);
  moderationService.startReview(course2.id, admin.role);
  moderationService.approveCourse(course2.id, admin.role);
  moderationService.publishCourse(course2.id, instructorUser.id, 'INSTRUCTOR');

  // 4. Coupons & Campaigns
  cartService.createCoupon('WELCOME50', 50, undefined, 100);
  cartService.createCampaign('SUMMER_FLASH', 'FLASH2026', 20, '2026-01-01T00:00:00Z', '2026-12-31T23:59:59Z');

  // 5. Quiz & Assignment
  assessmentService.createQuiz(
    course1.id,
    'Module 1 Knowledge Check',
    80,
    [
      {
        id: 'q1',
        prompt: 'What keyword enables conditional type distribution across union members?',
        points: 5,
        options: [
          { id: 'opt1', label: 'T extends any', isCorrect: true },
          { id: 'opt2', label: 'T as const', isCorrect: false },
          { id: 'opt3', label: 'keyof T', isCorrect: false },
        ]
      },
      {
        id: 'q2',
        prompt: 'Which TS utility extracts return types of function signatures?',
        points: 5,
        options: [
          { id: 'opt4', label: 'ReturnType<T>', isCorrect: true },
          { id: 'opt5', label: 'Parameters<T>', isCorrect: false },
        ]
      }
    ]
  );

  assessmentService.createAssignment(
    course1.id,
    'Implement a Strictly-Typed Event Bus',
    'Build an event bus in TypeScript that maps event names to payloads with zero type assertions.',
    100
  );

  console.log('Studyo LMS Database Seeded Successfully!');
}

if (require.main === module) {
  seedLMS();
}
