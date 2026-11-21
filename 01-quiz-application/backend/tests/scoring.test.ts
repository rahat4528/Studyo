import { ScoringEngine } from '../src/scoring/scoring.engine';
import { Question } from '../src/types';

describe('ScoringEngine - Multi-Type Scoring & Assessment Rules', () => {
  describe('Text Normalization & Answer Matching', () => {
    it('should normalize casing, whitespace, and diacritics', () => {
      const norm1 = ScoringEngine.normalizeText('   Café   au   Lait  ');
      expect(norm1).toBe('cafe au lait');

      const norm2 = ScoringEngine.normalizeText('  MITOCHONDRIA\n\t');
      expect(norm2).toBe('mitochondria');
    });

    it('should match normalized accepted answers', () => {
      const accepted = ['Ribosome', 'Ribosomes', '80S Ribosome'];
      expect(ScoringEngine.matchesAnswer('ribosome', accepted)).toBe(true);
      expect(ScoringEngine.matchesAnswer('  RIBOSOMES  ', accepted)).toBe(true);
      expect(ScoringEngine.matchesAnswer('lysosome', accepted)).toBe(false);
    });

    it('should evaluate numeric answers with tolerance delta', () => {
      const accepted = ['3.14159'];
      expect(ScoringEngine.matchesAnswer('3.14', accepted, 0.01)).toBe(true);
      expect(ScoringEngine.matchesAnswer('3.142', accepted, 0.001)).toBe(true);
      expect(ScoringEngine.matchesAnswer('3.20', accepted, 0.01)).toBe(false);
    });
  });

  describe('Multiple Choice & True/False', () => {
    const mcQuestion: Question = {
      id: 'q-mc',
      categoryId: 'cat-1',
      createdById: 't-1',
      title: 'MC Question',
      prompt: 'Select correct',
      type: 'MULTIPLE_CHOICE',
      points: 2.0,
      penalty: 0.5,
      options: [
        { id: 'opt-1', questionId: 'q-mc', label: 'Correct', isCorrect: true, orderIndex: 0 },
        { id: 'opt-2', questionId: 'q-mc', label: 'Wrong', isCorrect: false, orderIndex: 1 }
      ]
    };

    it('should award full points for correct choice', () => {
      const res = ScoringEngine.gradeAnswer(mcQuestion, {
        id: 'a1',
        attemptId: 'att1',
        questionId: 'q-mc',
        selectedOptionIds: ['opt-1'],
        pointsAwarded: 0,
        isAutoGraded: false,
        isManuallyGraded: false,
        version: 1,
        updatedAt: ''
      });
      expect(res.pointsAwarded).toBe(2.0);
      expect(res.isCorrect).toBe(true);
    });

    it('should apply penalty if negative marking is enabled on wrong choice', () => {
      const res = ScoringEngine.gradeAnswer(
        mcQuestion,
        {
          id: 'a2',
          attemptId: 'att1',
          questionId: 'q-mc',
          selectedOptionIds: ['opt-2'],
          pointsAwarded: 0,
          isAutoGraded: false,
          isManuallyGraded: false,
          version: 1,
          updatedAt: ''
        },
        { enableNegativeMarks: true, negativeMarkPenalty: 0.5 }
      );
      expect(res.pointsAwarded).toBe(-0.5);
      expect(res.isCorrect).toBe(false);
    });
  });

  describe('Multiple Select Partial Credit', () => {
    const msQuestion: Question = {
      id: 'q-ms',
      categoryId: 'cat-1',
      createdById: 't-1',
      title: 'Multiple Select',
      prompt: 'Select all correct',
      type: 'MULTIPLE_SELECT',
      points: 4.0,
      penalty: 0.0,
      options: [
        { id: 'c1', questionId: 'q-ms', label: 'Correct 1', isCorrect: true, orderIndex: 0 },
        { id: 'c2', questionId: 'q-ms', label: 'Correct 2', isCorrect: true, orderIndex: 1 },
        { id: 'w1', questionId: 'q-ms', label: 'Wrong 1', isCorrect: false, orderIndex: 2 },
        { id: 'w2', questionId: 'q-ms', label: 'Wrong 2', isCorrect: false, orderIndex: 3 }
      ]
    };

    it('should award full marks when all correct choices are selected', () => {
      const res = ScoringEngine.gradeAnswer(msQuestion, {
        id: 'a-ms-1',
        attemptId: 'att-1',
        questionId: 'q-ms',
        selectedOptionIds: ['c1', 'c2'],
        pointsAwarded: 0,
        isAutoGraded: false,
        isManuallyGraded: false,
        version: 1,
        updatedAt: ''
      });
      expect(res.pointsAwarded).toBe(4.0);
      expect(res.isCorrect).toBe(true);
      expect(res.isPartial).toBe(false);
    });

    it('should award partial credit when 1 of 2 correct choices is selected without penalties', () => {
      const res = ScoringEngine.gradeAnswer(msQuestion, {
        id: 'a-ms-2',
        attemptId: 'att-1',
        questionId: 'q-ms',
        selectedOptionIds: ['c1'],
        pointsAwarded: 0,
        isAutoGraded: false,
        isManuallyGraded: false,
        version: 1,
        updatedAt: ''
      });
      expect(res.pointsAwarded).toBe(2.0);
      expect(res.isCorrect).toBe(false);
      expect(res.isPartial).toBe(true);
    });

    it('should deduct points when incorrect options are chosen alongside correct options', () => {
      // 1 correct (+2) and 1 wrong (-2) = 0
      const res = ScoringEngine.gradeAnswer(msQuestion, {
        id: 'a-ms-3',
        attemptId: 'att-1',
        questionId: 'q-ms',
        selectedOptionIds: ['c1', 'w1'],
        pointsAwarded: 0,
        isAutoGraded: false,
        isManuallyGraded: false,
        version: 1,
        updatedAt: ''
      });
      expect(res.pointsAwarded).toBe(0.0);
    });
  });

  describe('Fill in the Blanks & Matching', () => {
    it('should award proportional credit for fill in the blanks', () => {
      const fibQuestion: Question = {
        id: 'q-fib',
        categoryId: 'cat-1',
        createdById: 't-1',
        title: 'FIB Question',
        prompt: 'Protocol [b1] and [b2]',
        type: 'FILL_IN_THE_BLANKS',
        points: 4.0,
        penalty: 0,
        options: [],
        blankAnswers: {
          b1: ['TCP'],
          b2: ['UDP']
        }
      };

      const resPartial = ScoringEngine.gradeAnswer(fibQuestion, {
        id: 'a-fib',
        attemptId: 'att-1',
        questionId: 'q-fib',
        blankAnswers: { b1: 'TCP', b2: 'HTTP' },
        pointsAwarded: 0,
        isAutoGraded: false,
        isManuallyGraded: false,
        version: 1,
        updatedAt: ''
      });
      expect(resPartial.pointsAwarded).toBe(2.0);
      expect(resPartial.isPartial).toBe(true);
    });

    it('should award proportional credit for matching pairs', () => {
      const matchQuestion: Question = {
        id: 'q-mat',
        categoryId: 'cat-1',
        createdById: 't-1',
        title: 'Match Question',
        prompt: 'Match protocols',
        type: 'MATCHING',
        points: 6.0,
        penalty: 0,
        options: [],
        matchingPairs: [
          { prompt: 'HTTP', response: 'L7' },
          { prompt: 'TCP', response: 'L4' },
          { prompt: 'IP', response: 'L3' }
        ]
      };

      const res = ScoringEngine.gradeAnswer(matchQuestion, {
        id: 'a-mat',
        attemptId: 'att-1',
        questionId: 'q-mat',
        matchedPairs: {
          HTTP: 'L7',
          TCP: 'L4',
          IP: 'L2' // Wrong match
        },
        pointsAwarded: 0,
        isAutoGraded: false,
        isManuallyGraded: false,
        version: 1,
        updatedAt: ''
      });
      expect(res.pointsAwarded).toBe(4.0); // 2 of 3 correct
      expect(res.isCorrect).toBe(false);
      expect(res.isPartial).toBe(true);
    });
  });

  describe('Zero Score Floor & Total Score Calculation', () => {
    it('should enforce zero score floor when total score is negative', () => {
      const res = ScoringEngine.calculateTotalScore(-3.5, 10.0, true);
      expect(res.finalPoints).toBe(0.0);
      expect(res.percentage).toBe(0.0);
    });

    it('should allow negative score when zero score floor is disabled', () => {
      const res = ScoringEngine.calculateTotalScore(-3.5, 10.0, false);
      expect(res.finalPoints).toBe(-3.5);
      expect(res.percentage).toBe(-35.0);
    });
  });
});
