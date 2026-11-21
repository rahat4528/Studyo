import { seedQuizDatabase } from '../src/database/seed';
import { AttemptService } from '../src/services/attempt.service';
import { GradingService } from '../src/services/grading.service';
import { db } from '../src/database/db';

describe('Regrade & GradeRevision Audit Trail Suite', () => {
  let seededData: any;

  beforeEach(async () => {
    seededData = await seedQuizDatabase();
  });

  it('should recalculate scores and record an immutable GradeRevision when an answer key is corrected', async () => {
    const student = seededData.users.student1.user;
    const teacher = seededData.users.teacher.user;
    const quiz = seededData.quizzes[1]; // practice quiz: q1 (MC), q2 (MS), q4 (Short Answer)
    const q1 = db.questions.get(quiz.questionIds[0])!;

    // 1. Student takes quiz and answers opt-1-2 (Golgi apparatus, originally marked wrong)
    const attemptView = await AttemptService.startAttempt(quiz.id, student.id);
    AttemptService.saveAnswer(attemptView.id, student.id, q1.id, { selectedOptionIds: ['opt-1-2'] }, 1);
    AttemptService.submitAttempt(attemptView.id, student.id);

    const attemptBefore = db.attempts.get(attemptView.id)!;
    const scoreBefore = attemptBefore.totalPointsEarned;

    // 2. Teacher realizes question key had an error and marks opt-1-2 as correct
    q1.options.forEach(o => {
      if (o.id === 'opt-1-2') o.isCorrect = true;
      if (o.id === 'opt-1-1') o.isCorrect = false;
    });
    db.questions.set(q1.id, q1);

    // 3. Teacher triggers regrade
    const regradeResult = GradingService.regradeQuiz(quiz.id, teacher.id, 'Corrected answer key for Mitochondria question');
    expect(regradeResult.regradedCount).toBeGreaterThan(0);

    const attemptAfter = db.attempts.get(attemptView.id)!;
    expect(attemptAfter.totalPointsEarned).toBeGreaterThan(scoreBefore);

    // 4. Verify GradeRevision log was recorded
    const revisions = GradingService.getRevisions(attemptView.id);
    expect(revisions.length).toBe(1);
    expect(revisions[0].changedById).toBe(teacher.id);
    expect(revisions[0].previousScore).toBe(scoreBefore);
    expect(revisions[0].newScore).toBe(attemptAfter.totalPointsEarned);
    expect(revisions[0].reason).toContain('Corrected answer key');
  });

  it('should track manual essay score adjustments in GradeRevision audit', async () => {
    const student = seededData.users.student1.user;
    const teacher = seededData.users.teacher.user;
    const quiz = seededData.quizzes[0]; // Formal assessment with Essay (q7)
    const essayQ = db.questions.get(quiz.questionIds[6])!;

    const attemptView = await AttemptService.startAttempt(quiz.id, student.id);
    AttemptService.saveAnswer(attemptView.id, student.id, essayQ.id, { textAnswer: 'Detailed mitosis vs meiosis comparison.' }, 1);
    AttemptService.submitAttempt(attemptView.id, student.id);

    // Teacher grades essay: 4.5 out of 5
    GradingService.gradeEssay(attemptView.id, essayQ.id, 4.5, 'Excellent biological accuracy and clear terms', teacher.id);

    const revisions = GradingService.getRevisions(attemptView.id);
    expect(revisions.length).toBe(1);
    expect(revisions[0].newScore).toBe(4.5);
    expect(revisions[0].reason).toContain('Excellent biological accuracy');
  });
});
