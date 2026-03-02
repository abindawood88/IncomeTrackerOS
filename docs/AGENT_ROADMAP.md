# Dividend Freedom Pro — AI Agent Build Roadmap
## Autonomous Development Guide for Claude Codex / OpenAI Codex

> **Purpose:** This document enables an AI coding agent to deliver Dividend Freedom Pro
> as a production-grade Next.js 14 SaaS with minimum human input.
> Every phase has unambiguous acceptance criteria, file paths, and test requirements.

---

## Project Identity

| Field          | Value                                                       |
|----------------|-------------------------------------------------------------|
| Product        | Dividend Freedom Pro                                        |
| Domain         | Dividend income projection & financial independence tracking|
| Stack          | Next.js 14 (App Router) · TypeScript · Tailwind · Recharts |
| Auth           | Clerk.dev (free tier)                                       |
| Data           | FMP API (primary) + StockAnalysis.com scrape (fallback)     |
| DB             | Supabase (Postgres + Row-Level Security)                    |
| Payments       | Stripe (optional, Phase 5)                                  |
| Deploy         | Vercel                                                      |
| Test runner    | Node built-in (engine), Playwright (E2E)                    |

---

## Directory Structure (target state)

```
dividend-freedom-pro/
├── app/
│   ├── layout.tsx                 # Root layout: fonts, Clerk, Analytics
│   ├── page.tsx                   # Marketing landing page
│   ├── onboard/page.tsx           # Onboarding wizard
│   ├── dashboard/
│   │   ├── layout.tsx             # Sidebar layout wrapper
│   │   ├── page.tsx               # Dashboard redirect → /dashboard/overview
│   │   ├── overview/page.tsx      # KPI cards + charts
│   │   ├── portfolio/page.tsx     # Holdings + allocation tabs
│   │   ├── calendar/page.tsx      # Payday calendar
│   │   ├── scenarios/page.tsx     # Scenario lab
│   │   └── projections/page.tsx   # 30-year table
│   └── api/
│       ├── fetch-ticker/route.ts  # Server Action: FMP + StockAnalysis proxy
│       ├── validate-key/route.ts  # Server Action: key validation
│       └── webhooks/
│           └── stripe/route.ts    # Stripe webhook (Phase 5)
├── components/
│   ├── ui/                        # Primitive UI atoms
│   │   ├── GlassCard.tsx
│   │   ├── MetricCard.tsx
│   │   ├── Sparkline.tsx
│   │   ├── HealthBadge.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── Toggle.tsx
│   │   └── Spinner.tsx
│   ├── charts/
│   │   ├── ProjectionChart.tsx    # Recharts AreaChart
│   │   ├── MonthlyBarChart.tsx    # Payday calendar bars
│   │   └── SparklineCell.tsx      # Table sparkline
│   ├── layout/
│   │   ├── Sidebar.tsx            # Glassmorphism nav
│   │   └── TopBar.tsx
│   ├── portfolio/
│   │   ├── HoldingsTable.tsx
│   │   ├── AddHoldingForm.tsx
│   │   └── AllocationEditor.tsx
│   ├── onboard/
│   │   ├── StrategySelector.tsx
│   │   ├── FMPKeyPanel.tsx
│   │   └── ProfileForm.tsx
│   ├── dashboard/
│   │   ├── KPIGrid.tsx
│   │   ├── MilestoneStack.tsx
│   │   └── FreedomYearDisplay.tsx
│   └── calendar/
│       ├── WeeklyPaydayGrid.tsx
│       └── FrequencyBreakdown.tsx
├── lib/
│   ├── engine.ts                  # Pure functions (ported from engine.js)
│   ├── etf-db.ts                  # Local ETF fallback database
│   ├── fetch-ticker.ts            # Client-side caller for /api/fetch-ticker
│   ├── cache.ts                   # localStorage 24h cache hook
│   ├── store.ts                   # Zustand global state
│   └── constants.ts               # STRATS, MILESTONES, CACHE_TTL
├── src/
│   ├── engine.js                  # ← PROVIDED (pure logic, CommonJS)
│   └── types.ts                   # ← PROVIDED (TypeScript interfaces)
├── tests/
│   ├── engine.test.js             # ← PROVIDED (93 tests, all passing)
│   └── e2e/
│       ├── onboarding.spec.ts
│       ├── portfolio.spec.ts
│       └── projections.spec.ts
├── public/
│   └── favicon.ico
├── tailwind.config.ts
├── tsconfig.json
├── next.config.ts
├── package.json                   # ← PROVIDED
└── .env.local.example
```

