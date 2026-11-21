import {
  User, School, SchoolMember, Course, Enrollment, Coupon, Purchase, Certificate, CourseReview
} from '../types';

export class CoursePlatformDatabase {
  public users: Map<string, User> = new Map();
  public schools: Map<string, School> = new Map();
  public members: Map<string, SchoolMember> = new Map();
  public courses: Map<string, Course> = new Map();
  public enrollments: Map<string, Enrollment> = new Map();
  public coupons: Map<string, Coupon> = new Map();
  public purchases: Map<string, Purchase> = new Map();
  public certificates: Map<string, Certificate> = new Map();
  public reviews: Map<string, CourseReview> = new Map();
  public processedWebhooks: Set<string> = new Set();

  private static instance: CoursePlatformDatabase;

  public static getInstance(): CoursePlatformDatabase {
    if (!CoursePlatformDatabase.instance) {
      CoursePlatformDatabase.instance = new CoursePlatformDatabase();
    }
    return CoursePlatformDatabase.instance;
  }

  public clear(): void {
    this.users.clear();
    this.schools.clear();
    this.members.clear();
    this.courses.clear();
    this.enrollments.clear();
    this.coupons.clear();
    this.purchases.clear();
    this.certificates.clear();
    this.reviews.clear();
    this.processedWebhooks.clear();
  }
}

export const db = CoursePlatformDatabase.getInstance();
