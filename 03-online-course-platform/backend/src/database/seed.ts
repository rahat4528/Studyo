import { AuthService } from '../services/auth.service';
import { SchoolService } from '../services/school.service';
import { CourseService } from '../services/course.service';
import { db } from './db';
import { Course, CourseModule, Lesson, Coupon } from '../types';

export async function seedCourseDatabase() {
  db.clear();

  // 1. Seed Users
  const creatorUser = await AuthService.register('sarah@craftacademy.local', 'Password123!', 'Sarah Connor');
  const studentUser1 = await AuthService.register('student.jordan@studyo-course.local', 'Password123!', 'Jordan Bell');
  const studentUser2 = await AuthService.register('student.morgan@studyo-course.local', 'Password123!', 'Morgan Reed');

  // 2. Seed School 1: Fullstack Academy (Slug: fullstack-academy)
  const school1 = SchoolService.createSchool(
    creatorUser.user.id,
    'fullstack-academy',
    'Fullstack Craft Academy',
    {
      primaryColor: '#4f46e5',
      accentColor: '#06b6d4'
    },
    {
      heroTitle: 'Master Fullstack Software Engineering',
      heroSubtitle: 'Build production-ready microservices and real-time distributed applications.'
    }
  );

  // Seed School 2: Design Mastery Lab (Slug: design-mastery) for cross-tenant testing
  const school2 = SchoolService.createSchool(
    creatorUser.user.id,
    'design-mastery',
    'Design Mastery Lab',
    {
      primaryColor: '#ec4899',
      accentColor: '#f59e0b'
    }
  );

  // 3. Courses in School 1
  const course1 = CourseService.createCourse(school1.id, creatorUser.user.id, {
    title: 'Advanced Microservices Architecture',
    slug: 'advanced-microservices',
    description: 'Master event-driven microservices with Redis queues, PostgreSQL partitioning, and Docker.',
    priceType: 'ONE_TIME',
    priceMinor: 4900, // $49.00
    currency: 'USD',
    isPublished: true
  });

  // Lessons inside Course 1 with Drip schedules:
  // Lesson 1: Immediate & Preview
  const lesson1: Lesson = {
    id: 'les-micro-1',
    moduleId: 'mod-1',
    title: 'System Decomposition & Domain-Driven Design',
    content: 'Comprehensive architectural guide to bounding contexts.',
    videoMediaKey: 'videos/microservices/intro-ddd.mp4',
    durationSeconds: 1200,
    isPreview: true, // Free preview
    dripType: 'IMMEDIATE',
    dripDays: 0,
    orderIndex: 0
  };

  // Lesson 2: Drip locked for 7 days post-enrollment
  const lesson2: Lesson = {
    id: 'les-micro-2',
    moduleId: 'mod-1',
    title: 'Distributed Transactions & Outbox Pattern',
    content: 'Ensuring consistency without distributed locks.',
    videoMediaKey: 'videos/microservices/outbox-pattern.mp4',
    durationSeconds: 1800,
    isPreview: false,
    dripType: 'DAYS_AFTER_ENROLLMENT',
    dripDays: 7, // Locked for 7 days
    orderIndex: 1
  };

  const module1: CourseModule = {
    id: 'mod-1',
    courseId: course1.id,
    title: 'Module 1: Architecture & Data Integrity',
    orderIndex: 0,
    lessons: [lesson1, lesson2]
  };
  course1.modules = [module1];
  db.courses.set(course1.id, course1);

  // 4. Coupons in School 1
  const coupon20: Coupon = {
    id: 'cpn-save20',
    schoolId: school1.id,
    code: 'SAVE20',
    discountPercent: 20.0, // 20% off
    maxRedemptions: 50,
    timesRedeemed: 0,
    applicableCourseId: course1.id
  };
  db.coupons.set(coupon20.id, coupon20);

  return {
    users: { creatorUser, studentUser1, studentUser2 },
    schools: { school1, school2 },
    courses: { course1 },
    lessons: { lesson1, lesson2 },
    coupons: { coupon20 }
  };
}
