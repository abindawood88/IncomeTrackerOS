# Dividend Freedom Pro

## Product Requirements Document

### Product
Dividend Freedom Pro

### Version
Current working product scope as implemented in the codebase as of February 28, 2026

### Purpose
Dividend Freedom Pro helps users build, review, track, and optimize ETF portfolios designed to generate dividend income. The product is focused on income planning: users define financial goals, receive portfolio suggestions, simulate growth, track real dividend income, and measure how much of their lifestyle expenses dividends can cover.

### Problem
Income-focused investors often use fragmented tools:
- one tool for screening ETFs
- another for tracking holdings
- another for projecting income
- no simple way to connect dividend income to real-life expenses

Users need one product that:
- recommends income-oriented portfolios based on goal and risk
- tracks estimated and actual dividend income
- shows progress toward financial independence
- translates dividend income into real-world bill coverage

### Target Users
1. Dividend-income investors
- Users building portfolios for monthly cash flow

2. ETF income strategy users
- Users interested in covered call ETFs, option-income ETFs, leveraged ETFs, CEFs, and dividend-growth blends

3. Financial independence planners
- Users mapping portfolio income to expense coverage and long-term freedom goals

4. DIY retail investors
- Users who want editable templates, not black-box portfolio automation

### Primary Value Proposition
A single dashboard that turns ETF portfolio data into:
- projected dividend income
- portfolio recommendations matched to risk and target
- real monthly tracking
- real-life expense coverage visibility

### Product Goals
1. Help users define an income target and build a portfolio aligned to it
2. Make portfolio recommendations understandable and editable
3. Show realistic projections using blended yield and growth assumptions
4. Track estimated vs actual dividend income
5. Show what portion of real monthly expenses dividends currently cover
6. Keep core portfolio logic deterministic and independent from UI frameworks

### Success Metrics
1. User can complete onboarding and apply a portfolio in under 5 minutes
2. User can understand monthly income, coverage, and target shortfall at a glance
3. Recommendation quality improves when user sets:
- capital
- target income
- risk tolerance
- preferred portfolio types
4. Users can update holdings and see derived metrics recalculate immediately
5. Users can persist:
- goals
- holdings
- allocations
- actual dividends
- expense coverage goals

### Non-Goals
1. Brokerage execution
- The app does not place trades

2. Tax filing or tax advice
- Only simple net-income adjustment via user-entered tax rate

3. Real-time institutional market data
- Live data is lightweight and fallback-driven

4. Full accounting or household budgeting
- Expense coverage is dividend-focused, not a full budget suite

### Core User Flows

#### 1. Onboarding
- User selects strategy: `income`, `growth`, or `hyper`
- User selects risk tolerance
- User enters:
  - target period (`monthly` or `yearly`)
  - target income
  - starting capital
  - tax toggle and tax rate
- User selects preferred portfolio types
- App returns recommended portfolios
- User reviews and edits ETF allocations before applying
- App warns if current holdings will be erased

#### 2. Portfolio Setup
- User applies a recommended portfolio or edits a reviewed version
- App normalizes allocation
- App builds holding seeds based on available capital
- App skips unaffordable positions when necessary
- User lands in dashboard with holdings loaded

#### 3. Portfolio Tracking
- User sees:
  - portfolio value
  - blended yield
  - blended CAGR
  - monthly income
  - risk score
  - freedom year
- User can refresh ticker data
- Local ETF database provides fallback if live fetch is unavailable

#### 4. Yield Tracking
- User sees `Actual vs Target vs Estimated` monthly income in bar chart
- User can manually enter actual dividends received for each month
- Estimated monthly income uses previous-month actuals as fallback until fresher web data is available

#### 5. Expense Coverage
- User adds expenses such as:
  - car payment
  - house payment
  - phone bill
- App shows how much of each expense dividends cover
- Overview right panel reflects custom coverage goals when present

#### 6. Scenario Planning
- User can model:
  - contribution amount
  - DRIP on/off
  - years
  - crash %
  - contribution pause
- App projects portfolio growth and future income

### Functional Requirements

#### 1. Portfolio Recommendation Engine
The system must:
- generate portfolio recommendations from local template + ETF database logic
- use:
  - strategy
  - risk tolerance
  - target income
  - capital
  - target period
  - preferred portfolio types
- return no recommendations until user sets capital
- warn when user target implies unrealistic annual yield and cap yield matching
- validate template affordability before final recommendation
- support dynamic type-focused portfolio generation
- support review ETF universe filtering by selected types
- use current ETF_DB yields during scoring

#### 2. ETF Data Model
The system must maintain a local ETF database containing:
- ticker
- name
- price
- yield
- CAGR
- leverage flag
- pay frequency
- sparkline
- health status
- source (`local`, `live`, `manual`, `stub`)
- last updated date
- reverse category list

