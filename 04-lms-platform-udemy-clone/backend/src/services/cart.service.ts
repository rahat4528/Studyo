import { randomUUID } from 'crypto';
import { db } from '../database/db';
import { Cart, CartItem, Coupon, PromotionCampaign, Purchase, Role } from '../types';
import { contentService } from './content.service';

export interface PricingSummary {
  subtotalMinor: number;
  discountMinor: number;
  totalMinor: number;
  currency: string;
  appliedCoupon?: Coupon;
  appliedCampaign?: PromotionCampaign;
}

export class CartService {
  public getOrCreateCart(userId: string): Cart {
    let cart = Array.from(db.carts.values()).find(c => c.userId === userId);
    if (!cart) {
      cart = {
        id: randomUUID(),
        userId,
        items: [],
      };
      db.carts.set(cart.id, cart);
    }
    return cart;
  }

  public addToCart(userId: string, courseId: string): Cart {
    const course = db.courses.get(courseId);
    if (!course) throw new Error('Course not found');

    const cart = this.getOrCreateCart(userId);
    const existing = cart.items.find(i => i.courseId === courseId);
    if (!existing) {
      const item: CartItem = {
        id: randomUUID(),
        cartId: cart.id,
        courseId,
        addedAt: new Date().toISOString(),
      };
      cart.items.push(item);
    }
    return cart;
  }

  public removeFromCart(userId: string, courseId: string): Cart {
    const cart = this.getOrCreateCart(userId);
    cart.items = cart.items.filter(i => i.courseId !== courseId);
    return cart;
  }

  public createCoupon(
    code: string,
    discountPercent?: number,
    discountMinor?: number,
    maxUses: number = 100,
    courseId?: string,
    expiresAt?: string
  ): Coupon {
    const coupon: Coupon = {
      id: randomUUID(),
      code: code.toUpperCase(),
      discountPercent,
      discountMinor,
      maxUses,
      usedCount: 0,
      courseId,
      expiresAt,
    };
    db.coupons.set(coupon.id, coupon);
    return coupon;
  }

  public createCampaign(
    name: string,
    code: string,
    discountPercent: number,
    startsAt: string,
    endsAt: string
  ): PromotionCampaign {
    const campaign: PromotionCampaign = {
      id: randomUUID(),
      name,
      code: code.toUpperCase(),
      discountPercent,
      startsAt,
      endsAt,
      isActive: true,
    };
    db.campaigns.set(campaign.id, campaign);
    return campaign;
  }

  public calculatePricing(
    userId: string,
    couponCode?: string,
    campaignCode?: string
  ): PricingSummary {
    const cart = this.getOrCreateCart(userId);
    if (cart.items.length === 0) {
      return {
        subtotalMinor: 0,
        discountMinor: 0,
        totalMinor: 0,
        currency: 'USD',
      };
    }

    let subtotalMinor = 0;
    const courses = cart.items.map(item => {
      const course = db.courses.get(item.courseId);
      if (!course) throw new Error(`Course ${item.courseId} not found`);
      subtotalMinor += course.priceMinor;
      return course;
    });

    let discountMinor = 0;
    let appliedCoupon: Coupon | undefined;
    let appliedCampaign: PromotionCampaign | undefined;

    // Apply Coupon
    if (couponCode) {
      const coupon = Array.from(db.coupons.values()).find(c => c.code === couponCode.toUpperCase());
      if (!coupon) throw new Error(`Invalid coupon code: ${couponCode}`);

      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        throw new Error(`Coupon code ${couponCode} has expired`);
      }

      if (coupon.usedCount >= coupon.maxUses) {
        throw new Error(`Coupon code ${couponCode} has reached its maximum usage limit`);
      }

      appliedCoupon = coupon;

      if (coupon.courseId) {
        const targetCourse = courses.find(c => c.id === coupon.courseId);
        if (targetCourse) {
          if (coupon.discountMinor) {
            discountMinor += Math.min(coupon.discountMinor, targetCourse.priceMinor);
          } else if (coupon.discountPercent) {
            discountMinor += Math.round((targetCourse.priceMinor * coupon.discountPercent) / 100);
          }
        }
      } else {
        if (coupon.discountPercent) {
          discountMinor += Math.round((subtotalMinor * coupon.discountPercent) / 100);
        } else if (coupon.discountMinor) {
          discountMinor += Math.min(coupon.discountMinor, subtotalMinor);
        }
      }
    }

