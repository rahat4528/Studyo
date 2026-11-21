import {
  User, InstructorProfile, CourseCategory, Course, Enrollment, Cart, Coupon,
  PromotionCampaign, Purchase, CourseAssignment, AssignmentSubmission, CourseQuiz,
  QuizAttempt, DiscussionThread, LessonNote, CourseReview, Certificate
} from '../types';

export class LMSDatabase {
  public users: Map<string, User> = new Map();
  public instructors: Map<string, InstructorProfile> = new Map();
  public categories: Map<string, CourseCategory> = new Map();
  public courses: Map<string, Course> = new Map();
  public enrollments: Map<string, Enrollment> = new Map();
  public carts: Map<string, Cart> = new Map();
  public coupons: Map<string, Coupon> = new Map();
  public campaigns: Map<string, PromotionCampaign> = new Map();
  public purchases: Map<string, Purchase> = new Map();
  public assignments: Map<string, CourseAssignment> = new Map();
  public submissions: Map<string, AssignmentSubmission> = new Map();
  public quizzes: Map<string, CourseQuiz> = new Map();
  public quizAttempts: Map<string, QuizAttempt> = new Map();
  public discussions: Map<string, DiscussionThread> = new Map();
  public notes: Map<string, LessonNote> = new Map();
  public reviews: Map<string, CourseReview> = new Map();
  public certificates: Map<string, Certificate> = new Map();

  private static instance: LMSDatabase;

  public static getInstance(): LMSDatabase {
    if (!LMSDatabase.instance) {
      LMSDatabase.instance = new LMSDatabase();
    }
    return LMSDatabase.instance;
  }

  public clear(): void {
    this.users.clear();
    this.instructors.clear();
    this.categories.clear();
    this.courses.clear();
    this.enrollments.clear();
    this.carts.clear();
    this.coupons.clear();
    this.campaigns.clear();
    this.purchases.clear();
    this.assignments.clear();
    this.submissions.clear();
    this.quizzes.clear();
    this.quizAttempts.clear();
    this.discussions.clear();
    this.notes.clear();
    this.reviews.clear();
    this.certificates.clear();
  }
}

export const db = LMSDatabase.getInstance();