---

## Environment Variables

```bash
# .env.local (agent must create .env.local.example, never commit actual values)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...         # Server only, never expose
ANTHROPIC_API_KEY=sk-ant-...        # Used in /api/fetch-ticker server route
STRIPE_SECRET_KEY=sk_test_...       # Phase 5
STRIPE_WEBHOOK_SECRET=whsec_...     # Phase 5
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Tailwind Config (exact tokens to use)

```ts
// tailwind.config.ts
const config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg:     { DEFAULT:"#060b12", 1:"#0a1220", 2:"#0f1a2e", 3:"#152038" },
        gold:   { DEFAULT:"#c9a227", light:"#f0c842", dim:"rgba(201,162,39,0.12)" },
        teal:   { DEFAULT:"#00b4a0", light:"#00d4be", dim:"rgba(0,180,160,0.1)" },
        purple: { DEFAULT:"#9b6dff", light:"#c4a0ff", dim:"rgba(155,109,255,0.1)" },
        danger: "#e05252",
        muted:  "#4a6080",
        textDim:"#c8ddf0",
        textBright:"#e8f4ff",
        border: "rgba(255,255,255,0.07)",
      },
      fontFamily: {
        serif: ["DM Serif Display", "serif"],
        mono:  ["DM Mono", "monospace"],
        sans:  ["Inter", "sans-serif"],
      },
      backdropBlur: { glass: "24px" },
      animation: {
        "fade-up": "fadeSlideUp 0.45s ease both",
        "spin-slow":"spin 0.7s linear infinite",
        "pulse-dot":"pulse 1s ease-in-out infinite",
      },
    },
  },
};
```

---

## Phase 0 — Foundation Setup

**Agent instructions:** Do this first, in order, before writing any feature code.

### 0.1 Project scaffold
```bash
npx create-next-app@14 dividend-freedom-pro \
  --typescript --tailwind --eslint --app --src-dir=false
