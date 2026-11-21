import { seedCourseDatabase } from '../src/database/seed';
import { ProgressService } from '../src/services/progress.service';
import { db } from '../src/database/db';
import { Enrollment } from '../src/types';

describe('Progress Tracking & Verified Certificate Suite', () => {
  let seeded: any;

  beforeEach(async () => {
    seeded = await seedCourseDatabase();
  });

  it('should idempotently save lesson progress and playback positions', () => {
    const course = seeded.courses.course1;
    const student = seeded.users.studentUser1.user;
    const lesson = seeded.lessons.lesson1;

    const enrollment: Enrollment = {
      id: 'enr-prog-1',
      schoolId: course.schoolId,
      courseId: course.id,
      userId: student.id,
      enrolledAt: new Date().toISOString(),
      progress: {}
    };
    db.enrollments.set(`${course.id}:${student.id}`, enrollment);

    // Update 1: at 120s
    ProgressService.saveLessonProgress(course.id, student.id, lesson.id, false, 120);
    expect(enrollment.progress[lesson.id].lastPositionSec).toBe(120);
    expect(enrollment.progress[lesson.id].isCompleted).toBe(false);

    // Update 2: completed at 1200s
    ProgressService.saveLessonProgress(course.id, student.id, lesson.id, true, 1200);
    expect(enrollment.progress[lesson.id].lastPositionSec).toBe(1200);
    expect(enrollment.progress[lesson.id].isCompleted).toBe(true);
  });

  it('should block certificate issuance if not all course lessons are completed', () => {
    const course = seeded.courses.course1; // 2 lessons: lesson1 & lesson2
    const student = seeded.users.studentUser1.user;
    const lesson1 = seeded.lessons.lesson1;

    const enrollment: Enrollment = {
      id: 'enr-cert-1',
      schoolId: course.schoolId,
      courseId: course.id,
      userId: student.id,
      enrolledAt: new Date().toISOString(),
      progress: {
        [lesson1.id]: {
          id: 'p1',
          enrollmentId: 'enr-cert-1',
          lessonId: lesson1.id,
          isCompleted: true,
          lastPositionSec: 1200,
          updatedAt: ''
        }
        // Lesson 2 is uncompleted!
      }
    };
    db.enrollments.set(`${course.id}:${student.id}`, enrollment);

    expect(() => {
      ProgressService.issueCertificate(course.id, student.id);
    }).toThrow(/Completion criteria not met: 1 of 2 lessons completed/);
  });

  it('should issue and publicly verify certificate when 100% of lessons are completed', () => {
    const course = seeded.courses.course1;
    const student = seeded.users.studentUser1.user;
    const lesson1 = seeded.lessons.lesson1;
    const lesson2 = seeded.lessons.lesson2;

    const enrollment: Enrollment = {
      id: 'enr-cert-2',
      schoolId: course.schoolId,
      courseId: course.id,
      userId: student.id,
      enrolledAt: new Date().toISOString(),
      progress: {
        [lesson1.id]: { id: 'p1', enrollmentId: 'enr-cert-2', lessonId: lesson1.id, isCompleted: true, lastPositionSec: 1200, updatedAt: '' },
        [lesson2.id]: { id: 'p2', enrollmentId: 'enr-cert-2', lessonId: lesson2.id, isCompleted: true, lastPositionSec: 1800, updatedAt: '' }
      }
    };
    db.enrollments.set(`${course.id}:${student.id}`, enrollment);

    const cert = ProgressService.issueCertificate(course.id, student.id);
    expect(cert.verificationCode).toMatch(/^CERT-ACADEMY-[A-Z0-9]{8}$/);
    expect(cert.recipientName).toBe(student.fullName);

    // Public verification
    const verified = ProgressService.verifyCertificate(cert.verificationCode);
    expect(verified.isValid).toBe(true);
    expect(verified.certificate?.recipientName).toBe(student.fullName);
    expect(verified.certificate?.courseTitle).toBe(course.title);
    expect(verified.certificate?.status).toBe('AUTHENTIC');
  });
});
