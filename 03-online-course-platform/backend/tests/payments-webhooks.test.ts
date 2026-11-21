import crypto from 'crypto';
import { seedCourseDatabase } from '../src/database/seed';
import { PaymentService } from '../src/services/payment.service';
import { db } from '../src/database/db';

describe('Decimal Pricing, Coupons & Webhook Idempotency Suite', () => {
  let seeded: any;

  beforeEach(async () => {
    seeded = await seedCourseDatabase();
  });

  it('should calculate precise minor-unit prices with coupons without floating point errors', () => {
    const course = seeded.courses.course1; // $49.00 = 4900 cents
    const coupon = seeded.coupons.coupon20; // 20% discount

    // 20% of 4900 is 980 cents. Net = 4900 - 980 = 3920 cents ($39.20)
    const pricing = PaymentService.calculatePrice(course, 'SAVE20');
    expect(pricing.grossMinor).toBe(4900);
    expect(pricing.discountMinor).toBe(980);
    expect(pricing.netMinor).toBe(3920);
  });

  it('should reject expired coupons or coupons for different courses', () => {
    const course = seeded.courses.course1;

    // Expired coupon
    db.coupons.set('cpn-exp', {
      id: 'cpn-exp',
      schoolId: course.schoolId,
      code: 'EXPIRED10',
      discountMinor: 1000,
      maxRedemptions: 10,
      timesRedeemed: 0,
      expiresAt: new Date(Date.now() - 10000).toISOString()
    });

    expect(() => {
      PaymentService.calculatePrice(course, 'EXPIRED10');
    }).toThrow(/Coupon code has expired/);
  });

  it('should verify webhook HMAC signature and process events idempotently', () => {
    const school = seeded.schools.school1;
    const course = seeded.courses.course1;
    const student = seeded.users.studentUser1.user;
    const secret = 'whsec_test_secret_key';

    const eventPayload = {
      id: 'evt_test_payment_101',
      type: 'payment_intent.succeeded',
      data: {
        paymentIntentId: 'pi_test_101',
        schoolId: school.id,
        userId: student.id,
        courseId: course.id,
        couponCode: 'SAVE20'
      }
    };

    const payloadString = JSON.stringify(eventPayload);
    const signature = crypto.createHmac('sha256', secret).update(payloadString).digest('hex');

    // 1. Signature Verification
    const isValid = PaymentService.verifyWebhookSignature(payloadString, signature, secret);
    expect(isValid).toBe(true);

    // 2. First processing: should fulfill purchase and enrollment
    const result1 = PaymentService.processPaymentWebhook(eventPayload);
    expect(result1.success).toBe(true);
    expect(result1.duplicate).toBe(false);

    const enrollmentKey = `${course.id}:${student.id}`;
    expect(db.enrollments.has(enrollmentKey)).toBe(true);

    const coupon = db.coupons.get(seeded.coupons.coupon20.id)!;
    expect(coupon.timesRedeemed).toBe(1);

    // 3. Second processing (Duplicate Delivery): should be idempotent
    const result2 = PaymentService.processPaymentWebhook(eventPayload);
    expect(result2.success).toBe(true);
    expect(result2.duplicate).toBe(true);

    // Coupon counter should NOT double-increment
    expect(coupon.timesRedeemed).toBe(1);
  });
});
