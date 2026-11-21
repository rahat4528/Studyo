import { sandboxedRunner } from '../../execution-service/src/sandbox';

describe('Sandboxed Code Execution Security & Quotas', () => {
  test('Terminates infinite loops safely within wall-clock timeout', async () => {
    const infiniteLoopCode = `
      function solution(nums, target) {
        while(true) {}
      }
    `;

    const result = await sandboxedRunner.execute({
      id: 'sub-infinite-loop',
      language: 'javascript',
      code: infiniteLoopCode,
      testCases: [
        { id: 'tc1', input: JSON.stringify([[1, 2], 3]), expected: JSON.stringify([0, 1]), isPublic: true },
      ],
      timeLimitMs: 500, // short 500ms timeout for test speed
    });

    expect(result.verdict).toBe('TIME_LIMIT_EXCEEDED');
    expect(result.passedTests).toBe(0);
    expect(result.errorMessage).toContain('Time Limit Exceeded');
  });

  test('Blocks access to prohibited process, filesystem, and child_process modules', async () => {
    const maliciousCode = `
      const fs = require('fs');
      function solution(nums, target) {
        fs.readFileSync('/etc/passwd');
      }
    `;

    const result = await sandboxedRunner.execute({
      id: 'sub-malicious-fs',
      language: 'javascript',
      code: maliciousCode,
      testCases: [
        { id: 'tc1', input: JSON.stringify([[1, 2], 3]), expected: JSON.stringify([0, 1]), isPublic: true },
      ],
    });

    expect(result.verdict).toBe('RUNTIME_ERROR');
    expect(result.errorMessage).toContain('Security violation: Access to prohibited system modules is blocked');
  });

  test('Truncates excessive stdout output with OUTPUT_LIMIT_EXCEEDED', async () => {
    const floodingCode = `
      function solution(nums, target) {
        for (let i = 0; i < 5000; i++) {
          console.log('Spam output flood string 1234567890 1234567890');
        }
        return [0, 1];
      }
    `;

    const result = await sandboxedRunner.execute({
      id: 'sub-flood-stdout',
      language: 'javascript',
      code: floodingCode,
      testCases: [
        { id: 'tc1', input: JSON.stringify([[1, 2], 3]), expected: JSON.stringify([0, 1]), isPublic: true },
      ],
    });

    expect(result.verdict).toBe('OUTPUT_LIMIT_EXCEEDED');
    expect(result.stdout).toContain('OUTPUT_LIMIT_EXCEEDED');
  });
});