cd dividend-freedom-pro
```

### 0.2 Install dependencies
```bash
npm install recharts clsx @clerk/nextjs @supabase/supabase-js zustand
npm install -D playwright @playwright/test nodemon
npx playwright install chromium
```

### 0.3 Copy provided files
- Copy `src/engine.js` → `src/engine.js` (keep as CommonJS for test runner)
- Copy `src/types.ts` → `lib/types.ts`
- Copy `tests/engine.test.js` → `tests/engine.test.js`
- Copy `package.json` scripts section into project package.json

### 0.4 Verify engine tests pass
```bash
npm test
# Expected: 93/93 passed | 0 failed
# If any fail: DO NOT PROCEED. Fix engine.js first.
```

### 0.5 Port engine to TypeScript
Create `lib/engine.ts` that re-exports from `src/engine.js` with TypeScript types:
```ts
// lib/engine.ts
export type { ... } from "./types";
// Re-export all functions from engine.js with proper TS signatures
import * as _engine from "../src/engine.js";
export const getHealth       = _engine.getHealth       as (yld: number, cagr: number | null) => HealthStatus;
export const project         = _engine.project         as (params: ProjectionParams) => ProjectionRow[];
export const blendedMetrics  = _engine.blendedMetrics  as (holdings: EnrichedHolding[]) => BlendedMetrics;
export const riskScore       = _engine.riskScore       as (holdings: EnrichedHolding[]) => number;
export const findFreedomYear = _engine.findFreedomYear as (rows: ProjectionRow[], target: number) => number | null;
export const buildPaydayCalendar = _engine.buildPaydayCalendar as (holdings: EnrichedHolding[]) => PaydayWeek[];
export const sparklineTrend  = _engine.sparklineTrend  as (prices: number[]) => "up" | "down" | "flat";
export const milestonesProgress  = _engine.milestonesProgress  as (income: number, target: number) => MilestoneResult[];
export const isCacheValid    = _engine.isCacheValid    as (entry: CacheEntry | null, now?: number) => boolean;
export const makeCacheEntry  = _engine.makeCacheEntry  as <T>(data: T, now?: number) => CacheEntry<T>;
```

### 0.6 ETF local database
Create `lib/etf-db.ts` with full ETF_DB record (copy from the JSX, add MSTW + HOOW entries):
```ts
export const ETF_DB: Record<string, ETFRecord> = {
  SCHD: { ticker:"SCHD", price:82.4,  yield:0.035, cagr:0.110, name:"Schwab US Dividend Equity",       leveraged:false, payFreq:"quarterly", sparkline:[79.1,80.3,81.2,80.8,82.1,81.9,82.4,83.1,82.8,83.5,82.9,82.4], health:"STABLE", source:"local" },
  JEPI: { ticker:"JEPI", price:58.1,  yield:0.087, cagr:0.060, name:"JPMorgan Equity Premium Income",   leveraged:false, payFreq:"monthly",   sparkline:[56.2,56.8,57.4,57.1,58.0,57.8,58.3,58.1,57.9,58.4,58.2,58.1], health:"STABLE", source:"local" },
  VYM:  { ticker:"VYM",  price:118.9, yield:0.029, cagr:0.092, name:"Vanguard High Dividend Yield",     leveraged:false, payFreq:"quarterly", sparkline:[115.2,116.1,117.0,116.5,117.8,118.2,118.9,119.4,118.8,119.2,118.7,118.9], health:"NEUTRAL", source:"local" },
  QYLD: { ticker:"QYLD", price:17.8,  yield:0.120, cagr:0.030, name:"Global X Nasdaq 100 Covered Call", leveraged:false, payFreq:"monthly",   sparkline:[18.2,18.0,17.8,17.6,17.5,17.9,18.1,17.8,17.6,17.7,17.8,17.8], health:"WARNING", source:"local" },
  DIVO: { ticker:"DIVO", price:42.3,  yield:0.048, cagr:0.085, name:"Amplify CWP Enhanced Dividend",    leveraged:false, payFreq:"monthly",   sparkline:[40.1,40.8,41.2,41.6,42.0,41.8,42.3,42.5,42.1,42.4,42.2,42.3], health:"STABLE",  source:"local" },
  TQQQ: { ticker:"TQQQ", price:62.5,  yield:0.000, cagr:0.220, name:"ProShares UltraPro QQQ (3x)",      leveraged:true,  payFreq:"quarterly", sparkline:[55.0,58.2,61.0,59.5,63.2,60.1,64.8,62.5,65.1,61.2,62.5,62.5], health:"NEUTRAL", source:"local" },
  SPHD: { ticker:"SPHD", price:44.1,  yield:0.042, cagr:0.073, name:"Invesco S&P 500 Hi Div Low Vol",   leveraged:false, payFreq:"monthly",   sparkline:[42.5,43.0,43.4,43.2,43.8,44.1,44.3,44.0,44.2,44.5,44.1,44.1], health:"STABLE",  source:"local" },
  VIG:  { ticker:"VIG",  price:188.2, yield:0.018, cagr:0.103, name:"Vanguard Dividend Appreciation",   leveraged:false, payFreq:"quarterly", sparkline:[183,184,185,185,186,187,188,189,188,189,188,188], health:"NEUTRAL", source:"local" },
  DVY:  { ticker:"DVY",  price:121.3, yield:0.038, cagr:0.075, name:"iShares Select Dividend",          leveraged:false, payFreq:"quarterly", sparkline:[118,119,120,119,120,121,122,121,121,122,121,121], health:"STABLE",  source:"local" },
  TSLY: { ticker:"TSLY", price:14.2,  yield:0.180, cagr:0.050, name:"YieldMax TSLA Option Income",      leveraged:false, payFreq:"monthly",   sparkline:[15.1,14.8,14.5,14.2,13.9,14.1,14.4,14.3,14.1,14.0,14.2,14.2], health:"WARNING", source:"local" },
  MSFO: { ticker:"MSFO", price:22.1,  yield:0.150, cagr:0.040, name:"YieldMax MSFT Option Income",      leveraged:false, payFreq:"monthly",   sparkline:[23.0,22.8,22.5,22.2,22.0,22.3,22.5,22.2,22.0,22.1,22.1,22.1], health:"WARNING", source:"local" },
  MSTW: { ticker:"MSTW", price:24.8,  yield:0.095, cagr:0.072, name:"MST Balanced",                    leveraged:false, payFreq:"monthly",   sparkline:[23.5,23.8,24.1,24.3,24.6,24.5,24.8,24.9,24.7,24.8,24.8,24.8], health:"STABLE",  source:"local" },
  HOOW: { ticker:"HOOW", price:18.5,  yield:0.110, cagr:0.058, name:"HOOW Income ETF",                  leveraged:false, payFreq:"monthly",   sparkline:[17.8,18.0,18.1,18.3,18.4,18.3,18.5,18.6,18.4,18.5,18.5,18.5], health:"WARNING", source:"local" },
};
```

**Acceptance criteria Phase 0:**
- [ ] `npm test` → 93/93 pass
- [ ] `npm run dev` starts without errors
- [ ] TypeScript compilation clean (`npx tsc --noEmit`)

---

## Phase 1 — Server API Layer

**Goal:** Secure server-side ticker data fetching. The FMP key must NEVER leave the server.

### 1.1 `/api/fetch-ticker/route.ts`

```ts
// POST body: { tickers: string[], fmpKey: string }
// Returns:   { results: LiveData[] }
```

**Logic (exact order):**
1. Validate request: `tickers` is array of 1–20 strings, `fmpKey` is non-empty string.
2. For each ticker (run in `Promise.allSettled` — never let one failure block others):
   a. Call FMP `/v3/profile/{TICKER}?apikey={fmpKey}`
   b. Call FMP `/v3/key-metrics-ttm/{TICKER}?apikey={fmpKey}`
   c. If both succeed and return data with a valid `price` field → return `LiveData` with `source: "live"`
   d. **Fallback:** If FMP fails or returns empty → call Anthropic API with web_search tool targeting `https://stockanalysis.com/etf/{ticker}/dividend/`
   e. Parse Anthropic response for JSON with `{ ticker, name, price, yield, cagr, payFreq }`
   f. If all fail → return `{ ticker, source: "error", error: "All sources failed" }`
