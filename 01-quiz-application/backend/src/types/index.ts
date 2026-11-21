export type Role = 'STUDENT' | 'TEACHER' | 'ADMIN';

export type QuestionType =
  | 'MULTIPLE_CHOICE'
  | 'MULTIPLE_SELECT'
  | 'TRUE_FALSE'
  | 'SHORT_ANSWER'
  | 'FILL_IN_THE_BLANKS'
  | 'MATCHING'
  | 'ESSAY';

export type AttemptStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'AUTO_GRADED'
  | 'PENDING_MANUAL'
  | 'FINALIZED'
  | 'EXPIRED';

export type ReleasePolicy = 'IMMEDIATE' | 'AFTER_CLOSE_DATE' | 'NEVER';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: Role;
  createdAt: string;
}

export interface QuestionOption {
  id: string;
  questionId: string;
  label: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface MatchingPair {
  prompt: string;
  response: string;
}

export interface RubricCriterion {
  id: string;
  title: string;
  maxPoints: number;
  description?: string;
}

export interface Question {
  id: string;
  categoryId: string;
  createdById: string;
  title: string;
  prompt: string;
  type: QuestionType;
  points: number;
  penalty: number;
  explanation?: string;
  options: QuestionOption[];
  acceptedAnswers?: string[];
  blankAnswers?: Record<string, string[]>;
  matchingPairs?: MatchingPair[];
  rubricCriteria?: RubricCriterion[];
  toleranceDelta?: number;
  poolId?: string;
}

export interface Quiz {
  id: string;
  title: string;
  slug: string;
  description?: string;
  categoryId: string;
  createdById: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  timeLimitMinutes: number;
  maxAttempts: number;
  passScorePercentage: number;
  isPractice: boolean;
  isPublished: boolean;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  enableNegativeMarks: boolean;
  negativeMarkPenalty: number;
  zeroScoreFloor: boolean;
  releasePolicy: ReleasePolicy;
  showCorrectAnswers: boolean;
  startsAt?: string;
  endsAt?: string;
  questionIds: string[];
}

export interface AttemptAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  selectedOptionIds?: string[];
  textAnswer?: string;
  blankAnswers?: Record<string, string>;
  matchedPairs?: Record<string, string>;
  pointsAwarded: number;
  isAutoGraded: boolean;
  isManuallyGraded: boolean;
  feedback?: string;
  version: number;
  updatedAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  attemptNumber: number;
  status: AttemptStatus;
  randomSeed: number;
  startedAt: string;
  deadline: string;
  submittedAt?: string;
  totalPointsEarned: number;
  totalPointsPossible: number;
  scorePercentage: number;
  passed: boolean;
  orderedQuestionIds: string[];
  answers: Record<string, AttemptAnswer>;
}

export interface GradeRevision {
  id: string;
  attemptId: string;
  changedById: string;
  previousScore: number;
  newScore: number;
  reason: string;
  createdAt: string;
}

export interface Certificate {
  id: string;
  attemptId: string;
  userId: string;
  recipientName: string;
  quizTitle: string;
  scorePercentage: number;
  verificationCode: string;
  issuedAt: string;
  isRevoked: boolean;
  revokedReason?: string;
}
