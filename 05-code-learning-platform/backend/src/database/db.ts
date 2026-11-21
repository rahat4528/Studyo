import {
  User, Track, Chapter, Challenge, TestCase, Hint, Submission,
  Badge, UserBadge, ActivityLog, Certificate
} from '../types';

export class CodeLearningDatabase {
  public users: Map<string, User> = new Map();
  public tracks: Map<string, Track> = new Map();
  public chapters: Map<string, Chapter> = new Map();
  public challenges: Map<string, Challenge> = new Map();
  public testCases: Map<string, TestCase> = new Map();
  public hints: Map<string, Hint> = new Map();
  public submissions: Map<string, Submission> = new Map();
  public badges: Map<string, Badge> = new Map();
  public userBadges: Map<string, UserBadge> = new Map();
  public activityLogs: Map<string, ActivityLog> = new Map();
  public certificates: Map<string, Certificate> = new Map();

  private static instance: CodeLearningDatabase;

  public static getInstance(): CodeLearningDatabase {
    if (!CodeLearningDatabase.instance) {
      CodeLearningDatabase.instance = new CodeLearningDatabase();
    }
    return CodeLearningDatabase.instance;
  }

  public clear(): void {
    this.users.clear();
    this.tracks.clear();
    this.chapters.clear();
    this.challenges.clear();
    this.testCases.clear();
    this.hints.clear();
    this.submissions.clear();
    this.badges.clear();
    this.userBadges.clear();
    this.activityLogs.clear();
    this.certificates.clear();
  }
}

export const db = CodeLearningDatabase.getInstance();
