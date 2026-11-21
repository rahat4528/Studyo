import { db } from '../database/db';
import { QuizAttempt } from '../types';

export interface QuestionAnalytics {
  questionId: string;
  title: string;
  type: string;
  difficultyIndex: number; // % correct (0.0 to 1.0)
  discriminationIndex: number; // difference in success between top 27% and bottom 27%
  totalResponses: number;
}

export interface QuizAnalytics {
  quizId: string;
  title: string;
  totalAttempts: number;
  passRatePercentage: number;
  averageScorePercentage: number;
  scoreDistribution: {
    range0_20: number;
    range21_40: number;
    range41_60: number;
    range61_80: number;
    range81_100: number;
  };
  questions: QuestionAnalytics[];
}

export class AnalyticsService {
  public static getQuizAnalytics(quizId: string): QuizAnalytics {
    const quiz = db.quizzes.get(quizId);
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    const attempts: QuizAttempt[] = [];
    for (const att of db.attempts.values()) {
      if (att.quizId === quizId && (att.status === 'FINALIZED' || att.status === 'AUTO_GRADED')) {
        attempts.push(att);
      }
    }

    const distribution = {
      range0_20: 0,
      range21_40: 0,
      range41_60: 0,
      range61_80: 0,
      range81_100: 0
    };

    let totalScore = 0;
    let passedCount = 0;

    for (const att of attempts) {
      const pct = att.scorePercentage;
      totalScore += pct;
      if (att.passed) passedCount++;

      if (pct <= 20) distribution.range0_20++;
      else if (pct <= 40) distribution.range21_40++;
      else if (pct <= 60) distribution.range41_60++;
      else if (pct <= 80) distribution.range61_80++;
      else distribution.range81_100++;
    }

    // Sort attempts by score for discrimination calculation
    const sortedAttempts = [...attempts].sort((a, b) => b.scorePercentage - a.scorePercentage);
    const splitSize = Math.max(1, Math.floor(sortedAttempts.length * 0.27));
    const topGroup = sortedAttempts.slice(0, splitSize);
    const bottomGroup = sortedAttempts.slice(-splitSize);

    const questionAnalyticsList: QuestionAnalytics[] = quiz.questionIds.map(qId => {
      const q = db.questions.get(qId);
      if (!q) {
        return {
          questionId: qId,
          title: 'Unknown',
          type: 'UNKNOWN',
          difficultyIndex: 0,
          discriminationIndex: 0,
          totalResponses: 0
        };
      }

      let correctCount = 0;
      let totalResponses = 0;

      for (const att of attempts) {
        const ans = att.answers[qId];
        if (ans) {
          totalResponses++;
          if (ans.pointsAwarded >= q.points) {
            correctCount++;
          }
        }
      }

      const pValue = totalResponses > 0 ? Math.round((correctCount / totalResponses) * 100) / 100 : 0;

      // Discrimination index
      let topCorrect = 0;
      let bottomCorrect = 0;
      for (const tAtt of topGroup) {
        if (tAtt.answers[qId] && tAtt.answers[qId].pointsAwarded >= q.points) topCorrect++;
      }
      for (const bAtt of bottomGroup) {
        if (bAtt.answers[qId] && bAtt.answers[qId].pointsAwarded >= q.points) bottomCorrect++;
      }

      const topRatio = topGroup.length > 0 ? topCorrect / topGroup.length : 0;
      const bottomRatio = bottomGroup.length > 0 ? bottomCorrect / bottomGroup.length : 0;
      const discrimination = Math.round((topRatio - bottomRatio) * 100) / 100;

      return {
        questionId: qId,
        title: q.title,
        type: q.type,
        difficultyIndex: pValue,
        discriminationIndex: discrimination,
        totalResponses
      };
    });

    return {
      quizId,
      title: quiz.title,
      totalAttempts: attempts.length,
      passRatePercentage: attempts.length > 0 ? Math.round((passedCount / attempts.length) * 10000) / 100 : 0,
      averageScorePercentage: attempts.length > 0 ? Math.round((totalScore / attempts.length) * 100) / 100 : 0,
      scoreDistribution: distribution,
      questions: questionAnalyticsList
    };
  }
}
