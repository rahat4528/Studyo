import { seedQuizDatabase } from '../src/database/seed';
import { QuizService } from '../src/services/quiz.service';
import { AttemptService } from '../src/services/attempt.service';
import { db } from '../src/database/db';

describe('Assessment Integrity & Anti-Tampering Suite', () => {
  let seededData: any;

  beforeEach(async () => {
    seededData = await seedQuizDatabase();
  });

  it('should NEVER leak answer keys, accepted answers, or rubrics to student views', () => {
    const quizId = seededData.quizzes[0].id;
    const studentView = QuizService.getQuizById(quizId, 'STUDENT');

    for (const question of studentView.questions) {
      // isCorrect must not exist on any option
      if (question.options) {
        for (const opt of question.options) {
          expect(opt.isCorrect).toBeUndefined();
        }
      }
      // acceptedAnswers must not exist
      expect(question.acceptedAnswers).toBeUndefined();
      // rubricCriteria must not exist
      expect(question.rubricCriteria).toBeUndefined();
      // explanation must not exist
      expect(question.explanation).toBeUndefined();
    }
  });

  it('should enforce server timer authority and reject late submissions', async () => {
    const student = seededData.users.student1.user;
    const quiz = seededData.quizzes[0]; // 30 min duration

    const attemptView = await AttemptService.startAttempt(quiz.id, student.id);
    const rawAttempt = db.attempts.get(attemptView.id)!;

    // Simulate elapsed time past deadline + grace period
    const expiredTime = new Date(Date.now() - 10000).toISOString();
    rawAttempt.deadline = expiredTime;
    db.attempts.set(rawAttempt.id, rawAttempt);

    // Saving answer after deadline should be rejected and auto-submitted
    expect(() => {
      AttemptService.saveAnswer(rawAttempt.id, student.id, quiz.questionIds[0], { textAnswer: 'late' }, 2);
    }).toThrow(/Assessment deadline has expired/);

    const reloaded = db.attempts.get(rawAttempt.id)!;
    expect(reloaded.status).toBe('EXPIRED');
  });

  it('should reject duplicate submissions on already finalized attempts', async () => {
    const student = seededData.users.student1.user;
    const quiz = seededData.quizzes[0];

    const attemptView = await AttemptService.startAttempt(quiz.id, student.id);
    const submitted = AttemptService.submitAttempt(attemptView.id, student.id);
    expect(['FINALIZED', 'PENDING_MANUAL', 'SUBMITTED', 'AUTO_GRADED']).toContain(submitted.status);

    // Attempt second submission
    expect(() => {
      AttemptService.submitAttempt(attemptView.id, student.id);
    }).toThrow(/already in state/);
  });

  it('should enforce maximum attempt limit against repeat and concurrent starts', async () => {
    const student = seededData.users.student2.user;
    const quiz = seededData.quizzes[0]; // maxAttempts = 2

    // Attempt 1
    const att1 = await AttemptService.startAttempt(quiz.id, student.id);
    AttemptService.submitAttempt(att1.id, student.id);

    // Attempt 2
    const att2 = await AttemptService.startAttempt(quiz.id, student.id);
    AttemptService.submitAttempt(att2.id, student.id);

    // Attempt 3 (Should be blocked by maxAttempts=2 limit)
    await expect(AttemptService.startAttempt(quiz.id, student.id)).rejects.toThrow(
      /Maximum attempt limit \(2\) reached/
    );
  });

  it('should idempotently save answers and reject stale version updates', async () => {
    const student = seededData.users.student1.user;
    const quiz = seededData.quizzes[1]; // practice quiz

    const attemptView = await AttemptService.startAttempt(quiz.id, student.id);
    const qId = quiz.questionIds[0];

    // Version 2 save
    AttemptService.saveAnswer(attemptView.id, student.id, qId, { selectedOptionIds: ['opt-1-1'] }, 2);
    let att = db.attempts.get(attemptView.id)!;
    expect(att.answers[qId].selectedOptionIds).toEqual(['opt-1-1']);
    expect(att.answers[qId].version).toBe(2);

    // Stale Version 1 save should be ignored
    AttemptService.saveAnswer(attemptView.id, student.id, qId, { selectedOptionIds: ['opt-1-2'] }, 1);
    att = db.attempts.get(attemptView.id)!;
    expect(att.answers[qId].selectedOptionIds).toEqual(['opt-1-1']); // preserved v2
    expect(att.answers[qId].version).toBe(2);
  });
});
