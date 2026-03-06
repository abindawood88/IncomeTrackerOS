/**
 * Dividend Freedom Pro — Core Engine
 * Pure functions extracted from the UI layer.
 * No React dependencies — safe to import in Node, Next.js server, or tests.
 *
 * @module engine
 */

// ─────────────────────────────────────────────────────────────────────────────
// TYPES (JSDoc — mirrors the TypeScript interfaces for Codex)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @typedef {'CRITICAL'|'STABLE'|'WARNING'|'NEUTRAL'} HealthStatus
 *
 * CRITICAL  yield > 12% AND cagr < -10%   → Yield trap, capital destruction
 * STABLE    yield > 3%  AND cagr > 5%     → Solid income with growth
 * WARNING   yield > 10%                   → High yield, monitor closely
 * NEUTRAL   everything else
 */

/**
 * @typedef {'weekly'|'monthly'|'quarterly'|'annual'} PayFrequency
 */

/**
 * @typedef {Object} ETFRecord
 * @property {string}        ticker
 * @property {string}        name
 * @property {number}        price        - Current price USD
 * @property {number}        yield        - Annual dividend yield as decimal (0.087 = 8.7%)
 * @property {number|null}   cagr         - 1-year CAGR as decimal (null if unknown)
 * @property {boolean}       leveraged    - True for 2x/3x ETFs
 * @property {PayFrequency}  payFreq
 * @property {number[]}      sparkline    - 12 monthly closing prices
 * @property {HealthStatus}  health       - Computed health status
 * @property {'live'|'local'|'manual'} source
 */

/**
 * @typedef {Object} ProjectionRow
 * @property {number} year       - Calendar year
 * @property {number} portfolio  - Total portfolio value USD (rounded)
 * @property {number} monthly    - Monthly dividend income USD (rounded)
 */

/**
 * @typedef {Object} ProjectionParams
 * @property {number}  capital   - Starting portfolio value USD
 * @property {number}  monthly   - Monthly contribution USD
 * @property {number}  cagr      - Annual growth rate as decimal
 * @property {number}  yld       - Annual dividend yield as decimal
 * @property {boolean} drip      - Reinvest dividends?
 * @property {number}  years     - Projection length in years
 * @property {number}  [crash]   - Year-1 portfolio loss % (0–100)
 * @property {number}  [pause]   - Number of months to skip contributions
 */

/**
 * @typedef {Object} PaydayWeek
 * @property {string} label   - E.g. "Week 1 (1–7)"
 * @property {number} amount  - Estimated USD income for this week
 */

/**
 * @typedef {Object} EnrichedHolding
 * @property {string}       ticker
 * @property {number}       shares
 * @property {number}       price
 * @property {number}       value       - shares × price
 * @property {number}       yld
 * @property {number|null}  cagr
 * @property {PayFrequency} payFreq
 * @property {HealthStatus} health
 * @property {boolean}      leveraged
 * @property {string}       name
 * @property {'live'|'local'|'manual'} src
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. HEALTH SCORING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Classify an ETF's risk health based on yield and CAGR.
 *
 * Rules (evaluated in priority order):
 *   CRITICAL → yield > 12% AND cagr < -10%  (yield trap destroying capital)
 *   STABLE   → yield > 3%  AND cagr > 5%    (income + growth)
 *   WARNING  → yield > 10%                  (high yield, needs monitoring)
 *   NEUTRAL  → everything else
 *
 * @param {number}      yld   - Decimal yield (0.12 = 12%)
 * @param {number|null} cagr  - Decimal CAGR (null = unknown)
 * @returns {HealthStatus}
 */
