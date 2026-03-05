# Dividend Freedom Pro - Full Build Review (For External AI/Product Review)

## 1) Project Snapshot
- Product: **Dividend Freedom Pro**
- Repo path: `/workspaces/IncomeTrackerOS`
- Stack: **Next.js 14 (App Router), React 18, TypeScript, Zustand, Clerk, Supabase, Recharts**
- Goal: Help users build ETF portfolios for dividend income and estimate their financial freedom timeline.

## 2) Current Product Positioning
Dividend Freedom Pro combines:
- onboarding-driven portfolio setup,
- dividend income projection,
- expense coverage planning,
- dashboard monitoring,
- optional auth + subscription plumbing.

It is primarily a **planning and simulation product**, not brokerage execution.

## 3) What Is Implemented Right Now

### Landing + App Shell
- Landing page and pricing/feature sections.
- Dashboard shell with sidebar/topbar/mobile tab bar.

### Onboarding (recently updated)
- Step 1: Goal definition
  - manual income target OR expense-coverage target
  - starting capital
  - monthly contribution
- Step 2: Freedom target focus + portfolio profile
  - Growth focus:
    - `growth-regular`
    - `growth-mix`
    - `growth-leveraged`
  - Income focus:
    - `income-conservative`
    - `income-blend`
    - `income-highyield`
- Step 3: Portfolio input mode
  - use preselected profile portfolio, OR
  - manual holdings input with per-line validation (`TICKER,SHARES[,AVG_COST]`)

### Core Dashboard
- Overview KPIs, freedom score, milestones, projection chart.
- Portfolio table/editing/allocation workflows.
- Rebalance view.
- Yield tracker view.
- Calendar/payday distribution views.
- Projection tools page with:
  - horizon presets (`10y`, `20y`, `30y`)
  - DRIP on/off factor
  - contribution factor controls

### Scenarios
- Scenarios is intentionally removed from primary navigation.
- `/dashboard/scenarios` currently redirects to `/dashboard/projections`.

### Auth / Sync / Payments
- Clerk auth integration present.
- Supabase sync hooks + persistence logic present.
- Payment provider adapter + checkout/webhook API routes present.

## 4) Technical Architecture

### Frontend
- Next.js App Router pages in `app/`
- UI components grouped in `components/`
- State management via Zustand store in `lib/store.ts`

### Core Domain Logic (Framework-agnostic)
- Projection engine and risk/health logic in `src/engine.js` (typed wrappers in `lib/engine.ts`)
- Derived metrics in `lib/use-derived-metrics.ts`
- Portfolio recommendation logic in `lib/portfolio-recommendation.ts`
- Expense coverage computation in `lib/expense-coverage.ts`

### Data / Integrations
- Local ETF registry: `lib/etf-db.ts`
- Supabase client + sync: `lib/db.ts`, `lib/sync.ts`
- Clerk middleware/auth route usage: `middleware.ts`, API route auth calls
- Payment abstraction: `lib/payments/*`

## 5) Key Routes and API Surface

### App routes
- `/`
- `/onboard`
- `/dashboard/overview`
- `/dashboard/portfolio`
- `/dashboard/rebalance`
- `/dashboard/projections`
- `/dashboard/tracker`
- `/dashboard/yield-tracker`
- `/dashboard/calendar`
- `/dashboard/templates`
- `/dashboard/etfs`
- `/upgrade/*`

### API routes
- `/api/fetch-ticker`
- `/api/etfs`
- `/api/ai-commentary`
- `/api/validate-key`
- `/api/payments/create-checkout`
- `/api/payments/webhook`
- `/api/webhooks/payment`
- `/api/webhooks/stripe`

## 6) Build, Test, and Dev Status
- Typecheck: `npm run typecheck` (passing)
- Tests: `npm test` (passing in current environment)
- Scripts:
  - `npm run dev`
  - `npm run build`
  - `npm run verify`

## 7) Auth / Environment Notes (Important)

### Clerk middleware behavior
- `middleware.ts` only enables Clerk middleware when both env vars exist:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`

### Env file path
- Next.js reads env from **repo root** `.env.local`.
- A file like `components/.env.local` is not consumed by Next runtime.

### Codespaces host/origin issue
- `next.config.mjs` includes `experimental.serverActions.allowedOrigins` for:
  - `localhost:3000`
  - `127.0.0.1:3000`
  - `*.app.github.dev`
- This was added to fix forwarded-host vs origin mismatches in Codespaces.

## 8) Known Risks / Gaps to Review
1. **Onboarding UX consistency**
- Step 3 still exposes legacy preset options while Step 2 now defines profile-based presets.
- Confirm if Step 3 should be simplified to only:
  - “Use selected profile”, or
  - “Enter manual holdings”.

2. **Recommendation coherence vs ETF universe**
- Ensure profile ETF selections always map to intended category/risk semantics.
- Validate that growth profiles avoid redundant index overlap where intended.

3. **Auth fallback behavior**
- Some payment/auth routes now gracefully fallback when Clerk is not configured.
- Confirm desired strictness for production: hard-fail vs fallback.

4. **Security and secret handling**
- Ensure no secrets are committed or shared in docs.
- Reconfirm `.gitignore` and secret rotation practices.

5. **Scenarios deprecation completeness**
- Navigation removed and redirect added.
- Confirm no stale copy/labels or analytics events still expect a standalone scenarios experience.

6. **Test coverage focus gaps**
- Core engine tests are strong.
- UI/onboarding flow assertions are still light; more E2E coverage recommended for:
  - onboarding profile selection,
  - manual holdings validation,
  - projection factor controls.

## 9) What We Want Clouda AI to Review
Please review and return:
1. **Product UX audit**
- Is the onboarding-to-dashboard journey clear and conversion-friendly?
- Are freedom target concepts (income vs growth vs expense coverage) explained well enough?

2. **Model and simulation audit**
- Are projection assumptions and DRIP/contribution controls intuitive and credible for users?
- Any major realism gaps or framing risks?

3. **Information architecture audit**
- Is removing Scenarios and consolidating into Projections the right IA decision?
- Any missing page/module that should exist as first-class route?

4. **Technical risk audit**
- Identify likely production failure points (auth, middleware, env, server actions, payment webhooks).
- Suggest hardening priorities ranked by impact.

5. **Roadmap recommendation**
- Provide a 2-week, 6-week, and 12-week roadmap with concrete milestones.

## 10) Suggested Review Prompt (Copy/Paste)
"Review this Next.js SaaS app build for Dividend Freedom planning. Assess product clarity, onboarding quality, projection logic credibility, architecture robustness, and production readiness. Identify top UX/technical risks and provide prioritized, actionable recommendations with implementation order."

## 11) Current Working Tree Context
This repo is actively under development with a **dirty working tree** and many staged/unstaged changes across app, components, lib, and API routes. Review should assume an in-progress branch rather than a frozen release tag.

---
If needed, I can generate a second file with a strict **release-readiness checklist** (`RELEASE_REVIEW_CHECKLIST.md`) mapped to deployment gates.
