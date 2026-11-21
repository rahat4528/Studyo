import { sandboxedRunner } from '../../execution-service/src/sandbox';

describe('Code Execution Test Runner & Verdicts', () => {
  test('Correct solution passes all test cases and yields ACCEPTED', async () => {
    const correctCode = `
      function solution(nums, target) {
        const map = new Map();
        for (let i = 0; i < nums.length; i++) {
          const complement = target - nums[i];
          if (map.has(complement)) {
            return [map.get(complement), i];
          }
          map.set(nums[i], i);
        }
        return [];
      }
    `;

    const result = await sandboxedRunner.execute({
      id: 'sub-two-sum-pass',
      language: 'javascript',
      code: correctCode,
      testCases: [
        { id: 'tc1', input: JSON.stringify([[2, 7, 11, 15], 9]), expected: JSON.stringify([0, 1]), isPublic: true },
        { id: 'tc2', input: JSON.stringify([[3, 2, 4], 6]), expected: JSON.stringify([1, 2]), isPublic: true },
        { id: 'tc3', input: JSON.stringify([[3, 3], 6]), expected: JSON.stringify([0, 1]), isPublic: false },
      ],
    });

    expect(result.verdict).toBe('ACCEPTED');
    expect(result.passedTests).toBe(3);
    expect(result.totalTests).toBe(3);
  });

  test('Incorrect logic yields WRONG_ANSWER with test failure details', async () => {
    const wrongCode = `
      function solution(nums, target) {
        return [0, 0]; // Always returns wrong index
      }
    `;

    const result = await sandboxedRunner.execute({
      id: 'sub-two-sum-fail',
      language: 'javascript',
      code: wrongCode,
      testCases: [
        { id: 'tc1', input: JSON.stringify([[2, 7, 11, 15], 9]), expected: JSON.stringify([0, 1]), isPublic: true },
      ],
    });

    expect(result.verdict).toBe('WRONG_ANSWER');
    expect(result.passedTests).toBe(0);
    expect(result.testResults[0].passed).toBe(false);
  });

  test('Runtime exception in user code yields RUNTIME_ERROR', async () => {
    const crashCode = `
      function solution(nums, target) {
        null.someNonExistentMethod();
      }
    `;

    const result = await sandboxedRunner.execute({
      id: 'sub-two-sum-crash',
      language: 'javascript',
      code: crashCode,
      testCases: [
        { id: 'tc1', input: JSON.stringify([[2, 7, 11, 15], 9]), expected: JSON.stringify([0, 1]), isPublic: true },
      ],
    });

    expect(result.verdict).toBe('RUNTIME_ERROR');
    expect(result.errorMessage).toBeDefined();
  });
});
