export type SupportedLanguage = 'javascript' | 'typescript' | 'python' | 'cpp';

export type ExecutionVerdict =
  | 'PENDING'
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'TIME_LIMIT_EXCEEDED'
  | 'MEMORY_LIMIT_EXCEEDED'
  | 'RUNTIME_ERROR'
  | 'COMPILATION_ERROR'
  | 'OUTPUT_LIMIT_EXCEEDED';

export interface ExecutionRequest {
  id: string;
  language: SupportedLanguage;
  code: string;
  testCases: Array<{
    id: string;
    input: string;
    expected: string;
    isPublic: boolean;
  }>;
  timeLimitMs?: number;
  memoryLimitMb?: number;
}

export interface TestCaseResult {
  testCaseId: string;
  passed: boolean;
  actual?: string;
  expected?: string; // only returned for public tests!
  executionTimeMs: number;
  isPublic: boolean;
  errorMessage?: string;
}

export interface ExecutionResult {
  submissionId: string;
  verdict: ExecutionVerdict;
  totalTimeMs: number;
  memoryUsedBytes: number;
  passedTests: number;
  totalTests: number;
  testResults: TestCaseResult[];
  stdout?: string;
  errorMessage?: string;
}