    // Apply Campaign
    if (campaignCode) {
      const campaign = Array.from(db.campaigns.values()).find(
        c => c.code === campaignCode.toUpperCase() && c.isActive
      );
      if (!campaign) throw new Error(`Invalid campaign code: ${campaignCode}`);

      const now = new Date();
      if (now < new Date(campaign.startsAt) || now > new Date(campaign.endsAt)) {
        throw new Error(`Campaign ${campaignCode} is not currently active`);
      }

      appliedCampaign = campaign;
      const campaignDiscount = Math.round((subtotalMinor * campaign.discountPercent) / 100);
      discountMinor += campaignDiscount;
    }

    // Total cannot be less than 0
    discountMinor = Math.min(discountMinor, subtotalMinor);
    const totalMinor = subtotalMinor - discountMinor;

    return {
      subtotalMinor,
      discountMinor,
      totalMinor,
      currency: 'USD',
      appliedCoupon,
      appliedCampaign,
    };
  }

  public checkout(
    userId: string,
    couponCode?: string,
    campaignCode?: string
  ): { purchase: Purchase; enrolledCourses: string[] } {
    const cart = this.getOrCreateCart(userId);
    if (cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    const pricing = this.calculatePricing(userId, couponCode, campaignCode);
    const courseIds = cart.items.map(i => i.courseId);

    const purchase: Purchase = {
      id: randomUUID(),
      userId,
      totalGrossMinor: pricing.subtotalMinor,
      discountMinor: pricing.discountMinor,
      totalNetMinor: pricing.totalMinor,
      currency: pricing.currency,
      paymentIntentId: `pi_test_${randomUUID().substring(0, 12)}`,
      courseIds,
      createdAt: new Date().toISOString(),
    };
    db.purchases.set(purchase.id, purchase);

    if (pricing.appliedCoupon) {
      pricing.appliedCoupon.usedCount += 1;
    }

    // Enroll student in all courses
    for (const cId of courseIds) {
      contentService.enrollStudent(cId, userId);
    }

    // Clear cart
    cart.items = [];

    return { purchase, enrolledCourses: courseIds };
  }

  public requestRefund(purchaseId: string, userId: string, reason: string): Purchase {
    const purchase = db.purchases.get(purchaseId);
    if (!purchase || purchase.userId !== userId) {
      throw new Error('Purchase not found');
    }

    // 30-day refund window check
    const purchaseDate = new Date(purchase.createdAt);
    const diffDays = (Date.now() - purchaseDate.getTime()) / (1000 * 3600 * 24);
    if (diffDays > 30) {
      throw new Error('Refund policy expired: 30-day window has passed');
    }

    purchase.refundStatus = 'REQUESTED';
    purchase.refundReason = reason;
    return purchase;
  }

  public processRefund(purchaseId: string, approve: boolean, adminRole: Role): Purchase {
    if (adminRole !== 'ADMINISTRATOR') {
      throw new Error('Unauthorized: Only administrators can process refunds');
    }

    const purchase = db.purchases.get(purchaseId);
    if (!purchase) throw new Error('Purchase not found');

    if (approve) {
      purchase.refundStatus = 'REFUNDED';
      // Revoke enrollments
      for (const courseId of purchase.courseIds) {
        const enrollment = Array.from(db.enrollments.values()).find(
          e => e.courseId === courseId && e.userId === purchase.userId
        );
        if (enrollment) {
          enrollment.isRefunded = true;
        }
      }
    } else {
      purchase.refundStatus = 'DENIED';
    }

    return purchase;
  }
}

export const cartService = new CartService();
