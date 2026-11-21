import { seedCourseDatabase } from '../src/database/seed';
import { CourseService } from '../src/services/course.service';
import { db } from '../src/database/db';
import { Enrollment } from '../src/types';

describe('Drip Curriculum & Signed Media Access Suite', () => {
  let seeded: any;

  beforeEach(async () => {
    seeded = await seedCourseDatabase();
  });

  it('should allow public access to preview lessons without enrollment', () => {
    const school1 = seeded.schools.school1;
    const previewLesson = seeded.lessons.lesson1; // isPreview = true
    const nonEnrolledUserId = seeded.users.studentUser2.user.id;

    const result = CourseService.getLessonAccess(previewLesson.id, nonEnrolledUserId, school1.id);
    expect(result.isPreview).toBe(true);
    expect(result.signedVideoUrl).toContain('/media/stream/');
  });

  it('should block non-enrolled students from accessing paid non-preview lessons', () => {
    const school1 = seeded.schools.school1;
    const paidLesson = seeded.lessons.lesson2; // isPreview = false
    const nonEnrolledUserId = seeded.users.studentUser2.user.id;

    expect(() => {
      CourseService.getLessonAccess(paidLesson.id, nonEnrolledUserId, school1.id);
    }).toThrow(/You must be enrolled in this course/);
  });

  it('should enforce server drip schedule and block access before drip interval elapses', () => {
    const school1 = seeded.schools.school1;
    const course1 = seeded.courses.course1;
    const dripLesson = seeded.lessons.lesson2; // dripDays = 7
    const student = seeded.users.studentUser1.user;

    // Enroll student today
    const enrollment: Enrollment = {
      id: 'enr-drip-1',
      schoolId: school1.id,
      courseId: course1.id,
      userId: student.id,
      enrolledAt: new Date().toISOString(), // Today
      progress: {}
    };
    db.enrollments.set(`${course1.id}:${student.id}`, enrollment);

    // Attempting to access 7-day drip lesson on day 0 must fail
    expect(() => {
      CourseService.getLessonAccess(dripLesson.id, student.id, school1.id);
    }).toThrow(/Lesson locked under drip schedule/);

    // Simulate 8 days elapsed since enrollment
    const pastDate = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
    enrollment.enrolledAt = pastDate;
    db.enrollments.set(`${course1.id}:${student.id}`, enrollment);

    // Now access and signed video token generation should succeed
    const access = CourseService.getLessonAccess(dripLesson.id, student.id, school1.id);
    expect(access.lesson.id).toBe(dripLesson.id);
    expect(access.signedVideoUrl).toBeDefined();
    expect(access.signedVideoUrl).toContain('signature=');
  });
});