3. Return all results, including errors. Client handles per-ticker status.

**Rate limiting:** Add basic in-memory rate limit: max 10 requests/minute per IP.

**Security rules:**
- Never log the FMP key
- Never expose the ANTHROPIC_API_KEY in any client bundle
- Sanitize ticker input: uppercase, alphanumeric only, max 6 chars

### 1.2 `/api/validate-key/route.ts`

```ts
// POST body: { fmpKey: string }
// Returns:   { valid: boolean, testTicker: "SCHD", price?: number }
```

Calls FMP profile for SCHD only. Returns valid=true if price is a positive number.

### Acceptance criteria Phase 1:
- [ ] `curl -X POST localhost:3000/api/validate-key -d '{"fmpKey":"demo"}' -H "Content-Type:application/json"` returns valid JSON
- [ ] Ticker with spaces or SQL chars is rejected with 400
- [ ] FMP key is NOT visible in browser Network tab for any request
- [ ] MSTW and HOOW return data (via StockAnalysis fallback)

---

## Phase 2 — State Management

### 2.1 Zustand store (`lib/store.ts`)

Create a single global store with these slices:

```ts
interface DFPStore {
  // Goal slice
  goal: UserGoal;
  setGoal: (patch: Partial<UserGoal>) => void;

  // Auth / API
  fmpKey: string;
  keyStatus: "idle"|"validating"|"ok"|"error";
  setFmpKey: (key: string) => void;
  setKeyStatus: (s: DFPStore["keyStatus"]) => void;

  // Holdings
  holdings: RawHolding[];
  addHolding:    (h: Omit<RawHolding,"fetchStatus"|"live">) => void;
  removeHolding: (ticker: string) => void;
  updateHolding: (ticker: string, patch: Partial<RawHolding>) => void;
  applyLiveData: (ticker: string, data: LiveData) => void;

  // Allocations
  allocs: { ticker: string; w: number }[];
  setAllocs: (allocs: DFPStore["allocs"]) => void;

  // Scenario
  crash: number;
  pause: number;
  setCrash: (n: number) => void;
  setPause: (n: number) => void;

  // Derived (computed via selectors, not stored)
  // Use: useDerivedMetrics() custom hook instead
}
```

### 2.2 Custom hook: `useDerivedMetrics()`

