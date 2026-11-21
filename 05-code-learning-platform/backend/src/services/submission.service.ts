import { randomUUID } from 'crypto';
import { db } from '../database/db';
import { Submission, Verdict } from '../types';
import { sandboxedRunner } from '../../../execution-service/src/sandbox';
import { gamificationService } from './gamification.service';

export class SubmissionService {
  /**
   * Evaluates user code against all test cases (public and hidden) inside the execution sandbox
   */
  public async submitCode(
    challengeId: string,
    userId: string,
    language: 'javascript' | 'typescript' | 'python' | 'cpp',
    code: string
  ): Promise<Submission> {
    const challenge = db.challenges.get(challengeId);
    if (!challenge) throw new Error('Challenge not found');

    const submissionId = randomUUID();

    // Send to isolated sandboxed runner
    const execResult = await sandboxedRunner.execute({
      id: submissionId,
      language,
      code,
      testCases: challenge.testCases.map(tc => ({
        id: tc.id,
        input: tc.input,
        expected: tc.expected,
        isPublic: tc.isPublic,
      })),
      timeLimitMs: challenge.timeLimitMs,
      memoryLimitMb: challenge.memoryLimitMb,
    });

    const submission: Submission = {
      id: submissionId,
      challengeId,
      userId,
      language,
      code,
      verdict: execResult.verdict,
      executionTimeMs: execResult.totalTimeMs,
      memoryUsedBytes: execResult.memoryUsedBytes,
      passedTests: execResult.passedTests,
      totalTests: execResult.totalTests,
      errorMessage: execResult.errorMessage,
      stdout: execResult.stdout,
      createdAt: new Date().toISOString(),
    };

    db.submissions.set(submission.id, submission);

    // If solved (ACCEPTED), check if this is the first solve by this user
    if (submission.verdict === 'ACCEPTED') {
      const priorAccepted = Array.from(db.submissions.values()).some(
        s => s.userId === userId && s.challengeId === challengeId && s.id !== submissionId && s.verdict === 'ACCEPTED'
      );

      if (!priorAccepted) {
        // Award XP
        const user = db.users.get(userId);
        if (user) {
          user.xp = (user.xp || 0) + challenge.xpReward;
        }

        // Record daily activity & update streaks
        gamificationService.recordDailyActivity(userId);
      }
    }

    return submission;
  }

  public getSubmissionsByUser(userId: string, challengeId?: string): Submission[] {
    return Array.from(db.submissions.values())
      .filter(s => s.userId === userId && (!challengeId || s.challengeId === challengeId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export const submissionService = new SubmissionService();
