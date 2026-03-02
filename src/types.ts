// ─────────────────────────────────────────────────────────────────────────────
// Dividend Freedom Pro — Strict TypeScript Types
// Mirrors the JSDoc in engine.js for use in Next.js / Codex
// ─────────────────────────────────────────────────────────────────────────────

export type HealthStatus  = "CRITICAL" | "STABLE" | "WARNING" | "NEUTRAL";
export type PayFrequency  = "weekly" | "monthly" | "quarterly" | "annual";
export type DataSource    = "live"     | "local" | "manual" | "stub";
export type Strategy      = "income"   | "growth" | "hyper";
export type FetchStatus   = "idle"     | "loading" | "ok" | "error";
export type RiskTolerance = "low" | "medium" | "high";
export type TargetPeriod = "monthly" | "yearly";
export type PortfolioType =
  | "Core Dividend"
  | "Covered Call"
  | "Growth / Index"
  | "Leveraged"
  | "Closed-End Funds"
  | "Option Income"
  | "Roundhill Income"
  | "Roundhill Thematic";
export type PortfolioArchetype =
  | "pure-growth"
  | "growth-income"
  | "leveraged-growth"
  | "dividend-income"
  | "high-yield-income"
  | "covered-call-income"
  | "balanced-blend"
  | "hyper-income"
  | "cef-income"
  | "conservative-income";

// ── ETF record returned by the data layer ─────────────────────────────────────
export interface ETFRecord {
  ticker:     string;
  name:       string;
  price:      number;           // USD
  yield:      number;           // decimal (0.087 = 8.7%)
  cagr:       number | null;    // 1-year price return, decimal
  leveraged:  boolean;
  payFreq:    PayFrequency;
  sparkline:  number[];         // 12 monthly closing prices
  health:     HealthStatus;     // computed by getHealth()
  source:     DataSource;
  lastUpdated: string;
  categories: string[];
}

// ── Raw holding input from user ───────────────────────────────────────────────
export interface RawHolding {
  ticker:      string;
  shares:      number;
  avgCost:     number;          // Cost basis per share
  cagrOvr:     number | null;  // User-overridden CAGR %  (null = use ETF_DB)
  /**
   * @deprecated Live data is now resolved through useLiveCache.
   * This field is retained for backward compat with persisted store state.
   * Do not write to this field in new code - use useLiveCache.set() instead.
   */
  live:        LiveData | null; // Populated after FMP/StockAnalysis fetch
  fetchStatus: FetchStatus;
}

// ── Live data returned by fetchTickerData() ───────────────────────────────────
export interface LiveData {
  ticker:  string;
  name:    string;
  price:   number;
  yield:   number;              // decimal
  cagr:    number;              // decimal
  payFreq: PayFrequency;
  source:  "live" | "error";
  error?:  string;
}

// ── Enriched holding (RawHolding + computed fields) ───────────────────────────
export interface EnrichedHolding extends Omit<RawHolding, "cagrOvr" | "live" | "fetchStatus"> {
  price:      number;
  value:      number;           // shares × price
  yld:        number;           // decimal yield
  cagr:       number | null;
  src:        DataSource;
  payFreq:    PayFrequency;
  sparkline:  number[];
  health:     HealthStatus;
  leveraged:  boolean;
  name:       string;
}

// ── Projection ────────────────────────────────────────────────────────────────
export interface ProjectionParams {
  capital:  number;
  monthly:  number;             // Monthly contribution
  cagr:     number;
  yld:      number;
  drip:     boolean;
  years:    number;
  crash?:   number;             // 0–100 (% loss in Year 1)
  pause?:   number;             // Months to pause contributions
}

export interface ProjectionRow {
  year:      number;
  portfolio: number;
  monthly:   number;
}

// ── Portfolio metrics ─────────────────────────────────────────────────────────
export interface BlendedMetrics {
  totalVal:      number;
  bYield:        number;
  bCagr:         number;
  monthlyIncome: number;
}

