import { User, Question, Quiz, QuizAttempt, AttemptAnswer, GradeRevision, Certificate } from '../types';

export class InMemoryDatabase {
  public users: Map<string, User> = new Map();
  public categories: Map<string, { id: string; name: string; description?: string }> = new Map();
  public questions: Map<string, Question> = new Map();
  public quizzes: Map<string, Quiz> = new Map();
  public attempts: Map<string, QuizAttempt> = new Map();
  public gradeRevisions: Map<string, GradeRevision> = new Map();
  public certificates: Map<string, Certificate> = new Map();
  public questionPools: Map<string, { id: string; name: string; questionIds: string[] }> = new Map();
  public classGroups: Map<string, { id: string; name: string; studentIds: string[] }> = new Map();

  private static instance: InMemoryDatabase;

  public static getInstance(): InMemoryDatabase {
    if (!InMemoryDatabase.instance) {
      InMemoryDatabase.instance = new InMemoryDatabase();
    }
    return InMemoryDatabase.instance;
  }

  public clear(): void {
    this.users.clear();
    this.categories.clear();
    this.questions.clear();
    this.quizzes.clear();
    this.attempts.clear();
    this.gradeRevisions.clear();
    this.certificates.clear();
    this.questionPools.clear();
    this.classGroups.clear();
  }
}

export const db = InMemoryDatabase.getInstance();