function getHealth(yld, cagr) {
  if (yld > 0.12 && cagr !== null && cagr < -0.10) return "CRITICAL";
  if (yld > 0.03 && cagr !== null && cagr > 0.05)  return "STABLE";
  if (yld > 0.10)                                    return "WARNING";
  return "NEUTRAL";
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. PROJECTION ENGINE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compound projection with monthly granularity.
 *
 * Each month:
 *   portfolio += portfolio × monthlyGrowthRate
 *             + contribution (if not in pause window)
 *             + dividends    (if DRIP enabled)
 *
 * Crash scenario: portfolio starts reduced by crash% in Year 1.
 * Pause scenario: contributions skipped for first `pause` months.
 *
 * @param {ProjectionParams} params
 * @returns {ProjectionRow[]}
 */
function project(params) {
  const {
    capital, monthly, cagr, yld, drip, years,
    crash = 0, pause = 0,
    taxRate = 0,
    totalMonthlyExpenses = 0,
  } = params;

  const safeYears = Math.max(1, Math.min(50, Math.floor(years)));
  const safeYield = Math.max(0, Math.min(0.50, Number.isFinite(yld) ? yld : 0));
  const safeCagr = Math.max(-0.50, Math.min(0.50, Number.isFinite(cagr) ? cagr : 0));
  const safeMonthly = Math.max(0, Number.isFinite(monthly) ? monthly : 0);
  const safeTaxRate = Math.max(0, Math.min(1, Number.isFinite(taxRate) ? taxRate : 0));

  let portfolioValue = Math.max(0, Number.isFinite(capital) ? capital : 0);
  if (crash > 0) portfolioValue = portfolioValue * (1 - Math.min(1, crash / 100));

  let cumulativeContributions = Math.max(0, Number.isFinite(capital) ? capital : 0);
  let cumulativeDividends = 0;
  const rows = [];

  for (let year = 1; year <= safeYears; year += 1) {
    const contributionMonthsThisYear = year === 1
      ? Math.max(0, 12 - Math.min(12, pause))
      : (pause > (year - 1) * 12 ? Math.max(0, 12 - (pause - (year - 1) * 12)) : 12);

    const yearlyContribution = safeMonthly * contributionMonthsThisYear;
    portfolioValue += yearlyContribution;
    cumulativeContributions += yearlyContribution;

    const grossAnnualDividend = portfolioValue * safeYield;
    const netAnnualDividend = grossAnnualDividend * (1 - safeTaxRate);
    cumulativeDividends += netAnnualDividend;

    if (drip) {
      portfolioValue += netAnnualDividend;
    }

    portfolioValue = portfolioValue * (1 + safeCagr);
    portfolioValue = Math.max(0, portfolioValue);

    const monthlyDividendIncome = Math.round(netAnnualDividend / 12);
    const annualDividendIncome = Math.round(netAnnualDividend);
    const expensesCoveredPercent =
      totalMonthlyExpenses > 0
        ? Math.min(100, Math.round((monthlyDividendIncome / totalMonthlyExpenses) * 100))
        : -1;

    rows.push({
      year,
      portfolio: Math.round(portfolioValue),
      monthly: monthlyDividendIncome,
      annualDividendIncome,
      cumulativeContributions: Math.round(cumulativeContributions),
      cumulativeDividends: Math.round(cumulativeDividends),
      expensesCoveredPercent,
    });
  }

  return rows;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. BLENDED PORTFOLIO METRICS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate value-weighted blended yield and CAGR across all holdings.
 *
 * @param {EnrichedHolding[]} enriched
 * @returns {{ totalVal: number, bYield: number, bCagr: number, monthlyIncome: number }}
 */
function blendedMetrics(enriched) {
  const totalVal = enriched.reduce((s, h) => s + h.value, 0);
  if (totalVal === 0) return { totalVal: 0, bYield: 0, bCagr: 0, monthlyIncome: 0 };

  const bYield = enriched.reduce((s, h) => s + h.yld  * (h.value / totalVal), 0);
  const bCagr  = enriched.reduce((s, h) => s + (h.cagr || 0) * (h.value / totalVal), 0);
  const monthlyIncome = Math.round((totalVal * bYield) / 12);

  return { totalVal, bYield, bCagr, monthlyIncome };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. RISK SCORE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Portfolio-level risk score 0–10.
 *
 * Scoring logic (per holding, value-weighted):
 *   Leveraged ETF    → 9
 *   Yield > 15%      → 8
 *   Yield > 10%      → 6
 *   Yield < 1%       → 4  (low income, not necessarily low risk)
 *   Otherwise        → 3
 *
 * @param {EnrichedHolding[]} enriched
 * @returns {number} 0–10, one decimal place
 */
function riskScore(enriched) {
  const totalVal = enriched.reduce((s, h) => s + h.value, 0);
  if (!enriched.length || totalVal === 0) return 5;

  const raw = enriched.reduce((s, h) => {
    let r = 3;
    if (h.leveraged)    r = 9;
    else if (h.yld > 0.15) r = 8;
    else if (h.yld > 0.10) r = 6;
    else if (h.yld < 0.01) r = 4;
    return s + r * (h.value / totalVal);
  }, 0);

  return Math.round(raw * 10) / 10;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. FREEDOM YEAR DETECTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Find the first year where monthly dividend income meets or exceeds target.
 *
 * @param {ProjectionRow[]} rows
 * @param {number}          targetMonthly - USD/month
 * @returns {number|null}   Calendar year, or null if never reached
 */
function findFreedomYear(rows, targetMonthly) {
  const found = rows.find(r => r.monthly >= targetMonthly);
  return found ? found.year : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. PAYDAY CALENDAR
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Distribute estimated monthly income across 4 calendar weeks.
 *
 * Distribution rules:
 *   Weekly payers   → split evenly across all 4 weeks
 *   Monthly payers  → assigned to week (holdingIndex % 4)
 *   Quarterly payers→ assigned to week (ticker.charCodeAt(0) % 4)
 *   Annual payers   → week 0
 *
 * @param {EnrichedHolding[]} enriched
 * @returns {PaydayWeek[]} Array of 4 week objects
 */
function buildPaydayCalendar(enriched) {
  const WEEK_LABELS = [
    "Week 1 (1–7)",
    "Week 2 (8–14)",
    "Week 3 (15–21)",
    "Week 4 (22–31)",
  ];
  const paydays = [0, 0, 0, 0];

  enriched.forEach((h, idx) => {
    const annualIncome  = h.value * h.yld;
    const monthlyIncome = annualIncome / 12;

    if (h.payFreq === "weekly") {
      const weeklyIncome = monthlyIncome / 4;
      for (let i = 0; i < 4; i++) paydays[i] += weeklyIncome;
    } else if (h.payFreq === "monthly") {
      paydays[idx % 4] += monthlyIncome;
    } else if (h.payFreq === "quarterly") {
      paydays[h.ticker.charCodeAt(0) % 4] += monthlyIncome;
    } else {
      // annual → week 0
      paydays[0] += monthlyIncome;
    }
  });

  return WEEK_LABELS.map((label, i) => ({
    label,
    amount: Math.round(paydays[i]),
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. SPARKLINE TREND
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Determine trend direction from a price series.
 *
 * @param {number[]} prices  - Ordered price points (oldest → newest)
 * @returns {'up'|'down'|'flat'}
 */
function sparklineTrend(prices) {
  if (!prices || prices.length < 2) return "flat";
  const first = prices[0];
  const last  = prices[prices.length - 1];
  if (last > first * 1.001) return "up";
  if (last < first * 0.999) return "down";
  return "flat";
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. MILESTONE PROGRESS
// ─────────────────────────────────────────────────────────────────────────────

const MILESTONE_TIERS = [
  { id: "coffee",      label: "Coffee & Streaming", target: 50,   icon: "☕" },
  { id: "groceries",   label: "Groceries",           target: 400,  icon: "🛒" },
  { id: "housing",     label: "Basic Housing",       target: 1500, icon: "🏠" },
  { id: "independence",label: "Full Independence",   target: null, icon: "🏆", isDynamic: true },
];

/**
 * Calculate milestone completion for a given income level.
 *
 * @param {number} monthlyIncome  - Current monthly dividend income
 * @param {number} userTarget     - User's full independence target
 * @returns {{ id: string, label: string, target: number, pct: number, reached: boolean }[]}
 */
function milestonesProgress(monthlyIncome, userTarget) {
  return MILESTONE_TIERS.map(m => {
    const target = m.isDynamic ? userTarget : m.target;
    const pct    = Math.min((monthlyIncome / target) * 100, 100);
    return {
      ...m,
      target,
      pct:     Math.round(pct * 10) / 10,
      reached: monthlyIncome >= target,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. CACHE TTL VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Check whether a cached entry is still valid (< 24 hours old).
 *
 * @param {{ ts: number, data: any } | null} entry
 * @param {number} [nowMs]  - Injectable for testing (default: Date.now())
 * @returns {boolean}
 */
function isCacheValid(entry, nowMs = Date.now()) {
  if (!entry || typeof entry.ts !== "number") return false;
  return nowMs - entry.ts < CACHE_TTL_MS;
}

/**
 * Create a fresh cache entry.
 *
 * @param {any}    data
 * @param {number} [nowMs]
 * @returns {{ ts: number, data: any }}
 */
function makeCacheEntry(data, nowMs = Date.now()) {
  return { ts: nowMs, data };
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  getHealth,
  project,
  blendedMetrics,
  riskScore,
  findFreedomYear,
  buildPaydayCalendar,
  sparklineTrend,
  milestonesProgress,
  isCacheValid,
  makeCacheEntry,
  MILESTONE_TIERS,
  CACHE_TTL_MS,
};
