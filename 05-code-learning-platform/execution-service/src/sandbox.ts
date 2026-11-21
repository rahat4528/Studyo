import vm from 'vm';
import { ExecutionRequest, ExecutionResult, TestCaseResult, ExecutionVerdict } from './types';

const MAX_OUTPUT_BYTES = 64 * 1024; // 64 KB

export class SandboxedRunner {
  /**
   * Executes a submission request with strict timeouts and resource isolation
   */
  public async execute(req: ExecutionRequest): Promise<ExecutionResult> {
    const timeLimitMs = req.timeLimitMs || 3000;
    const testResults: TestCaseResult[] = [];
    let passedCount = 0;
    let totalExecutionTimeMs = 0;
    let overallVerdict: ExecutionVerdict = 'ACCEPTED';
    let stdoutBuffer = '';
    let caughtError: string | undefined;

    // Security check for dangerous process tokens in code
    const forbiddenPatterns = [
      /process\.exit/i,
      /child_process/i,
      /fs\./i,
      /net\./i,
      /http\./i,
      /cluster\./i,
    ];

    if (req.language === 'javascript' || req.language === 'typescript') {
      for (const pattern of forbiddenPatterns) {
        if (pattern.test(req.code)) {
          return {
            submissionId: req.id,
            verdict: 'RUNTIME_ERROR',
            totalTimeMs: 0,
            memoryUsedBytes: 0,
            passedTests: 0,
            totalTests: req.testCases.length,
            testResults: [],
            errorMessage: 'Security violation: Access to prohibited system modules is blocked',
          };
        }
      }
    }

    const startTime = Date.now();

    for (const tc of req.testCases) {
      const tcStartTime = Date.now();
      let tcPassed = false;
      let actualOutput: string | undefined;
      let tcError: string | undefined;

      try {
        const runRes = this.runSingleTestCase(req.language, req.code, tc.input, timeLimitMs);
        actualOutput = runRes.output.trim();

        if (runRes.stdout) {
          if (stdoutBuffer.length + runRes.stdout.length > MAX_OUTPUT_BYTES) {
            overallVerdict = 'OUTPUT_LIMIT_EXCEEDED';
            stdoutBuffer += '\n[OUTPUT_LIMIT_EXCEEDED: Output truncated]';
            break;
          }
          stdoutBuffer += runRes.stdout;
        }

        const normalizedExpected = tc.expected.trim();
        if (actualOutput === normalizedExpected) {
          tcPassed = true;
          passedCount++;
        } else {
          tcPassed = false;
          if (overallVerdict === 'ACCEPTED') {
            overallVerdict = 'WRONG_ANSWER';
          }
        }
      } catch (err: any) {
        const errStr = String(err?.message || err || '');
        tcError = errStr;
        if (errStr.includes('Script execution timed out') || errStr.includes('TIMEOUT')) {
          overallVerdict = 'TIME_LIMIT_EXCEEDED';
          caughtError = 'Execution timed out (Time Limit Exceeded)';
        } else {
          overallVerdict = 'RUNTIME_ERROR';
          caughtError = errStr;
        }
        break;
      }

      const tcDuration = Date.now() - tcStartTime;
      totalExecutionTimeMs += tcDuration;

      testResults.push({
        testCaseId: tc.id,
        passed: tcPassed,
        isPublic: tc.isPublic,
        executionTimeMs: tcDuration,
        actual: tc.isPublic ? actualOutput : undefined,
        expected: tc.isPublic ? tc.expected : undefined,
        errorMessage: tcError,
      });

      if ((overallVerdict as string) === 'TIME_LIMIT_EXCEEDED' || (overallVerdict as string) === 'RUNTIME_ERROR') {
        break;
      }
    }

    totalExecutionTimeMs = Date.now() - startTime;

    if (overallVerdict === 'ACCEPTED' && passedCount < req.testCases.length) {
      overallVerdict = 'WRONG_ANSWER';
    }

    return {
      submissionId: req.id,
      verdict: overallVerdict,
      totalTimeMs: totalExecutionTimeMs,
      memoryUsedBytes: 16 * 1024 * 1024, // approx 16 MB
      passedTests: passedCount,
      totalTests: req.testCases.length,
      testResults,
      stdout: stdoutBuffer,
      errorMessage: caughtError,
    };
  }

  /**
   * Runs user code with provided input inside a secure VM context
   */
  private runSingleTestCase(
    language: string,
    userCode: string,
    inputJson: string,
    timeoutMs: number
  ): { output: string; stdout: string } {
    let capturedStdout = '';

    // Create secure isolated context
    const sandbox: Record<string, any> = {
      console: {
        log: (...args: any[]) => {
          capturedStdout += args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') + '\n';
        },
        error: (...args: any[]) => {
          capturedStdout += args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') + '\n';
        },
      },
      JSON,
      Math,
      parseInt,
      parseFloat,
      Array,
      Object,
      String,
      Number,
      Boolean,
      Map,
      Set,
      Date,
    };

    const context = vm.createContext(sandbox);

    // Wrapper script to execute the function with input arguments
    const scriptCode = `
      "use strict";
      ${userCode}

      (function() {
        let parsedInput;
        try {
          parsedInput = JSON.parse(${JSON.stringify(inputJson)});
        } catch(e) {
          parsedInput = ${JSON.stringify(inputJson)};
        }

        let result;
        if (typeof solution === 'function') {
          if (Array.isArray(parsedInput)) {
            result = solution(...parsedInput);
          } else {
            result = solution(parsedInput);
          }
        } else {
          result = undefined;
        }

        return JSON.stringify(result);
      })();
    `;

    const script = new vm.Script(scriptCode);
    const resultJson = script.runInContext(context, {
      timeout: timeoutMs,
      displayErrors: true,
    });

    return {
      output: resultJson !== undefined ? String(resultJson) : 'null',
      stdout: capturedStdout,
    };
  }
}

export const sandboxedRunner = new SandboxedRunner();
