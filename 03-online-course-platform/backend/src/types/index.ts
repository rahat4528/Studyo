export type SchoolRole = 'OWNER' | 'ADMIN' | 'INSTRUCTOR' | 'ASSISTANT' | 'STUDENT';

export type DripType = 'IMMEDIATE' | 'DAYS_AFTER_ENROLLMENT' | 'SPECIFIC_DATE';

export type PriceType = 'FREE' | 'ONE_TIME' | 'SUBSCRIPTION';

export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED';

export type RefundStatus = 'REQUESTED' | 'APPROVED' | 'DENIED' | 'REFUNDED';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  createdAt: string;
}

export interface SchoolTheme {
  primaryColor: string;
  accentColor: string;
  logoUrl?: string;
  bannerUrl?: string;
}

export interface LandingPageBlock {
  type: 'HERO' | 'TEXT' | 'GRID' | 'FAQ' | 'CTA';
  title?: string;
  content?: string;
  items?: { question?: string; answer?: string; title?: string; text?: string }[];
}

export interface LandingPage {
  heroTitle: string;
  heroSubtitle: string;
  blocks: LandingPageBlock[];
}

export interface School {
  id: string;
  slug: string;
  name: string;
  ownerId: string;
  customDomain?: string;
  theme: SchoolTheme;
  landingPage: LandingPage;
  createdAt: string;
}

export interface SchoolMember {
  id: string;
  schoolId: string;
  userId: string;
  role: SchoolRole;
  joinedAt: string;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  content?: string;
  videoMediaKey?: string;
  durationSeconds: number;
  isPreview: boolean;
  dripType: DripType;
  dripDays: number;
  dripDate?: string;
  orderIndex: number;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  orderIndex: number;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  schoolId: string;
  title: string;
  slug: string;
  description?: string;
  priceType: PriceType;
  priceMinor: number; // In cents (e.g. 4900 = $49.00)
  currency: string;
  isPublished: boolean;
  modules: CourseModule[];
}

export interface CourseProgress {
  id: string;
  enrollmentId: string;
  lessonId: string;
  isCompleted: boolean;
  lastPositionSec: number;
  updatedAt: string;
}

export interface Enrollment {
  id: string;
  schoolId: string;
  courseId: string;
  userId: string;
  enrolledAt: string;
  subscriptionStatus?: SubscriptionStatus;
  progress: Record<string, CourseProgress>;
}

export interface Coupon {
  id: string;
  schoolId: string;
  code: string;
  discountPercent?: number; // e.g. 20 for 20%
  discountMinor?: number;   // e.g. 1000 for $10.00
  maxRedemptions: number;
  timesRedeemed: number;
  expiresAt?: string;
  applicableCourseId?: string;
}

export interface Purchase {
  id: string;
  schoolId: string;
  userId: string;
  courseId: string;
  couponId?: string;
  grossMinor: number;
  discountMinor: number;
  netMinor: number;
  currency: string;
  paymentProvider: string;
  paymentIntentId: string;
  refundStatus?: RefundStatus;
  createdAt: string;
}

export interface Certificate {
  id: string;
  enrollmentId: string;
  schoolId: string;
  courseId: string;
  userId: string;
  recipientName: string;
  courseTitle: string;
  schoolName: string;
  verificationCode: string;
  issuedAt: string;
}

export interface CourseReview {
  id: string;
  schoolId: string;
  courseId: string;
  userId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: string;
}
