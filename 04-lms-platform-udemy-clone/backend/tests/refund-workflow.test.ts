import { db } from '../src/database/db';
import { catalogService } from '../src/services/catalog.service';
import { cartService } from '../src/services/cart.service';
import { authService } from '../src/services/auth.service';
import { contentService } from '../src/services/content.service';

describe('LMS 30-Day Refund Workflow & Access Revocation', () => {
  let userId: string;
  let adminId: string;
  let courseId: string;
  let purchaseId: string;

  beforeEach(() => {
    db.clear();

    const user = authService.register('student@test.local', 'Pass123!', 'Student', 'STUDENT');
    userId = user.id;

    const admin = authService.register('admin@test.local', 'Pass123!', 'Admin', 'ADMINISTRATOR');
    adminId = admin.id;

    const cat = catalogService.createCategory('Cloud', 'cloud');
    const course = catalogService.createCourse(
      'inst-1',
      cat.id,
      'AWS Solutions Architect',
      'aws-architect',
      'Pass the exam',
      9900,
      'USD',
      'INTERMEDIATE'
    );
    courseId = course.id;

    const sec = catalogService.addSection(courseId, 'Section 1', 'inst-1', 'INSTRUCTOR');
    catalogService.addLesson(courseId, sec.id, 'Lesson 1', 'Content', 'video.mp4', 600, false, 'inst-1', 'INSTRUCTOR');

    // Add to cart & checkout
    cartService.addToCart(userId, courseId);
    const checkoutResult = cartService.checkout(userId);
    purchaseId = checkoutResult.purchase.id;
  });

  test('Student initiates refund request within policy', () => {
    const updatedPurchase = cartService.requestRefund(purchaseId, userId, 'Not satisfied with the course pacing');
    expect(updatedPurchase.refundStatus).toBe('REQUESTED');
    expect(updatedPurchase.refundReason).toBe('Not satisfied with the course pacing');
  });

  test('Non-purchaser cannot request refund', () => {
    expect(() => {
      cartService.requestRefund(purchaseId, 'other-user', 'Fraud attempt');
    }).toThrow('Purchase not found');
  });

  test('Admin approves refund: marks REFUNDED and revokes course enrollments', () => {
    cartService.requestRefund(purchaseId, userId, 'Accidental purchase');

    const processed = cartService.processRefund(purchaseId, true, 'ADMINISTRATOR');
    expect(processed.refundStatus).toBe('REFUNDED');

    // Check enrollments are marked isRefunded = true
    const enrollments = Array.from(db.enrollments.values()).filter(e => e.userId === userId && e.courseId === courseId);
    expect(enrollments.length).toBe(1);
    expect(enrollments[0].isRefunded).toBe(true);

    // Verify student is no longer enrolled
    expect(contentService.isEnrolled(courseId, userId)).toBe(false);
  });

  test('Admin denies refund: purchase status set to DENIED and enrollment remains active', () => {
    cartService.requestRefund(purchaseId, userId, 'Completed 100% course then asked for money back');

    const processed = cartService.processRefund(purchaseId, false, 'ADMINISTRATOR');
    expect(processed.refundStatus).toBe('DENIED');

    expect(contentService.isEnrolled(courseId, userId)).toBe(true);
  });

  test('Non-administrator cannot process refunds', () => {
    cartService.requestRefund(purchaseId, userId, 'Reason');

    expect(() => {
      cartService.processRefund(purchaseId, true, 'STUDENT');
    }).toThrow('Unauthorized: Only administrators can process refunds');
  });
});
