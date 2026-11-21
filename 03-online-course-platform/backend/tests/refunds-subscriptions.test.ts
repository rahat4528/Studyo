import { seedCourseDatabase } from '../src/database/seed';
import { PaymentService } from '../src/services/payment.service';
import { CourseService } from '../src/services/course.service';
import { db } from '../src/database/db';
import { Enrollment, Purchase } from '../src/types';

describe('Refunds & Subscription Lifecycle Suite', () => {
  let seeded: any;

  beforeEach(async () => {
    seeded = await seedCourseDatabase();
  });

  it('should process refunds and revoke student enrollment access', () => {
    const school = seeded.schools.school1;
    const course = seeded.courses.course1;
    const student = seeded.users.studentUser1.user;

    // Simulate purchase
    const purchase: Purchase = {
      id: 'pur-101',
      schoolId: school.id,
      userId: student.id,
      courseId: course.id,
      grossMinor: 4900,
      discountMinor: 0,
      netMinor: 4900,
      currency: 'USD',
      paymentProvider: 'SANDBOX',
      paymentIntentId: 'pi-101',
      createdAt: new Date().toISOString()
    };
    db.purchases.set(purchase.id, purchase);

    // Active enrollment
    const enrollmentKey = `${course.id}:${student.id}`;
    db.enrollments.set(enrollmentKey, {
      id: 'enr-101',
      schoolId: school.id,
      courseId: course.id,
      userId: student.id,
      enrolledAt: new Date().toISOString(),
      progress: {}
    });

    expect(db.enrollments.has(enrollmentKey)).toBe(true);

    // Execute Refund
    PaymentService.processRefund(purchase.id, 'Requested within 30-day money-back window');

    expect(purchase.refundStatus).toBe('REFUNDED');
    expect(db.enrollments.has(enrollmentKey)).toBe(false); // Enrollment access revoked
  });

  it('should dynamically revoke lesson access when subscription status becomes CANCELED or EXPIRED', () => {
    const school = seeded.schools.school1;
    const course = seeded.courses.course1;
    const lesson = seeded.lessons.lesson1; // preview or standard
    const paidLesson = seeded.lessons.lesson2;
    const student = seeded.users.studentUser1.user;

    const enrollmentKey = `${course.id}:${student.id}`;
    const enrollment: Enrollment = {
      id: 'enr-sub-1',
      schoolId: school.id,
      courseId: course.id,
      userId: student.id,
      enrolledAt: new Date(Date.now() - 10 * 86400 * 1000).toISOString(),
      subscriptionStatus: 'ACTIVE',
      progress: {}
    };
    db.enrollments.set(enrollmentKey, enrollment);

    // Active subscription: has access
    const activeAccess = CourseService.getLessonAccess(paidLesson.id, student.id, school.id);
    expect(activeAccess.lesson.id).toBe(paidLesson.id);

    // Subscription becomes CANCELED
    enrollment.subscriptionStatus = 'CANCELED';
    db.enrollments.set(enrollmentKey, enrollment);

    expect(() => {
      CourseService.getLessonAccess(paidLesson.id, student.id, school.id);
    }).toThrow(/Course subscription is CANCELED/);
  });
});