```ts
// Returns all computed values from pure engine functions
// Memoized with useMemo — only recalculates when holdings/goal change
export function useDerivedMetrics() {
  const { goal, holdings } = useDFPStore();
  return useMemo(() => {
    const enriched     = enrichHoldings(holdings);
    const metrics      = blendedMetrics(enriched);
    const score        = riskScore(enriched);
    const projData     = project({ ...metrics, ...goal, capital: metrics.totalVal || goal.capital });
    const freedomYr    = findFreedomYear(projData, goal.targetIncome);
    const coverage     = Math.min(Math.round((metrics.monthlyIncome / goal.targetIncome) * 100), 100);
    const paydayData   = buildPaydayCalendar(enriched);
    const milestones   = milestonesProgress(metrics.monthlyIncome, goal.targetIncome);
    return { enriched, ...metrics, score, projData, freedomYr, coverage, paydayData, milestones };
  }, [goal, holdings]);
}
```

### 2.3 24h localStorage cache (`lib/cache.ts`)

```ts
// Wraps useLocalStorage with TTL logic using isCacheValid + makeCacheEntry from engine
export function useLiveCache() {
  const [cache, setCache] = useLocalStorage<Record<string, CacheEntry<LiveData>>>("dfp_cache_v3", {});

  const get    = (ticker: string) => { const e = cache[ticker]; return isCacheValid(e) ? e.data : null; };
  const set    = (ticker: string, data: LiveData) => setCache({ ...cache, [ticker]: makeCacheEntry(data) });
  const clear  = () => setCache({});
  const count  = () => Object.values(cache).filter(isCacheValid).length;

  return { get, set, clear, count };
}
```

### Acceptance criteria Phase 2:
- [ ] Goal changes in store immediately reflect in projection chart without page refresh
- [ ] Adding/removing a holding re-renders the dashboard KPIs
- [ ] Clearing cache resets all `fetchStatus` to `"idle"`
- [ ] Store persists across page navigation (Next.js App Router)

---

## Phase 3 — UI Components

Build in this exact order (each depends on the previous):

### 3.1 Primitive atoms (`components/ui/`)

| Component     | Props                                              | Notes                                      |
|---------------|----------------------------------------------------|--------------------------------------------|
| GlassCard     | children, className                               | backdrop-blur-glass, bg-bg-2/70, border    |
| AccentBar     | color: string                                     | 3px left border, full height               |
| MetricCard    | label, val, sub, color, animIndex (1–8)           | stagger-{n} animation class                |
| HealthBadge   | health: HealthStatus                              | CRITICAL=red, STABLE=teal, WARN=gold, etc  |
| ProgressBar   | value (0–100), color, height, animated            | CSS transition width                       |
| Toggle        | checked, onChange, label                          | Gold when on                               |
| Spinner       | size?, color?                                     | CSS spin animation                         |
| Sparkline     | data: number[], width, height                     | SVG polyline, teal=up, red=down            |

### 3.2 Layout (`components/layout/`)

**Sidebar.tsx:**
- Glassmorphism: `backdrop-blur-glass bg-bg-1/85 border-r border-border`
- Collapsible: wide (220px) ↔ icon-only (64px), state in localStorage
- Nav items: Dashboard · Portfolio · Calendar · Scenarios · Projections
- Bottom section: live count badge, cache clear button, strategy pill
- Active item: left gold border + gold text + gold bg-dim

**TopBar.tsx:**
- Title (from current route)
- FMP status badge (live/offline)
- Settings button → opens modal or navigates to /onboard

### 3.3 Charts (`components/charts/`)

**ProjectionChart.tsx:**
```tsx
// Props: projData: ProjectionRow[], target: number, color: string
// Uses: Recharts AreaChart + ResponsiveContainer
// Must have: ReferenceLine at target, custom tooltip, gradient fill
// Tooltip format: year / monthly income / portfolio value
```

**MonthlyBarChart.tsx:**
```tsx
// Props: payments: { mo: string, amount: number }[]
// 12 columns, teal=monthly payouts, gold=quarterly months (i%3===2)
// Height proportional to max payment
```

### 3.4 Portfolio components (`components/portfolio/`)

**HoldingsTable.tsx** — columns in order:
Ticker | Company | Sparkline | Shares | Price | Value | Yield | Source | Health | CAGR | [sync] | [delete]

