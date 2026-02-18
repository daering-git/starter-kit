export interface TestRunSummary {
  id: string;
  name: string;
  source: string;
  host: string | null;
  startedAt: string;
  duration: number | null;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  status: string;
  uploadedBy: string | null;
  createdAt: string;
}

export interface TestRunDetail extends TestRunSummary {
  endedAt: string | null;
  suites: TestSuiteDetail[];
}

export interface TestSuiteDetail {
  id: string;
  name: string;
  source: string | null;
  duration: number | null;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  tests: TestCaseDetail[];
}

export interface TestCaseDetail {
  id: string;
  name: string;
  status: string;
  duration: number | null;
  message: string | null;
  tags: string[];
}