// ── Payday calendar ───────────────────────────────────────────────────────────
export interface PaydayWeek {
  label:   string;
  amount:  number;
}

export interface DividendScheduleEntry {
  ticker: string;
  name: string;
  payFreq: PayFrequency;
  estimatedAnnual: number;
  estimatedMonthly: number;
  estimatedWeekly: number;
  estimatedPerPeriod: number;
  nextExDivDate: string | null;
  nextPayDate: string | null;
  daysUntilExDiv: number | null;
  buyByDate: string | null;
  weekBucket: number;
  monthBucket: number;
}

export interface DividendCalendarHolding {
  ticker: string;
  name: string;
  amount: number;
  payFreq: PayFrequency;
}

export interface DividendCalendarWeek {
  weekNumber: number;
  weekLabel: string;
  totalAmount: number;
  holdings: DividendCalendarHolding[];
}

export interface DividendCalendarData {
  schedule: DividendScheduleEntry[];
  weeklyCalendar: DividendCalendarWeek[];
  monthlyTotals: number[];
  annualTotal: number;
  weeklyAverage: number;
  monthlyAverage: number;
}

// ── Milestones ────────────────────────────────────────────────────────────────
export interface MilestoneTier {
  id:         string;
  label:      string;
  target:     number;
  icon:       string;
  isDynamic?: boolean;
}

export interface MilestoneResult extends MilestoneTier {
  pct:     number;             // 0–100
  reached: boolean;
}

// ── Cache ─────────────────────────────────────────────────────────────────────
export interface CacheEntry<T = unknown> {
  ts:   number;               // Date.now() when stored
  data: T;
}

export interface ExpenseGoal {
  id: string;
  label: string;
  amount: number;
  createdAt: number;
}

export type ExpenseCoverageResult = {
  goal: ExpenseGoal;
  covered: number;
  uncovered: number;
  pct: number;
  fullyMet: boolean;
  cumulativeUsed: number;
};

export type OnboardingStep =
  | "strategy"
  | "risk"
  | "target"
  | "capital"
  | "types"
  | "recommendations"
  | "apply"
  | "complete";

export interface OnboardingState {
  currentStep: OnboardingStep;
  completedAt: number | null;
}

// ── Strategy definition ───────────────────────────────────────────────────────
export interface StrategyConfig {
  key:       Strategy;
  label:     string;
  icon:      string;
  desc:      string;
  cagr:      number;
  yield:     number;
  color:     string;
  colorDim:  string;
  chips:     string[];
  tickers:   string[];
}

export interface ArchetypeDefinition {
  key: PortfolioArchetype;
  name: string;
  tagline: string;
  description: string;
  expectedYieldRange: [number, number];
  expectedCagrRange: [number, number];
  riskLevel: "low" | "medium" | "high" | "very-high";
  strategy: Strategy;
  preferredTypes: PortfolioType[];
  tags: string[];
  color: string;
  icon: string;
  bestFor: string;
}

// ── User goal ─────────────────────────────────────────────────────────────────
export interface UserGoal {
  targetIncome: number;
  capital:      number;
  hasSetCapital?: boolean;
  monthly:      number;
  drip:         boolean;
  years:        number;
  strategy:     Strategy;
  riskTolerance: RiskTolerance;
  targetPeriod: TargetPeriod;
  taxEnabled: boolean;
  taxRate: number; // percent 0-100
  preferredTypes: PortfolioType[];
  selectedArchetype: PortfolioArchetype | null;
}

// ── App state shape (for Zustand / context) ───────────────────────────────────
export interface AppState {
  goal:       UserGoal;
  fmpKey:     string;
  keyStatus:  "idle" | "validating" | "ok" | "error";
  holdings:   RawHolding[];
  allocs:     { ticker: string; w: number }[];
  crash:      number;
  pause:      number;
  actualDividends: number[];
  expenseGoals: ExpenseGoal[];
  onboarding: OnboardingState;
  liveCache:  Record<string, CacheEntry<LiveData>>;
}
