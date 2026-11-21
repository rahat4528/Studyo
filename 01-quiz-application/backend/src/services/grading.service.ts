import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db';
import { QuizAttempt, GradeRevision } from '../types';
import { AttemptService } from './attempt.service';
import { ScoringEngine } from '../scoring/scoring.engine';

export class GradingService {
  /**
   * Manually grades an essay answer and transitions attempt to FINALIZED if all items are graded
   */
  public static gradeEssay(
    attemptId: string,
    questionId: string,
    pointsAwarded: number,
    feedback: string,
    graderId: string
  ): QuizAttempt {
    const attempt = db.attempts.get(attemptId);
    if (!attempt) {
      throw new Error('Attempt not found');
    }

    const question = db.questions.get(questionId);
    if (!question || question.type !== 'ESSAY') {
      throw new Error('Target question is not an essay');
    }

    if (pointsAwarded < 0 || pointsAwarded > question.points) {
      throw new Error(`Score must be between 0 and maximum points (${question.points})`);
    }

    let answer = attempt.answers[questionId];
    if (!answer) {
      answer = {
        id: uuidv4(),
        attemptId,
        questionId,
        pointsAwarded: 0,
        isAutoGraded: false,
        isManuallyGraded: true,
        version: 1,
        updatedAt: new Date().toISOString()
      };
      attempt.answers[questionId] = answer;
    }

    const previousPoints = answer.pointsAwarded || 0;
    answer.pointsAwarded = pointsAwarded;
    answer.isManuallyGraded = true;
    answer.feedback = feedback;
    answer.updatedAt = new Date().toISOString();

    // Check if any other essay remains ungraded
    let allEssaysGraded = true;
    for (const qId of attempt.orderedQuestionIds) {
      const q = db.questions.get(qId);
      if (q && q.type === 'ESSAY') {
        const a = attempt.answers[qId];
        if (!a || !a.isManuallyGraded) {
          allEssaysGraded = false;
          break;
        }
      }
    }

    const quiz = db.quizzes.get(attempt.quizId);
    if (quiz) {
      AttemptService.evaluateAttempt(attempt, quiz);
      if (allEssaysGraded) {
        attempt.status = 'FINALIZED';
      }
    }

    // Record revision if score was altered
    if (previousPoints !== pointsAwarded) {
      const revision: GradeRevision = {
        id: uuidv4(),
        attemptId,
        changedById: graderId,
        previousScore: previousPoints,
        newScore: pointsAwarded,
        reason: `Manual essay grading: ${feedback || 'Scored according to rubric'}`.trim(),
        createdAt: new Date().toISOString()
      };
      db.gradeRevisions.set(revision.id, revision);
    }

    db.attempts.set(attempt.id, attempt);
    return attempt;
  }

  /**
   * Recalculates all finalized/submitted attempts for a quiz after an answer key or point correction
   */
  public static regradeQuiz(quizId: string, changedById: string, reason: string): { regradedCount: number } {
    const quiz = db.quizzes.get(quizId);
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    let regradedCount = 0;
    for (const attempt of db.attempts.values()) {
      if (attempt.quizId === quizId && (attempt.status === 'FINALIZED' || attempt.status === 'AUTO_GRADED')) {
        const previousScore = attempt.totalPointsEarned;

        // Re-evaluate
        AttemptService.evaluateAttempt(attempt, quiz);

        if (previousScore !== attempt.totalPointsEarned) {
          const revision: GradeRevision = {
            id: uuidv4(),
            attemptId: attempt.id,
            changedById,
            previousScore,
            newScore: attempt.totalPointsEarned,
            reason: reason || 'Quiz answer key correction regrade',
            createdAt: new Date().toISOString()
          };
          db.gradeRevisions.set(revision.id, revision);
          regradedCount++;
        }
      }
    }

    return { regradedCount };
  }

  /**
   * Retrieves audit revisions for an attempt
   */
  public static getRevisions(attemptId: string): GradeRevision[] {
    const revisions: GradeRevision[] = [];
    for (const rev of db.gradeRevisions.values()) {
      if (rev.attemptId === attemptId) {
        revisions.push(rev);
      }
    }
    return revisions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}
