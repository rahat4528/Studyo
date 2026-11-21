import { SeededRandom } from '../src/utils/random';
import { QuizService } from '../src/services/quiz.service';
import { Question } from '../src/types';

describe('Deterministic Randomization Suite', () => {
  it('should generate identical shuffles for identical seeds', () => {
    const items = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8'];
    const seed = 987654;

    const rng1 = new SeededRandom(seed);
    const result1 = rng1.shuffle(items);

    const rng2 = new SeededRandom(seed);
    const result2 = rng2.shuffle(items);

    expect(result1).toEqual(result2);
  });

  it('should generate different shuffles for different seeds', () => {
    const items = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8'];

    const rngA = new SeededRandom(11111);
    const resultA = rngA.shuffle(items);

    const rngB = new SeededRandom(99999);
    const resultB = rngB.shuffle(items);

    expect(resultA).not.toEqual(resultB);
  });

  it('should sanitize and deterministically shuffle options for student views', () => {
    const testQuestion: Question = {
      id: 'q-rand',
      categoryId: 'cat-1',
      createdById: 't-1',
      title: 'Randomized Options Question',
      prompt: 'Select one',
      type: 'MULTIPLE_CHOICE',
      points: 1.0,
      penalty: 0,
      options: [
        { id: 'opt-a', questionId: 'q-rand', label: 'Alpha', isCorrect: true, orderIndex: 0 },
        { id: 'opt-b', questionId: 'q-rand', label: 'Beta', isCorrect: false, orderIndex: 1 },
        { id: 'opt-c', questionId: 'q-rand', label: 'Gamma', isCorrect: false, orderIndex: 2 },
        { id: 'opt-d', questionId: 'q-rand', label: 'Delta', isCorrect: false, orderIndex: 3 }
      ]
    };

    const studentSanitized1 = QuizService.sanitizeQuestionForStudent(testQuestion, 45678, 1);
    const studentSanitized2 = QuizService.sanitizeQuestionForStudent(testQuestion, 45678, 1);

    expect(studentSanitized1.options.map((o: any) => o.id)).toEqual(
      studentSanitized2.options.map((o: any) => o.id)
    );
  });
});
