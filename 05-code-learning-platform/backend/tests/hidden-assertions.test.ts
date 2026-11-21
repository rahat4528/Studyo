import { db } from '../src/database/db';
import { curriculumService } from '../src/services/curriculum.service';
import { sandboxedRunner } from '../../execution-service/src/sandbox';

describe('Zero-Leak Hidden Test Cases Security Invariants', () => {
  let challengeId: string;

  beforeEach(() => {
    db.clear();
    const track = curriculumService.createTrack('Algo', 'algo', 'Algorithms');
    const ch = curriculumService.createChapter(track.id, 'Ch 1');
    const challenge = curriculumService.createChallenge(
      ch.id,
      'Palindrome Number',
      'palindrome-number',
      'EASY',
      50,
      'Check if palindrome',
      { javascript: 'function solution(x) {}' }
    );
    challengeId = challenge.id;

    // 1 Public test case
    curriculumService.addTestCase(challengeId, JSON.stringify([121]), JSON.stringify(true), true, 1);

    // 2 Confidential Hidden test cases (edge cases)
    curriculumService.addTestCase(challengeId, JSON.stringify([-121]), JSON.stringify(false), false, 2);
    curriculumService.addTestCase(challengeId, JSON.stringify([1000000001]), JSON.stringify(true), false, 3);
  });

  test('Public challenge serializer strips all hidden test cases', () => {
    const publicData = curriculumService.getChallengePublic(challengeId);

    expect(publicData.testCases.length).toBe(1);
    expect(publicData.testCases[0].input).toBe(JSON.stringify([121]));

    // Verify hidden tests are NOT present in the public response
    const hasHiddenTests = publicData.testCases.some(tc => !tc.isPublic);
    expect(hasHiddenTests).toBe(false);

    const hasNegative = publicData.testCases.some(tc => tc.input.includes('-121'));
    expect(hasNegative).toBe(false);
  });

  test('Test results do NOT leak expected or actual values for hidden test cases', async () => {
    const failingCode = `
      function solution(x) {
        return true; // Fails on -121
      }
    `;

    const challenge = db.challenges.get(challengeId)!;

    const result = await sandboxedRunner.execute({
      id: 'sub-leak-check',
      language: 'javascript',
      code: failingCode,
      testCases: challenge.testCases.map(tc => ({
        id: tc.id,
        input: tc.input,
        expected: tc.expected,
        isPublic: tc.isPublic,
      })),
    });

    expect(result.verdict).toBe('WRONG_ANSWER');

    // Public test case has actual and expected visible
    const publicResult = result.testResults.find((r: any) => r.isPublic);
    expect(publicResult?.actual).toBeDefined();
    expect(publicResult?.expected).toBeDefined();

    // Hidden test case has actual and expected STRICTLY MASKED (undefined)
    const hiddenResults = result.testResults.filter((r: any) => !r.isPublic);
    expect(hiddenResults.length).toBe(2);
    for (const hr of hiddenResults) {
      expect(hr.expected).toBeUndefined();
      expect(hr.actual).toBeUndefined();
    }
  });
});
