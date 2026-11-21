export type Role = 'STUDENT' | 'INSTRUCTOR' | 'ADMINISTRATOR';

export type CourseStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'PUBLISHED'
  | 'UNPUBLISHED';

export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export type RefundStatus = 'REQUESTED' | 'APPROVED' | 'DENIED' | 'REFUNDED';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: Role;
  createdAt: string;
}

export interface InstructorProfile {
  id: string;
  userId: string;
  title: string;
  bio?: string;
  verificationStatus: VerificationStatus;
  verificationDocs?: string;
}

export interface CourseCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Lesson {
  id: string;
  sectionId: string;
  title: string;
  content?: string;
  videoMediaKey?: string;
  durationSeconds: number;
  isPreview: boolean;
  orderIndex: number;
}

export interface CourseSection {
  id: string;
  courseId: string;
  title: string;
  orderIndex: number;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  instructorId: string;
  categoryId: string;
  title: string;
  slug: string;
  subtitle?: string;
  description: string;
  priceMinor: number; // in cents (e.g. 1999 = $19.99)
  currency: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT' | 'ALL_LEVELS';
  status: CourseStatus;
  thumbnailUrl?: string;
  ratingAverage: number;
  ratingCount: number;
  enrollmentCount: number;
  sections: CourseSection[];
}

export interface LessonProgress {
  id: string;
  enrollmentId: string;
  lessonId: string;
  isCompleted: boolean;
  lastPositionSec: number;
  updatedAt: string;
}

export interface Enrollment {
  id: string;
  courseId: string;
  userId: string;
  enrolledAt: string;
  isRefunded: boolean;
  progress: Record<string, LessonProgress>;
}

export interface CartItem {
  id: string;
  cartId: string;
  courseId: string;
  addedAt: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
}

export interface Coupon {
  id: string;
  code: string;
  courseId?: string;
  discountPercent?: number;
  discountMinor?: number;
  maxUses: number;
  usedCount: number;
  expiresAt?: string;
}

export interface PromotionCampaign {
  id: string;
  name: string;
  code: string;
  discountPercent: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

export interface Purchase {
  id: string;
  userId: string;
  totalGrossMinor: number;
  discountMinor: number;
  totalNetMinor: number;
  currency: string;
  paymentIntentId: string;
  refundStatus?: RefundStatus;
  refundReason?: string;
  courseIds: string[];
  createdAt: string;
}

export interface CourseAssignment {
  id: string;
  courseId: string;
  title: string;
  instructions: string;
  maxMarks: number;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  userId: string;
  content: string;
  marksAwarded?: number;
  feedback?: string;
  isGraded: boolean;
  submittedAt: string;
}

export interface QuizQuestionOption {
  id: string;
  label: string;
  isCorrect: boolean;
}

export interface CourseQuizQuestion {
  id: string;
  prompt: string;
  options: QuizQuestionOption[];
  points: number;
}

export interface CourseQuiz {
  id: string;
  courseId: string;
  title: string;
  passPercent: number;
  questions: CourseQuizQuestion[];
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  scorePercent: number;
  passed: boolean;
  createdAt: string;
}

export interface DiscussionPost {
  id: string;
  threadId: string;
  userId: string;
  authorName: string;
  content: string;
  isAnswer: boolean;
  createdAt: string;
}

export interface DiscussionThread {
  id: string;
  courseId: string;
  userId: string;
  authorName: string;
  title: string;
  content: string;
  upvotes: number;
  isResolved: boolean;
  posts: DiscussionPost[];
  createdAt: string;
}

export interface LessonNote {
  id: string;
  courseId: string;
  lessonId: string;
  userId: string;
  timestampSec: number;
  text: string;
  createdAt: string;
}

export interface CourseReview {
  id: string;
  courseId: string;
  userId: string;
  authorName: string;
  rating: number; // 1 to 5
  content?: string;
  createdAt: string;
}

export interface Certificate {
  id: string;
  enrollmentId: string;
  courseId: string;
  userId: string;
  recipientName: string;
  courseTitle: string;
  verificationCode: string;
  issuedAt: string;
}