- `● FMP` badge (teal) for live, `DB` badge (gold) for local
- Sync button (per row, only if keyStatus=ok): calls `/api/fetch-ticker` for that one ticker
- CAGR: shows DB value in teal, or number input if unknown
- Leveraged flag shows ⚠ next to CAGR

**AddHoldingForm.tsx:**
- Ticker (auto-uppercase), Shares, Avg Cost fields
- Suggested ticker chips from active strategy
- Enter key triggers add

### 3.5 Dashboard components (`components/dashboard/`)

**MilestoneStack.tsx:**
```tsx
// Renders all 4 milestones from milestonesProgress()
// Each milestone: icon + label + target + ProgressBar + ✓ when reached
// Animation: bars fill on mount
```

**KPIGrid.tsx:**
```tsx
// 8 MetricCards in 2 rows of 4
// Row 1: Monthly Income · Coverage % · Portfolio Value · Risk Score
// Row 2: Strategy · Blended CAGR · Blended Yield · Freedom Year
// Each card gets animIndex for stagger
```

### Acceptance criteria Phase 3:
- [ ] All 8 KPI cards animate in with stagger on initial render
- [ ] Sparklines show correct up/down color for SCHD vs TSLY
- [ ] Sidebar collapses to icons on mobile (< 768px), auto-collapses
- [ ] HealthBadge shows CRITICAL in red for QYLD scenario (yield=12%, cagr=-15%)
- [ ] Progress bars animate on first render

---

## Phase 4 — Pages & Routes

### 4.1 Onboarding (`app/onboard/page.tsx`)

Three-step wizard:
1. **Strategy selector** — 3 cards (Income/Growth/Hyper), click to select
2. **FMP key panel** — password input + validate button + live fetch log
3. **Financial profile** — targetIncome, capital, monthly, years, DRIP toggle

On submit: save to Zustand store → redirect to `/dashboard/overview`

### 4.2 Dashboard overview (`app/dashboard/overview/page.tsx`)

Layout: `<KPIGrid>` + `<MilestoneStack>` + `<ProjectionChart>` + payday preview strip

Payday strip: 4 week boxes showing estimated weekly income

### 4.3 Portfolio (`app/dashboard/portfolio/page.tsx`)

Tab switcher: Holdings | Allocation

Holdings tab:
1. FMPKeyPanel (compact mode)
2. "Refresh All" button (only if keyStatus=ok)
3. AddHoldingForm
4. HoldingsTable

Allocation tab:
- Editable table: Ticker | Weight % | Est. Value | DB Yield | [delete]
- Total must sum to 100% (show error if not)
- Add row button

### 4.4 Payday Calendar (`app/dashboard/calendar/page.tsx`)

