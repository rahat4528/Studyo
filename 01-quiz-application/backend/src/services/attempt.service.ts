import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db';
import { QuizAttempt, AttemptAnswer, Question, Quiz } from '../types';
import { QuizService } from './quiz.service';
import { ScoringEngine } from '../scoring/scoring.engine';
import { SeededRandom } from '../utils/random';

export class AttemptService {
  private static startLocks: Set<string> = new Set();

  /**
   * Starts a new attempt with transactional concurrency guard against maxAttempts
   */
  public static async startAttempt(quizId: string, userId: string): Promise<any> {
    const lockKey = `${quizId}:${userId}`;
    if (this.startLocks.has(lockKey)) {
      throw new Error('Concurrent attempt initialization in progress. Please wait.');
    }
    this.startLocks.add(lockKey);

    try {
      const quiz = db.quizzes.get(quizId);
      if (!quiz) {
        throw new Error('Quiz not found');
      }

      if (!quiz.isPublished) {
        throw new Error('This quiz is not currently published');
      }

      const now = new Date();
      if (quiz.startsAt && new Date(quiz.startsAt) > now) {
        throw new Error('Quiz assessment window has not started yet');
      }
      if (quiz.endsAt && new Date(quiz.endsAt) < now) {
        throw new Error('Quiz assessment window has closed');
      }

      // Find existing attempts for user
      const userAttempts: QuizAttempt[] = [];
      for (const att of db.attempts.values()) {
        if (att.quizId === quizId && att.userId === userId) {
          userAttempts.push(att);
        }
      }

      // Check if there is an in-progress attempt that hasn't expired
      const active = userAttempts.find(a => a.status === 'IN_PROGRESS');
      if (active) {
        const deadline = new Date(active.deadline);
        if (now <= deadline) {
          // Return the active attempt cleanly
          return this.serializeAttemptForStudent(active, quiz);
        } else {
          // Attempt expired, auto-submit it
          this.autoSubmitExpiredAttempt(active);
        }
      }

      // Check max attempts limit (if not practice mode)
      if (!quiz.isPractice && quiz.maxAttempts > 0) {
        const finishedCount = userAttempts.filter(a => a.status !== 'IN_PROGRESS' || new Date(a.deadline) < now).length;
        if (finishedCount >= quiz.maxAttempts) {
          throw new Error(`Maximum attempt limit (${quiz.maxAttempts}) reached for this quiz`);
        }
      }

      const attemptNumber = userAttempts.length + 1;
      const startedAt = now.toISOString();
      const durationMs = quiz.timeLimitMinutes > 0 ? quiz.timeLimitMinutes * 60 * 1000 : 24 * 60 * 60 * 1000;
      const deadline = new Date(now.getTime() + durationMs).toISOString();
      const randomSeed = Math.floor(Math.random() * 1000000);

      // Order questions: apply seed-based deterministic shuffle if randomized
      let orderedIds = [...quiz.questionIds];
      if (quiz.randomizeQuestions) {
        const rng = new SeededRandom(randomSeed);
        orderedIds = rng.shuffle(orderedIds);
      }

      const attempt: QuizAttempt = {
        id: uuidv4(),
        quizId,
        userId,
        attemptNumber,
        status: 'IN_PROGRESS',
        randomSeed,
        startedAt,
        deadline,
        totalPointsEarned: 0,
        totalPointsPossible: 0,
        scorePercentage: 0,
        passed: false,
        orderedQuestionIds: orderedIds,
        answers: {}
      };

      db.attempts.set(attempt.id, attempt);
      return this.serializeAttemptForStudent(attempt, quiz);
    } finally {
      this.startLocks.delete(lockKey);
    }
  }

  /**
   * Autosaves a student's answer idempotently with version tracking
   */
  public static saveAnswer(
    attemptId: string,
    userId: string,
    questionId: string,
    answerPayload: Partial<AttemptAnswer>,
    version: number
  ): AttemptAnswer {
    const attempt = db.attempts.get(attemptId);
    if (!attempt) {
      throw new Error('Attempt not found');
    }

    if (attempt.userId !== userId) {
      throw new Error('Unauthorized access to this attempt');
    }

    if (attempt.status !== 'IN_PROGRESS') {
      throw new Error(`Cannot save answers on an attempt in state: ${attempt.status}`);
    }

    // Server-enforced timer: allow 5 seconds latency window past deadline
    const now = Date.now();
    const deadlineTime = new Date(attempt.deadline).getTime();
    if (now > deadlineTime + 5000) {
      this.autoSubmitExpiredAttempt(attempt);
      throw new Error('Assessment deadline has expired. Your attempt has been submitted.');
    }

    const existingAnswer = attempt.answers[questionId];
    if (existingAnswer && existingAnswer.version > version) {
      // Stale autosave payload ignored
      return existingAnswer;
    }

    const updatedAnswer: AttemptAnswer = {
      id: existingAnswer?.id || uuidv4(),
      attemptId,
      questionId,
      selectedOptionIds: answerPayload.selectedOptionIds,
      textAnswer: answerPayload.textAnswer,
      blankAnswers: answerPayload.blankAnswers,
      matchedPairs: answerPayload.matchedPairs,
      pointsAwarded: existingAnswer?.pointsAwarded || 0,
      isAutoGraded: false,
      isManuallyGraded: existingAnswer?.isManuallyGraded || false,
      version: version || (existingAnswer ? existingAnswer.version + 1 : 1),
      updatedAt: new Date().toISOString()
    };

    attempt.answers[questionId] = updatedAnswer;
    db.attempts.set(attemptId, attempt);
    return updatedAnswer;
  }

