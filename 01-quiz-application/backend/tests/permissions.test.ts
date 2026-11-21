import { seedQuizDatabase } from '../src/database/seed';
import { QuizService } from '../src/services/quiz.service';
import { AttemptService } from '../src/services/attempt.service';

describe('Role Matrix & Cross-User Permission Suite', () => {
  let seededData: any;

  beforeEach(async () => {
    seededData = await seedQuizDatabase();
  });

  it('should prevent students from creating or editing quizzes', () => {
    const student = seededData.users.student1.user;
    expect(() => {
      QuizService.createQuiz({} as any, student.id, student.role);
    }).toThrow(/Students are not authorized to create quizzes/);
  });

  it('should prevent unauthorized teachers from modifying another teachers quiz', () => {
    const teacher1 = seededData.users.teacher.user;
    const quiz = seededData.quizzes[0]; // created by teacher1

    // Another teacher
    const otherTeacherId = 'teacher-unauthorized-id';

    expect(() => {
      QuizService.updateQuiz(quiz.id, { title: 'Hacked Title' }, otherTeacherId, 'TEACHER');
    }).toThrow(/Unauthorized to modify this quiz/);
  });

  it('should prevent cross-user attempt answer saving and submissions', async () => {
    const student1 = seededData.users.student1.user;
    const student2 = seededData.users.student2.user;
    const quiz = seededData.quizzes[0];

    const att1 = await AttemptService.startAttempt(quiz.id, student1.id);

    // Student2 tries to modify student1's attempt
    expect(() => {
      AttemptService.saveAnswer(att1.id, student2.id, quiz.questionIds[0], { textAnswer: 'Tampered' }, 1);
    }).toThrow(/Unauthorized access to this attempt/);

    // Student2 tries to submit student1's attempt
    expect(() => {
      AttemptService.submitAttempt(att1.id, student2.id);
    }).toThrow(/Unauthorized attempt submission/);
  });
});