Sections:
1. 3 summary MetricCards: Monthly Income · Annual Income · Active Holdings
2. WeeklyPaydayGrid (4 columns, this month's estimate)
3. MonthlyBarChart (12-month forecast)
4. FrequencyBreakdown (3 columns: monthly/quarterly/annual payers)

### 4.5 Scenario Lab (`app/dashboard/scenarios/page.tsx`)

Two sliders in GlassCards:
- Market Crash: 0–80%, shows red warning when > 0
- Contribution Pause: 0–60 months, shows gold info when > 0

Below: ProjectionChart (reactive to sliders) + outcome metrics

### 4.6 Projections (`app/dashboard/projections/page.tsx`)

- ProjectionChart (full width)
- Year-by-year data table (all 30 years, expandable)
- Freedom year row highlighted in gold
- vs Target progress bars per row

### Acceptance criteria Phase 4:
- [ ] All 5 dashboard routes render without hydration errors
- [ ] Onboarding → Portfolio → Calendar navigation works
- [ ] Scenario sliders update chart in real-time (no lag)
- [ ] Freedom year row is highlighted and scrolled to when table expands

---

## Phase 5 — Auth & Persistence (Clerk + Supabase)

### 5.1 Clerk authentication

```tsx
// app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";
// Wrap entire app
// Add sign-in/sign-up routes: /sign-in [[...sign-in]] /sign-up [[...sign-up]]
// Protect /dashboard/* with middleware.ts
```

```ts
// middleware.ts
import { authMiddleware } from "@clerk/nextjs";
export default authMiddleware({ publicRoutes: ["/", "/onboard", "/api/validate-key"] });
```

### 5.2 Supabase schema

```sql
-- Run in Supabase SQL editor

CREATE TABLE user_goals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL,                    -- Clerk user ID
  target_income INT NOT NULL DEFAULT 5000,
  capital     INT NOT NULL DEFAULT 100000,
  monthly     INT NOT NULL DEFAULT 2000,
  drip        BOOLEAN NOT NULL DEFAULT true,
  years       INT NOT NULL DEFAULT 30,
  strategy    TEXT NOT NULL DEFAULT 'income',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE holdings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL,
  ticker      TEXT NOT NULL,
  shares      NUMERIC(12,4) NOT NULL,
  avg_cost    NUMERIC(12,4) NOT NULL DEFAULT 0,
  cagr_override NUMERIC(6,4),                   -- NULL = use ETF_DB
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE allocations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL,
  ticker      TEXT NOT NULL,
  weight      NUMERIC(5,2) NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Row-Level Security
ALTER TABLE user_goals  ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own goals"    ON user_goals    FOR ALL USING (user_id = auth.uid()::text);
CREATE POLICY "Users see own holdings" ON holdings      FOR ALL USING (user_id = auth.uid()::text);
CREATE POLICY "Users see own allocs"   ON allocations   FOR ALL USING (user_id = auth.uid()::text);
```

### 5.3 Sync pattern

```ts
// lib/sync.ts
// On load: fetch from Supabase → hydrate Zustand store
// On change: debounce 1500ms → upsert to Supabase
// Conflict resolution: last-write-wins (updatedAt timestamp)
```

### Acceptance criteria Phase 5:
- [ ] Unauthenticated users redirected to /sign-in from /dashboard/*
- [ ] Holdings persist after browser refresh
- [ ] Two browser windows stay in sync within 5 seconds
- [ ] RLS prevents user A from reading user B's data (verify via Supabase SQL)

---

## Phase 6 — E2E Tests (Playwright)

Create `tests/e2e/` with these test files:

### `onboarding.spec.ts`
```ts
test("completes onboarding and reaches dashboard", async ({ page }) => {
  await page.goto("/onboard");
  await page.click('[data-testid="strategy-income"]');
  await page.fill('[data-testid="target-income"]', "5000");
  await page.fill('[data-testid="capital"]', "100000");
  await page.fill('[data-testid="monthly"]', "2000");
  await page.click('[data-testid="launch-btn"]');
  await expect(page).toHaveURL("/dashboard/overview");
  await expect(page.locator('[data-testid="kpi-monthly-income"]')).toBeVisible();
});
```

### `portfolio.spec.ts`
```ts
test("adds a holding and sees it in the table", async ({ page }) => { ... });
test("deletes a holding and table updates", async ({ page }) => { ... });
test("CAGR override input appears for unknown tickers", async ({ page }) => { ... });
```

### `projections.spec.ts`
```ts
test("freedom year updates when target income changes", async ({ page }) => { ... });
test("crash slider reduces final portfolio value", async ({ page }) => { ... });
test("DRIP toggle changes year-30 portfolio value", async ({ page }) => { ... });
```

**All E2E tests must:**
- Use `data-testid` attributes (never CSS classes)
- Run headlessly in CI: `npx playwright test --reporter=list`
- Pass without a real FMP key (use mock API route for tests)

---

## Phase 7 — Polish & Production

### 7.1 Performance
- [ ] `next/image` for any images
- [ ] `React.lazy` + `Suspense` for chart components
- [ ] Recharts imported selectively (tree-shakeable)
- [ ] Lighthouse score ≥ 90 (Performance, Accessibility)

### 7.2 Accessibility
- [ ] All interactive elements have ARIA labels
- [ ] Keyboard navigation works for the sidebar
- [ ] Color contrast ratios meet WCAG AA
- [ ] Screen reader announces freedom year when it changes

### 7.3 Error boundaries
```tsx
// Wrap every page in an ErrorBoundary that shows a recovery UI
// Never let a chart crash kill the whole dashboard
```

### 7.4 Empty states
- No holdings → show "Add your first holding" prompt with strategy suggestions
- API key not set → show inline prompt in portfolio tab
- Freedom year not reachable → show "Adjust your contributions" guidance

### 7.5 Mobile responsive
- Sidebar collapses to bottom tab bar on mobile (< 768px)
- Tables become card lists on mobile
- Charts remain full-width, labels hidden if too dense

---

## Phase 8 — Monetization (Optional)

### Stripe integration

**Free tier:** 3 holdings, local DB only, no persistence
**Pro ($9/month):** Unlimited holdings, FMP live data, Supabase persistence, CSV export
**Team ($29/month):** 5 seats, shared portfolios, advisor notes

```ts
// /api/webhooks/stripe/route.ts
// Handle: checkout.session.completed, customer.subscription.deleted
// Update user_subscriptions table in Supabase
// Gate features via useSubscription() hook
```

---

## CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20" }
      - run: npm ci
      - run: npm test                    # Engine tests (93 tests)
      - run: npx tsc --noEmit            # Type check
      - run: npx next build              # Build check
      - run: npx playwright install chromium
      - run: npx playwright test         # E2E (if PLAYWRIGHT_BASE_URL set)
```

---

## Agent Decision Rules

When the agent encounters ambiguity, apply these rules in order:

1. **Engine logic** — Always defer to `src/engine.js`. Never reimplement projection logic in a component.
2. **Data fallback** — FMP → StockAnalysis → ETF_DB. Never show an error UI if fallback data exists.
3. **Typing** — When in doubt, use `lib/types.ts`. Never use `any`.
4. **State** — All shared state lives in Zustand. No prop drilling beyond 2 levels.
5. **Styling** — Use Tailwind classes from the config. Never add inline styles except for dynamic values (colors, widths from JS).
6. **API calls** — All external API calls go through Next.js API routes. Never from the client directly.
7. **Tests** — After any change to `src/engine.js`, run `npm test`. Fix before committing.
8. **Freedom year** — If null, show "Not reached in X years" in muted color. Never show a fake number.
9. **FMP key** — Never log it, never include it in error messages sent to the client.
10. **Crash scenario** — Never allow crash > 100 or < 0 at the UI level (enforce with input constraints + engine validation).

---

## Completion Checklist

### MVP Definition (minimum to ship)
- [ ] Phase 0: Foundation ✓
- [ ] Phase 1: API routes (fetch-ticker + validate-key) ✓
- [ ] Phase 2: Zustand store + useDerivedMetrics hook ✓
- [ ] Phase 3: All UI components ✓
- [ ] Phase 4: All 5 dashboard pages ✓
- [ ] `npm test` → 93/93 passing ✓
- [ ] `npm run build` → 0 errors ✓
- [ ] Manual test: add MSTW + HOOW, they fetch via StockAnalysis fallback ✓
- [ ] Freedom year visible on dashboard with sample SCHD+JEPI portfolio ✓

### Production-ready (before public launch)
- [ ] Phase 5: Auth + Supabase persistence ✓
- [ ] Phase 6: E2E tests (all 3 suites pass) ✓
- [ ] Phase 7: Lighthouse ≥ 90 ✓
- [ ] Zero TypeScript errors ✓
- [ ] Zero ESLint errors ✓
- [ ] .env.local.example committed (never .env.local) ✓
- [ ] Vercel deployment successful ✓

---

## Key Numbers the Agent Must Know

| Constant            | Value                    | Source              |
|---------------------|--------------------------|---------------------|
| CACHE_TTL_MS        | 86,400,000 (24h)         | engine.js           |
| STABLE yield floor  | > 3% (exclusive)         | getHealth()         |
| STABLE CAGR floor   | > 5% (exclusive)         | getHealth()         |
| CRITICAL yield      | > 12%                    | getHealth()         |
| CRITICAL CAGR       | < -10%                   | getHealth()         |
| WARNING yield       | > 10%                    | getHealth()         |
| Max leveraged cap   | 25% of portfolio         | UI validation       |
| Milestone tiers     | $50 / $400 / $1500 / user| milestonesProgress()|
| Strategy defaults   | Income: 6.2%/7.2%        | STRATS constant     |
|                     | Growth: 9.5%/3.5%        |                     |
|                     | Hyper:  18%/12% (hypothetical) |              |
| Max tickers per fetch| 20                       | API route limit     |
| Risk score range    | 0–10 (1 decimal)         | riskScore()         |

---

*Generated: Dividend Freedom Pro v0.1 — Build this document is the single source of truth for the AI agent.*
*All engine logic is tested and verified. Port the engine functions faithfully — do not optimize or rewrite unless tests still pass.*
