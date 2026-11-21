export type Role = 'STUDENT' | 'AUTHOR' | 'ADMINISTRATOR';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type Verdict =
  | 'PENDING'
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'TIME_LIMIT_EXCEEDED'
  | 'MEMORY_LIMIT_EXCEEDED'
  | 'RUNTIME_ERROR'
  | 'COMPILATION_ERROR'
  | 'OUTPUT_LIMIT_EXCEEDED';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: Role;
  xp: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate?: string; // YYYY-MM-DD
  createdAt: string;
}

export interface Track {
  id: string;
  title: string;
  slug: string;
  description: string;
  orderIndex: number;
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  trackId: string;
  title: string;
  orderIndex: number;
  challenges: Challenge[];
}

export interface TestCase {
  id: string;
  challengeId: string;
  input: string;
  expected: string;
  isPublic: boolean;
  orderIndex: number;
}

export interface Hint {
  id: string;
  challengeId: string;
  content: string;
  orderIndex: number;
  xpCost: number;
}

export interface Challenge {
  id: string;
  chapterId: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  xpReward: number;
  description: string;
  starterCode: Record<string, string>; // language -> template
  solutionCode?: Record<string, string>;
  timeLimitMs: number;
  memoryLimitMb: number;
  orderIndex: number;
  testCases: TestCase[];
  hints: Hint[];
}

export interface Submission {
  id: string;
  challengeId: string;
  userId: string;
  language: string;
  code: string;
  verdict: Verdict;
  executionTimeMs?: number;
  memoryUsedBytes?: number;
  passedTests: number;
  totalTests: number;
  errorMessage?: string;
  stdout?: string;
  createdAt: string;
}

export interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  xpBonus: number;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  awardedAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  count: number;
}

export interface Certificate {
  id: string;
  userId: string;
  trackId: string;
  verificationCode: string;
  recipientName: string;
  trackTitle: string;
  issuedAt: string;
}

export interface VisualizerTraceFrame {
  step: number;
  array: number[];
  pointers: Record<string, number>;
  description: string;
}
