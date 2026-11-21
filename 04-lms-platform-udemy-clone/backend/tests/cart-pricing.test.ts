import { db } from '../src/database/db';
import { catalogService } from '../src/services/catalog.service';
import { cartService } from '../src/services/cart.service';
import { authService } from '../src/services/auth.service';

describe('LMS Cart, Coupon & Promotion Pricing Engine', () => {
  let userId: string;
  let course1Id: string;
  let course2Id: string;

  beforeEach(() => {
    db.clear();
    const user = authService.register('buyer@test.local', 'Pass123!', 'Buyer', 'STUDENT');
    userId = user.id;

    const cat = catalogService.createCategory('Development', 'dev');

    const c1 = catalogService.createCourse(
      'inst-1',
      cat.id,
      'React Architecture',
      'react-arch',
      'Advanced React',
      3000, // $30.00
      'USD',
      'INTERMEDIATE'
    );
    course1Id = c1.id;

    const c2 = catalogService.createCourse(
      'inst-2',
      cat.id,
      'PostgreSQL Mastery',
      'pg-mastery',
      'Database internals',
      2000, // $20.00
      'USD',
      'EXPERT'
    );
    course2Id = c2.id;
  });

  test('Calculates multi-course cart total accurately in minor units', () => {
    cartService.addToCart(userId, course1Id);
    cartService.addToCart(userId, course2Id);

    const pricing = cartService.calculatePricing(userId);
    expect(pricing.subtotalMinor).toBe(5000); // 3000 + 2000 = $50.00
    expect(pricing.discountMinor).toBe(0);
    expect(pricing.totalMinor).toBe(5000);
  });

  test('Applies percentage coupon code to cart', () => {
    cartService.addToCart(userId, course1Id);
    cartService.addToCart(userId, course2Id);

    cartService.createCoupon('SAVE50', 50, undefined, 100);

    const pricing = cartService.calculatePricing(userId, 'SAVE50');
    expect(pricing.subtotalMinor).toBe(5000);
    expect(pricing.discountMinor).toBe(2500); // 50% of 5000
    expect(pricing.totalMinor).toBe(2500);
  });

  test('Applies course-specific fixed discount coupon', () => {
    cartService.addToCart(userId, course1Id);
    cartService.addToCart(userId, course2Id);

    // $10 off course 1 only
    cartService.createCoupon('TENOFF', undefined, 1000, 10, course1Id);

    const pricing = cartService.calculatePricing(userId, 'TENOFF');
    expect(pricing.subtotalMinor).toBe(5000);
    expect(pricing.discountMinor).toBe(1000);
    expect(pricing.totalMinor).toBe(4000);
  });

  test('Applies site-wide promotional campaign discount', () => {
    cartService.addToCart(userId, course1Id);

    cartService.createCampaign(
      'Black Friday',
      'BF2026',
      30, // 30% off
      '2026-01-01T00:00:00Z',
      '2026-12-31T23:59:59Z'
    );

    const pricing = cartService.calculatePricing(userId, undefined, 'BF2026');
    expect(pricing.subtotalMinor).toBe(3000);
    expect(pricing.discountMinor).toBe(900); // 30% of 3000 = 900
    expect(pricing.totalMinor).toBe(2100);
  });

  test('Expired coupon is rejected', () => {
    cartService.addToCart(userId, course1Id);

    cartService.createCoupon('EXPIRED', 50, undefined, 10, undefined, '2020-01-01T00:00:00Z');

    expect(() => {
      cartService.calculatePricing(userId, 'EXPIRED');
    }).toThrow('Coupon code EXPIRED has expired');
  });

  test('Exhausted coupon maxUses is rejected', () => {
    cartService.addToCart(userId, course1Id);

    const coupon = cartService.createCoupon('ONEUSE', 50, undefined, 1);
    coupon.usedCount = 1;

    expect(() => {
      cartService.calculatePricing(userId, 'ONEUSE');
    }).toThrow('Coupon code ONEUSE has reached its maximum usage limit');
  });
});
