import { seedCourseDatabase } from '../src/database/seed';
import { SchoolService } from '../src/services/school.service';
import { CourseService } from '../src/services/course.service';
import { db } from '../src/database/db';

describe('Multi-Tenant Boundary & School Role Isolation Suite', () => {
  let seeded: any;

  beforeEach(async () => {
    seeded = await seedCourseDatabase();
  });

  it('should enforce strict tenant scoping and prevent cross-school course/lesson access', () => {
    const school1 = seeded.schools.school1; // fullstack-academy
    const school2 = seeded.schools.school2; // design-mastery
    const course1 = seeded.courses.course1; // belongs to school1
    const lesson1 = seeded.lessons.lesson1;

    // Accessing lesson through correct school domain succeeds
    const access = CourseService.getLessonAccess(lesson1.id, seeded.users.studentUser1.user.id, school1.id);
    expect(access.lesson.id).toBe(lesson1.id);

    // Attempting to access school1 lesson through school2 domain must be rejected
    expect(() => {
      CourseService.getLessonAccess(lesson1.id, seeded.users.studentUser1.user.id, school2.id);
    }).toThrow(/Lesson not found within the specified school domain/);
  });

  it('should allow a user to hold different independent roles in different schools', () => {
    const user = seeded.users.studentUser1.user;
    const school1 = seeded.schools.school1;
    const school2 = seeded.schools.school2;

    // Student in School 1
    SchoolService.addMember(school1.id, user.id, 'STUDENT');
    // Instructor in School 2
    SchoolService.addMember(school2.id, user.id, 'INSTRUCTOR');

    expect(SchoolService.getMemberRole(school1.id, user.id)).toBe('STUDENT');
    expect(SchoolService.getMemberRole(school2.id, user.id)).toBe('INSTRUCTOR');
  });

  it('should sanitize school names and landing pages against XSS injection', () => {
    const creator = seeded.users.creatorUser.user;
    const maliciousHtml = 'Safe Title <script>alert("XSS")</script>';

    const school = SchoolService.createSchool(
      creator.id,
      'security-academy',
      maliciousHtml,
      {},
      { heroTitle: maliciousHtml }
    );

    expect(school.name).not.toContain('<script>');
    expect(school.landingPage.heroTitle).not.toContain('<script>');
    expect(school.name).toBe('Safe Title ');
  });
});