  /**
   * Submits an attempt and executes the scoring engine
   */
  public static submitAttempt(attemptId: string, userId: string): QuizAttempt {
    const attempt = db.attempts.get(attemptId);
    if (!attempt) {
      throw new Error('Attempt not found');
    }

    if (attempt.userId !== userId) {
      throw new Error('Unauthorized attempt submission');
    }

    if (attempt.status !== 'IN_PROGRESS') {
      throw new Error(`Attempt cannot be submitted because it is already in state: ${attempt.status}`);
    }

    const quiz = db.quizzes.get(attempt.quizId);
    if (!quiz) {
      throw new Error('Quiz configuration missing');
    }

    const now = Date.now();
    const deadlineTime = new Date(attempt.deadline).getTime();
    const isLate = now > deadlineTime + 5000;

    attempt.status = isLate ? 'EXPIRED' : 'SUBMITTED';
    attempt.submittedAt = new Date().toISOString();

    // Grade attempt
    this.evaluateAttempt(attempt, quiz);
    db.attempts.set(attempt.id, attempt);
    return attempt;
  }

  /**
   * Evaluates all questions in an attempt
   */
  public static evaluateAttempt(attempt: QuizAttempt, quiz: Quiz): void {
    let totalEarned = 0;
    let totalPossible = 0;
    let hasUngradedEssays = false;

    for (const qId of attempt.orderedQuestionIds) {
      const question = db.questions.get(qId);
      if (!question) continue;

      totalPossible += question.points;
      const answer = attempt.answers[qId];

      const result = ScoringEngine.gradeAnswer(question, answer, quiz);
      if (result.needsManualGrading) {
        hasUngradedEssays = true;
      } else {
        if (answer) {
          answer.pointsAwarded = result.pointsAwarded;
          answer.isAutoGraded = true;
          totalEarned += result.pointsAwarded;
        } else {
          // If unattempted and penalty applies
          totalEarned += result.pointsAwarded;
        }
      }
    }

    const { finalPoints, percentage } = ScoringEngine.calculateTotalScore(
      totalEarned,
      totalPossible,
      quiz.zeroScoreFloor
    );

    attempt.totalPointsEarned = finalPoints;
    attempt.totalPointsPossible = totalPossible;
    attempt.scorePercentage = percentage;
    attempt.passed = percentage >= quiz.passScorePercentage;

    if (attempt.status === 'EXPIRED') {
      // Keep EXPIRED status for late/expired submissions
    } else if (hasUngradedEssays) {
      attempt.status = 'PENDING_MANUAL';
    } else {
      attempt.status = 'FINALIZED';
    }
  }

  public static autoSubmitExpiredAttempt(attempt: QuizAttempt): void {
    if (attempt.status !== 'IN_PROGRESS') return;
    const quiz = db.quizzes.get(attempt.quizId);
    if (!quiz) return;

    attempt.status = 'EXPIRED';
    attempt.submittedAt = new Date().toISOString();
    this.evaluateAttempt(attempt, quiz);
    db.attempts.set(attempt.id, attempt);
  }

  /**
   * Serializes an attempt for a student: strictly hides correct answer keys and explanations
   */
  public static serializeAttemptForStudent(attempt: QuizAttempt, quiz: Quiz): any {
    const questions = attempt.orderedQuestionIds.map((qId, index) => {
      const q = db.questions.get(qId);
      if (!q) return null;
      return QuizService.sanitizeQuestionForStudent(q, attempt.randomSeed, index);
    }).filter(Boolean);

    // If finalized and quiz release policy allows, can reveal score and answers
    const canViewResults = this.canStudentViewResults(attempt, quiz);

    return {
      id: attempt.id,
      quizId: attempt.quizId,
      quizTitle: quiz.title,
      attemptNumber: attempt.attemptNumber,
      status: attempt.status,
      startedAt: attempt.startedAt,
      deadline: attempt.deadline,
      submittedAt: attempt.submittedAt,
      questions,
      answers: attempt.answers,
      isPractice: quiz.isPractice,
      timeLimitMinutes: quiz.timeLimitMinutes,
      canViewResults,
      results: canViewResults ? {
        totalPointsEarned: attempt.totalPointsEarned,
        totalPointsPossible: attempt.totalPointsPossible,
        scorePercentage: attempt.scorePercentage,
        passed: attempt.passed,
        showCorrectAnswers: quiz.showCorrectAnswers
      } : null
    };
  }

  public static canStudentViewResults(attempt: QuizAttempt, quiz: Quiz): boolean {
    if (attempt.status !== 'FINALIZED' && attempt.status !== 'AUTO_GRADED') {
      return false;
    }
    if (quiz.isPractice) return true;

    if (quiz.releasePolicy === 'IMMEDIATE') {
      return true;
    }
    if (quiz.releasePolicy === 'AFTER_CLOSE_DATE' && quiz.endsAt) {
      return new Date() >= new Date(quiz.endsAt);
    }
    return false;
  }
}
