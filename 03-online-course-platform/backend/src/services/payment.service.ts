import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db';
import { Course, Coupon, Purchase, Enrollment } from '../types';

export class PaymentService {
  private static couponLocks: Set<string> = new Set();

  /**
   * Computes purchase price using minor units (integer cents) to prevent floating point inaccuracies
   */
  public static calculatePrice(
    course: Course,
    couponCode?: string
  ): { grossMinor: number; discountMinor: number; netMinor: number; coupon?: Coupon } {
    const grossMinor = course.priceMinor;
    if (!couponCode) {
      return { grossMinor, discountMinor: 0, netMinor: grossMinor };
    }

    const normCode = couponCode.trim().toUpperCase();
    let coupon: Coupon | undefined;

    for (const cp of db.coupons.values()) {
      if (cp.schoolId === course.schoolId && cp.code.toUpperCase() === normCode) {
        coupon = cp;
        break;
      }
    }

    if (!coupon) {
      throw new Error('Invalid coupon code');
    }

    if (coupon.applicableCourseId && coupon.applicableCourseId !== course.id) {
      throw new Error('Coupon is not valid for this course');
    }

    if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
      throw new Error('Coupon code has expired');
    }

    if (coupon.timesRedeemed >= coupon.maxRedemptions) {
      throw new Error('Coupon redemption limit reached');
    }

    let discountMinor = 0;
    if (coupon.discountPercent) {
      discountMinor = Math.round((grossMinor * coupon.discountPercent) / 100);
    } else if (coupon.discountMinor) {
      discountMinor = coupon.discountMinor;
    }

    discountMinor = Math.min(grossMinor, discountMinor);
    const netMinor = Math.max(0, grossMinor - discountMinor);

    return { grossMinor, discountMinor, netMinor, coupon };
  }

  /**
   * Verifies HMAC SHA-256 webhook signatures
   */
  public static verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  }

  /**
   * Idempotently processes payment provider webhooks
   */
  public static processPaymentWebhook(event: {
    id: string;
    type: string;
    data: {
      paymentIntentId: string;
      schoolId: string;
      userId: string;
      courseId: string;
      couponCode?: string;
    };
  }): { success: boolean; duplicate: boolean } {
    if (db.processedWebhooks.has(event.id)) {
      return { success: true, duplicate: true }; // Idempotent acknowledgment
    }
    db.processedWebhooks.add(event.id);

    if (event.type === 'payment_intent.succeeded') {
      const { schoolId, userId, courseId, couponCode, paymentIntentId } = event.data;
      const course = db.courses.get(courseId);
      if (!course) throw new Error('Course not found');

      const pricing = this.calculatePrice(course, couponCode);

      // Record Purchase
      const purchase: Purchase = {
        id: uuidv4(),
        schoolId,
        userId,
        courseId,
        couponId: pricing.coupon?.id,
        grossMinor: pricing.grossMinor,
        discountMinor: pricing.discountMinor,
        netMinor: pricing.netMinor,
        currency: course.currency,
        paymentProvider: 'SANDBOX_PROVIDER',
        paymentIntentId,
        createdAt: new Date().toISOString()
      };
      db.purchases.set(purchase.id, purchase);

      // Increment coupon counter
      if (pricing.coupon) {
        pricing.coupon.timesRedeemed += 1;
        db.coupons.set(pricing.coupon.id, pricing.coupon);
      }

      // Fulfill enrollment
      const enrollmentKey = `${courseId}:${userId}`;
      const enrollment: Enrollment = {
        id: uuidv4(),
        schoolId,
        courseId,
        userId,
        enrolledAt: new Date().toISOString(),
        subscriptionStatus: course.priceType === 'SUBSCRIPTION' ? 'ACTIVE' : undefined,
        progress: {}
      };
      db.enrollments.set(enrollmentKey, enrollment);
    }

    return { success: true, duplicate: false };
  }

  /**
   * Processes a refund and revokes course access
   */
  public static processRefund(purchaseId: string, reason: string): Purchase {
    const purchase = db.purchases.get(purchaseId);
    if (!purchase) {
      throw new Error('Purchase record not found');
    }

    if (purchase.refundStatus === 'REFUNDED') {
      throw new Error('Purchase is already refunded');
    }

    purchase.refundStatus = 'REFUNDED';
    db.purchases.set(purchase.id, purchase);

    // Revoke enrollment access
    const enrollmentKey = `${purchase.courseId}:${purchase.userId}`;
    db.enrollments.delete(enrollmentKey);

    return purchase;
  }
}