The system must support categories including:
- Core Dividend
- Dividend Growth
- Covered Call
- Growth / Index
- Leveraged
- Option Income issuers
- Roundhill Income
- Roundhill Thematic
- Closed-End Funds
- Preferred / Bond

#### 3. Type Matching
The system must:
- map user-facing portfolio types to ETF category groups
- avoid hard-coding issuer logic in recommendation code
- use a type-to-category config map as the source of truth

#### 4. Allocation Application
The system must:
- normalize user/template allocations
- report dropped invalid tickers
- report zero-weight removals
- avoid forced unaffordable purchases
- support optional fractional-share mode
- return skipped holdings when capital cannot support them cleanly

#### 5. Portfolio Rebalancing Engine
The system must provide logic to:
- compare current holdings vs target template
- compute:
  - buy actions
  - sell actions
  - hold actions
- estimate:
  - cost
  - proceeds
  - net cash required
- flag unresolved target tickers

#### 6. Holdings and Store Management
The system must persist:
- user goal
- holdings
- allocations
- crash/pause assumptions
- actual dividends
- expense coverage goals

The store must sanitize inputs for:
- capital
- target income
- monthly contributions
- years
- tax rate
- preferred type count
- holding shares
- cost basis
- CAGR overrides

#### 7. Derived Metrics
The system must compute:
- enriched holdings
- total portfolio value
- blended yield
- blended CAGR
- monthly income
- risk score
- freedom year
- coverage %
- weekly/monthly payday distribution
- milestone progress

The system must:
- prefer live cache data when available
- still support older persisted holdings that contain embedded live data
- avoid unnecessary recalculation when unrelated goal fields change

#### 8. Yield Tracker
The system must:
- show actual, target, and estimated dividend income by month
- persist actual monthly inputs
- use previous-month actual as temporary estimated fallback when live distribution detail is unavailable

#### 9. Expense Coverage Goals
The system must:
- let users add named monthly expense targets
- persist those goals
- calculate coverage in entry order
- display:
  - covered amount
  - uncovered gap
  - coverage status
- reflect those goals in the overview right-side progress panel

#### 10. Live Data and Cache
The system must:
- use local cache for live ticker data
- debounce localStorage writes
- expose live cache read/write helpers
- prioritize StockAnalysis for live fetches
- fall back to local DB when live data is unavailable

#### 11. Reliability and Safety
The system must:
- validate ETF category consistency against ETF_DB
- warn in development if categories reference missing tickers
- guard engine imports at runtime and fail loudly if required exports are missing

### UI Requirements

#### Dashboard Overview
Must show:
- KPI cards
- projection chart
- right-side progress panel
- payday calendar
- income coverage goals section

#### Onboarding
Must show:
- strategy selection
- risk tolerance
- target period
- target income
- starting capital
- portfolio type selection
- tax controls
- recommended portfolios
- review-and-edit before apply

#### Yield Tracker
Must show:
- bar chart for `Actual vs Target vs Estimated`
- monthly manual input section

#### Tracker / Portfolio
Must show:
- portfolio allocation
- pie chart with percentages in slices
- side legend with ETF names and weights

### Technical Requirements
- Next.js 14 App Router
- TypeScript
- Zustand for client state
- Tailwind CSS
- Recharts for charting
- Core engine remains pure and independent of React
- Local persistence via browser storage
- Build, lint, and tests must remain green

### Performance Requirements
- Derived metrics should not recompute on unrelated goal-state changes
- Cache writes should be debounced
- Dashboard interactions should feel immediate on normal retail-portfolio sizes

### Known Constraints
1. Windows + OneDrive may cause `.next` deletion `EINVAL` during dev startup
- This is an environment issue, not core app logic

2. Live data is best-effort
- Local DB remains necessary for recommendation continuity and offline fallback

3. Yield assumptions are modeled
- The app is a planning tool, not a guaranteed income predictor

### Risks
1. Users may set unrealistic income targets relative to capital
- Mitigation: yield-cap warnings and no-capital guidance

2. Very high-yield ETF mixes may over-concentrate in one issuer family
- Mitigation: type-based diversification and per-type mixed recommendation logic

3. Local ETF data can become stale
- Mitigation: `lastUpdated`, live fetch path, stale-data utility

### Future Opportunities
1. Rebalance UI workflow
- show buy/sell instructions against target template

2. Priority ordering for expense coverage goals
- drag-and-drop expense order

3. Richer live distribution sourcing
- monthly payout history by ticker

4. Broker import/export
- CSV ingestion for holdings

5. Template comparison mode
- compare required capital, yield, and risk side by side

### Release Readiness Definition
The product is release-ready when:
- onboarding completes without runtime errors
- recommendations respond correctly to goal inputs
- dashboard metrics render from persisted state
- yield tracking persists actuals
- expense coverage reflects custom user-entered bills
- `npm test`, `npm run lint`, and `npm run build` all pass
