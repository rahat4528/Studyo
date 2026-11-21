import { Question, AttemptAnswer, Quiz } from '../types';

export interface ScoringResult {
  pointsAwarded: number;
  maxPoints: number;
  isCorrect: boolean;
  isPartial: boolean;
  feedback?: string;
  needsManualGrading: boolean;
}

export class ScoringEngine {
  /**
   * Normalizes text for lenient text comparison
   */
  public static normalizeText(input?: string): string {
    if (!input) return '';
    return input
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove diacritics
      .replace(/\s+/g, ' '); // collapse whitespace
  }

  /**
   * Evaluates if a student response matches an accepted answer, with optional numeric delta
   */
  public static matchesAnswer(
    studentValue: string,
    acceptedAnswers: string[],
    toleranceDelta?: number
  ): boolean {
    const normStudent = this.normalizeText(studentValue);
    const studentNum = parseFloat(normStudent);

    for (const accepted of acceptedAnswers) {
      const normAccepted = this.normalizeText(accepted);
      if (normStudent === normAccepted) {
        return true;
      }
      if (toleranceDelta !== undefined && !isNaN(studentNum)) {
        const acceptedNum = parseFloat(normAccepted);
        if (!isNaN(acceptedNum) && Math.abs(studentNum - acceptedNum) <= toleranceDelta) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Evaluates an individual question answer based on its question type and quiz penalty rules
   */
  public static gradeAnswer(
    question: Question,
    answer: AttemptAnswer | undefined,
    quiz?: Partial<Quiz>
  ): ScoringResult {
    const maxPoints = question.points;
    const penaltyRate = quiz?.enableNegativeMarks
      ? (question.penalty > 0 ? question.penalty : (quiz.negativeMarkPenalty || 0))
      : 0;

    if (!answer) {
      return {
        pointsAwarded: 0,
        maxPoints,
        isCorrect: false,
        isPartial: false,
        needsManualGrading: question.type === 'ESSAY'
      };
    }

    switch (question.type) {
      case 'MULTIPLE_CHOICE':
      case 'TRUE_FALSE': {
        const selectedId = answer.selectedOptionIds?.[0];
        const correctOption = question.options.find(o => o.isCorrect);

        if (selectedId && correctOption && selectedId === correctOption.id) {
          return { pointsAwarded: maxPoints, maxPoints, isCorrect: true, isPartial: false, needsManualGrading: false };
        } else if (selectedId) {
          const points = penaltyRate > 0 ? -penaltyRate : 0;
          return { pointsAwarded: points, maxPoints, isCorrect: false, isPartial: false, needsManualGrading: false };
        }
        return { pointsAwarded: 0, maxPoints, isCorrect: false, isPartial: false, needsManualGrading: false };
      }

      case 'MULTIPLE_SELECT': {
        const selected = new Set(answer.selectedOptionIds || []);
        const correctSet = new Set(question.options.filter(o => o.isCorrect).map(o => o.id));
        const incorrectSet = new Set(question.options.filter(o => !o.isCorrect).map(o => o.id));

        if (selected.size === 0) {
          return { pointsAwarded: 0, maxPoints, isCorrect: false, isPartial: false, needsManualGrading: false };
        }

        let correctSelected = 0;
        let incorrectSelected = 0;

        for (const id of selected) {
          if (correctSet.has(id)) correctSelected++;
          if (incorrectSet.has(id)) incorrectSelected++;
        }

        // Exact match
        if (correctSelected === correctSet.size && incorrectSelected === 0) {
          return { pointsAwarded: maxPoints, maxPoints, isCorrect: true, isPartial: false, needsManualGrading: false };
        }

        // Partial credit calculation with penalty for wrong choices
        const pointsPerCorrect = correctSet.size > 0 ? maxPoints / correctSet.size : 0;
        const penaltyPerWrong = incorrectSet.size > 0 ? maxPoints / incorrectSet.size : 0;
        let earned = (correctSelected * pointsPerCorrect) - (incorrectSelected * penaltyPerWrong);

        if (earned < 0) earned = 0;
        earned = Math.round(earned * 100) / 100;

        return {
          pointsAwarded: earned,
          maxPoints,
          isCorrect: earned === maxPoints,
          isPartial: earned > 0 && earned < maxPoints,
          needsManualGrading: false
        };
      }

      case 'SHORT_ANSWER': {
        const text = answer.textAnswer || '';
        const accepted = question.acceptedAnswers || [];
        const isMatch = this.matchesAnswer(text, accepted, question.toleranceDelta);

        if (isMatch) {
          return { pointsAwarded: maxPoints, maxPoints, isCorrect: true, isPartial: false, needsManualGrading: false };
        }
        const penalty = (text.trim().length > 0 && penaltyRate > 0) ? -penaltyRate : 0;
        return { pointsAwarded: penalty, maxPoints, isCorrect: false, isPartial: false, needsManualGrading: false };
      }

      case 'FILL_IN_THE_BLANKS': {
        const studentBlanks = answer.blankAnswers || {};
        const acceptedMap = question.blankAnswers || {};
        const blankKeys = Object.keys(acceptedMap);

        if (blankKeys.length === 0) {
          return { pointsAwarded: maxPoints, maxPoints, isCorrect: true, isPartial: false, needsManualGrading: false };
        }

        let correctCount = 0;
        for (const key of blankKeys) {
          const acceptedList = acceptedMap[key] || [];
          const studentVal = studentBlanks[key] || '';
          if (this.matchesAnswer(studentVal, acceptedList, question.toleranceDelta)) {
            correctCount++;
          }
        }

        const pointsPerBlank = maxPoints / blankKeys.length;
        const earned = Math.round((correctCount * pointsPerBlank) * 100) / 100;

        return {
          pointsAwarded: earned,
          maxPoints,
          isCorrect: correctCount === blankKeys.length,
          isPartial: correctCount > 0 && correctCount < blankKeys.length,
          needsManualGrading: false
        };
      }

      case 'MATCHING': {
        const studentMatches = answer.matchedPairs || {};
        const actualPairs = question.matchingPairs || [];

        if (actualPairs.length === 0) {
          return { pointsAwarded: maxPoints, maxPoints, isCorrect: true, isPartial: false, needsManualGrading: false };
        }

        let correctPairs = 0;
        for (const pair of actualPairs) {
          if (studentMatches[pair.prompt] === pair.response) {
            correctPairs++;
          }
        }

        const pointsPerPair = maxPoints / actualPairs.length;
        const earned = Math.round((correctPairs * pointsPerPair) * 100) / 100;

        return {
          pointsAwarded: earned,
          maxPoints,
          isCorrect: correctPairs === actualPairs.length,
          isPartial: correctPairs > 0 && correctPairs < actualPairs.length,
          needsManualGrading: false
        };
      }

      case 'ESSAY': {
        return {
          pointsAwarded: answer.pointsAwarded || 0,
          maxPoints,
          isCorrect: false,
          isPartial: false,
          needsManualGrading: !answer.isManuallyGraded
        };
      }

      default:
        return { pointsAwarded: 0, maxPoints, isCorrect: false, isPartial: false, needsManualGrading: false };
    }
  }

  /**
   * Applies the zero score floor if configured for the quiz
   */
  public static calculateTotalScore(
    totalEarned: number,
    totalPossible: number,
    zeroFloor: boolean = true
  ): { finalPoints: number; percentage: number } {
    let finalPoints = totalEarned;
    if (zeroFloor && finalPoints < 0) {
      finalPoints = 0;
    }
    finalPoints = Math.round(finalPoints * 100) / 100;
    const percentage = totalPossible > 0 ? Math.round((finalPoints / totalPossible) * 10000) / 100 : 0;
    return { finalPoints, percentage };
  }
}
