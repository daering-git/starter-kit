export interface DashboardOverview {
  totalRuns: number;
  totalTests: number;
  totalPassed: number;
  totalFailed: number;
  totalSkipped: number;
  avgPassRate: number;
  recentRuns: RecentRun[];
  dailyTrend: DailyTrendPoint[];
  suiteBreakdown: SuiteBreakdown[];
}

export interface RecentRun {
  id: string;
  name: string;
  startedAt: string;
  passed: number;
  failed: number;
  total: number;
}

export interface DailyTrendPoint {
  date: string;
  passRate: number;
  total: number;
}

export interface SuiteBreakdown {
  name: string;
  passed: number;
  failed: number;
  skipped: number;
}

// ─── Suite Analysis ───

export interface SuiteAnalysis {
  name: string;
  runCount: number;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  passRate: number;
  avgDuration: number | null;
}

// ─── Host Heatmap ───

export interface HostHeatmapCell {
  x: string; // date
  y: number; // pass rate (0-100)
}

export interface HostHeatmapRow {
  id: string; // host name
  data: HostHeatmapCell[];
}

export interface HostSummary {
  host: string;
  totalRuns: number;
  totalTests: number;
  passed: number;
  failed: number;
  passRate: number;
  lastRun: string;
}

// ─── Trends ───

export interface TrendDataPoint {
  date: string;
  passRate: number;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  runCount: number;
}
