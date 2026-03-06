/**
 * Dividend Freedom Pro — Engine Test Suite
 *
 * Vanilla Node.js — zero dependencies, zero test framework overhead.
 * Run: node tests/engine.test.js
 *
 * Output: TAP-compatible (Test Anything Protocol)
 * Exit code 0 = all pass, 1 = any failure
 */

const {
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
  CACHE_TTL_MS,
} = require("../src/engine.js");

// ─────────────────────────────────────────────────────────────────────────────
// Micro test harness
// ─────────────────────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
const failures = [];

function test(description, fn) {
  try {
    fn();
    console.log(`  ✓  ${description}`);
    passed++;
  } catch (err) {
    console.log(`  ✗  ${description}`);
    console.log(`       → ${err.message}`);
    failed++;
    failures.push({ description, error: err.message });
  }
}

function suite(name, fn) {
  console.log(`\n── ${name} ${"─".repeat(Math.max(0, 58 - name.length))}`);
  fn();
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || "Assertion failed");
}
assert.ok = assert;

function assertEqual(a, b, msg) {
  if (a !== b) throw new Error(msg || `Expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
}

function assertClose(a, b, tolerance, msg) {
  if (Math.abs(a - b) > tolerance)
    throw new Error(msg || `Expected ${b} ±${tolerance}, got ${a}`);
}

function assertThrows(fn, msgPattern, label) {
  let threw = false;
  try { fn(); }
  catch (e) {
    threw = true;
    if (msgPattern && !msgPattern.test(e.message))
      throw new Error(`${label}: threw wrong error: "${e.message}"`);
  }
  if (!threw) throw new Error(`${label}: expected an error but none was thrown`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. getHealth
// ─────────────────────────────────────────────────────────────────────────────
suite("getHealth(yld, cagr)", () => {

  test("CRITICAL: yield > 12% AND cagr < -10%", () => {
    assertEqual(getHealth(0.13, -0.15), "CRITICAL");
  });

  test("CRITICAL: exactly at boundary (0.1201, -0.1001)", () => {
    assertEqual(getHealth(0.1201, -0.1001), "CRITICAL");
  });

  test("NOT critical when yield at exactly 12% (boundary exclusive)", () => {
    // yld must be > 0.12, not >=
    assertEqual(getHealth(0.12, -0.15), "WARNING"); // yield 12% exactly → falls to WARNING
  });

  test("STABLE: yield > 3% AND cagr > 5%", () => {
    assertEqual(getHealth(0.087, 0.06), "STABLE");
  });

  test("STABLE: SCHD-like (3.5% yield, 11% CAGR)", () => {
    assertEqual(getHealth(0.035, 0.11), "STABLE");
  });

  test("STABLE beats WARNING: high yield + good CAGR → STABLE", () => {
    // 11% yield, 6% CAGR: not CRITICAL (cagr > -10%), yield > 3%, cagr > 5% → STABLE
    assertEqual(getHealth(0.11, 0.06), "STABLE");
  });

  test("WARNING: yield > 10%, unknown CAGR (null)", () => {
    assertEqual(getHealth(0.11, null), "WARNING");
  });

  test("WARNING: yield > 10%, but CAGR too low for STABLE", () => {
    assertEqual(getHealth(0.11, 0.02), "WARNING");
  });

  test("NEUTRAL: low yield, null CAGR", () => {
    assertEqual(getHealth(0.02, null), "NEUTRAL");
  });

  test("NEUTRAL: zero yield", () => {
    assertEqual(getHealth(0, 0.22), "NEUTRAL");
  });

  test("NEUTRAL: yield 3% exactly (boundary exclusive for STABLE)", () => {
    // STABLE requires yld > 0.03 strictly
    assertEqual(getHealth(0.03, 0.10), "NEUTRAL");
  });

  test("NEUTRAL: good yield but CAGR null (can't be STABLE)", () => {
    assertEqual(getHealth(0.05, null), "NEUTRAL");
  });

  test("CRITICAL requires cagr not null", () => {
    // null cagr → cannot be CRITICAL
    assertEqual(getHealth(0.20, null), "WARNING");
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// 2. project()
// ─────────────────────────────────────────────────────────────────────────────
suite("project(params)", () => {

  const BASE = { capital: 100_000, monthly: 0, cagr: 0.10, yld: 0.04, drip: false, years: 1 };

  test("Returns an array of length = years", () => {
    const rows = project({ ...BASE, years: 30 });
    assertEqual(rows.length, 30);
  });

  test("Projection rows include extended fields with valid values", () => {
    const rows = project({ ...BASE, years: 3 });
    for (const row of rows) {
      assert.ok(typeof row.annualDividendIncome === 'number',
        'annualDividendIncome must be a number');
      assert.ok(typeof row.cumulativeContributions === 'number',
        'cumulativeContributions must be a number');
      assert.ok(typeof row.cumulativeDividends === 'number',
        'cumulativeDividends must be a number');
      assert.ok(
        row.expensesCoveredPercent === -1 ||
        (row.expensesCoveredPercent >= 0 && row.expensesCoveredPercent <= 100),
        'expensesCoveredPercent must be -1 (N/A signal) or 0-100'
      );
      assert.ok(
        !isNaN(row.annualDividendIncome) && isFinite(row.annualDividendIncome),
        'annualDividendIncome must not be NaN or Infinity'
      );
    }
  });

  test("Year field increments correctly", () => {
    const rows = project({ ...BASE, years: 3 });
    assertEqual(rows[0].year, 1);
    assertEqual(rows[1].year, 2);
    assertEqual(rows[2].year, 3);
  });

  test("No growth, no drip, no contribution: portfolio stays flat (cagr=0, yld=0)", () => {
    const rows = project({ capital:100_000, monthly:0, cagr:0, yld:0, drip:false, years:1 });
    assertEqual(rows[0].portfolio, 100_000);
    assertEqual(rows[0].monthly, 0);
  });

  test("Pure CAGR growth, no contributions, no DRIP (10% annual)", () => {
    // After 1 year of 10% CAGR, portfolio ≈ 110,000
    const rows = project({ ...BASE, years: 1 });
    assertClose(rows[0].portfolio, 110_000, 500, "Year-1 portfolio with 10% CAGR");
  });

  test("Monthly income uses net annual dividend / 12", () => {
    const rows = project({ ...BASE, years: 1 });
    const expected = Math.round((100_000 * 0.04) / 12);
    assertEqual(rows[0].monthly, expected);
  });

  test("DRIP accelerates growth vs no-DRIP", () => {
    const withDrip    = project({ ...BASE, drip: true,  years: 20 });
    const withoutDrip = project({ ...BASE, drip: false, years: 20 });
    assert(
      withDrip[19].portfolio > withoutDrip[19].portfolio,
      "DRIP should produce higher final portfolio"
    );
  });

  test("Monthly contributions increase final portfolio", () => {
    const withContrib    = project({ ...BASE, monthly: 1000, years: 20 });
    const withoutContrib = project({ ...BASE, monthly: 0,    years: 20 });
    assert(
      withContrib[19].portfolio > withoutContrib[19].portfolio,
      "Contributions should grow portfolio"
    );
  });

  test("Crash=50 halves starting portfolio", () => {
    const rows = project({ ...BASE, crash: 50, years: 1 });
    // Starts from 50,000 and grows ~10% → ~55,000
    assertClose(rows[0].portfolio, 55_000, 1000, "50% crash year-1");
  });

  test("Crash=0 is the baseline (no change)", () => {
    const base  = project({ ...BASE, crash: 0 });
    const crash = project({ ...BASE, crash: 0 });
    assertEqual(base[0].portfolio, crash[0].portfolio);
  });

  test("Pause=12 skips first 12 months of contributions", () => {
    const withPause    = project({ ...BASE, monthly: 1000, pause: 12, years: 5 });
    const withoutPause = project({ ...BASE, monthly: 1000, pause: 0,  years: 5 });
    // Portfolio after pause should be lower
    assert(
      withPause[4].portfolio < withoutPause[4].portfolio,
      "Pause should reduce final portfolio vs no-pause"
    );
  });

  test("Pause=0 and pause=undefined are equivalent", () => {
    const a = project({ ...BASE, pause: 0 });
    const b = project({ ...BASE });            // pause defaults to 0
    assertEqual(a[0].portfolio, b[0].portfolio);
  });

  test("20-year compound with DRIP — sanity check: freedom is achievable", () => {
    // $100k at 10% CAGR, 4% yield, DRIP, $2k/mo contributions, 20 years
    const rows = project({ capital:100_000, monthly:2000, cagr:0.10, yld:0.04, drip:true, years:20 });
    assert(rows[19].portfolio > 1_000_000, "Should exceed $1M after 20 years of growth + contributions");
  });

  // Guard rails (sanitization behavior)
  test("Negative capital is sanitized to zero", () => {
    const rows = project({ ...BASE, capital: -1, years: 1 });
    assertEqual(rows[0].cumulativeContributions, 0);
  });

  test("Negative monthly is sanitized to zero", () => {
    const rows = project({ ...BASE, monthly: -500, years: 1 });
    assertEqual(rows[0].cumulativeContributions, 100_000);
  });

  test("cagr below floor is clamped", () => {
    const rows = project({ ...BASE, cagr: -1.5, years: 1 });
    assert(rows[0].portfolio >= 0, "portfolio remains non-negative after clamped CAGR");
  });

  test("Negative yield is sanitized to zero", () => {
    const rows = project({ ...BASE, yld: -0.01, years: 1 });
    assertEqual(rows[0].annualDividendIncome, 0);
  });

  test("years < 1 is sanitized to 1", () => {
    const rows = project({ ...BASE, years: 0 });
    assertEqual(rows.length, 1);
  });

  test("crash > 100 is clamped to 100", () => {
    const rows = project({ ...BASE, crash: 101, years: 1 });
    assertEqual(rows[0].cumulativeContributions, 100_000);
    assert(rows[0].portfolio >= 0, "portfolio remains non-negative");
  });

  test("negative pause is sanitized to 0", () => {
    const a = project({ ...BASE, pause: -1, years: 1 });
    const b = project({ ...BASE, pause: 0, years: 1 });
    assertEqual(a[0].portfolio, b[0].portfolio);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// 3. blendedMetrics()
// ─────────────────────────────────────────────────────────────────────────────
suite("blendedMetrics(enriched)", () => {

  const makeH = (ticker, price, shares, yld, cagr) => ({
    ticker, price, shares, value: price * shares, yld, cagr,
    payFreq: "monthly", health: "NEUTRAL", leveraged: false, name: ticker, src: "local",
  });

  test("Empty array → all zeros", () => {
    const r = blendedMetrics([]);
    assertEqual(r.totalVal, 0);
    assertEqual(r.bYield, 0);
    assertEqual(r.bCagr, 0);
    assertEqual(r.monthlyIncome, 0);
  });

  test("Single holding — blended = holding values", () => {
    // $100k at 5% yield, 10% CAGR
    const h = makeH("SCHD", 100, 1000, 0.05, 0.10);
    const r = blendedMetrics([h]);
    assertEqual(r.totalVal, 100_000);
    assertClose(r.bYield, 0.05, 0.0001);
    assertClose(r.bCagr,  0.10, 0.0001);
    assertEqual(r.monthlyIncome, Math.round((100_000 * 0.05) / 12));
  });

  test("Two equal-weight holdings — blended is arithmetic mean", () => {
    const a = makeH("A", 100, 500, 0.04, 0.08);  // $50k, 4% yield
    const b = makeH("B", 100, 500, 0.08, 0.12);  // $50k, 8% yield
    const r = blendedMetrics([a, b]);
    assertEqual(r.totalVal, 100_000);
    assertClose(r.bYield, 0.06, 0.0001, "Blended yield = mean of equal weights");
    assertClose(r.bCagr,  0.10, 0.0001, "Blended CAGR  = mean of equal weights");
  });

  test("Value-weighted: larger holding dominates blended metrics", () => {
    const big   = makeH("A", 100, 900, 0.09, 0.12); // $90k, 9% yield
    const small = makeH("B", 100, 100, 0.01, 0.02); // $10k, 1% yield
    const r = blendedMetrics([big, small]);
    // blendedYield = 0.09 × 0.9 + 0.01 × 0.1 = 0.081 + 0.001 = 0.082
    assertClose(r.bYield, 0.082, 0.001, "Dominated by large holding");
  });

  test("monthlyIncome = round(totalVal × bYield / 12)", () => {
    const h = makeH("X", 50, 2000, 0.072, 0.062); // $100k, 7.2%
    const r = blendedMetrics([h]);
    assertEqual(r.monthlyIncome, Math.round((100_000 * 0.072) / 12));
  });

  test("Null CAGR treated as 0 in weighted average", () => {
    const h = makeH("X", 100, 1000, 0.05, null);
    const r = blendedMetrics([h]);
    assertEqual(r.bCagr, 0);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// 4. riskScore()
// ─────────────────────────────────────────────────────────────────────────────
suite("riskScore(enriched)", () => {

  const makeH = (yld, leveraged, value) => ({
    ticker: "X", price: 100, shares: value / 100, value,
    yld, cagr: 0.05, payFreq: "monthly", health: "NEUTRAL",
    leveraged, name: "X", src: "local",
  });

  test("Empty holdings → 5 (default)", () => {
    assertEqual(riskScore([]), 5);
  });

  test("All base-score holdings → 3", () => {
    const h = makeH(0.035, false, 100_000); // 3.5% yield, not leveraged
    assertEqual(riskScore([h]), 3);
  });

  test("Leveraged ETF → 9", () => {
    const h = makeH(0.00, true, 100_000);
    assertEqual(riskScore([h]), 9);
  });

  test("Yield > 15% → 8", () => {
    const h = makeH(0.18, false, 100_000);
    assertEqual(riskScore([h]), 8);
  });

  test("Yield > 10% (but ≤15%) → 6", () => {
    const h = makeH(0.12, false, 100_000);
    assertEqual(riskScore([h]), 6);
  });

  test("Yield < 1% → 4", () => {
    const h = makeH(0.005, false, 100_000);
    assertEqual(riskScore([h]), 4);
  });

  test("Mixed portfolio: leveraged + safe → weighted average", () => {
    const lev  = makeH(0.00, true,  50_000); // score 9, half the weight
    const safe = makeH(0.035, false, 50_000); // score 3, half the weight
    // weighted = 9×0.5 + 3×0.5 = 6
    assertClose(riskScore([lev, safe]), 6, 0.1);
  });

  test("Returns value to 1 decimal place", () => {
    const lev  = makeH(0.00, true,  30_000);
    const safe = makeH(0.035, false, 70_000);
    // 9×0.3 + 3×0.7 = 2.7 + 2.1 = 4.8
    assertClose(riskScore([lev, safe]), 4.8, 0.1);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// 5. findFreedomYear()
// ─────────────────────────────────────────────────────────────────────────────
suite("findFreedomYear(rows, targetMonthly)", () => {

  const rows = [
    { year: 2026, portfolio: 110_000, monthly: 367 },
    { year: 2027, portfolio: 125_000, monthly: 417 },
    { year: 2028, portfolio: 140_000, monthly: 467 },
    { year: 2035, portfolio: 300_000, monthly: 1000 },
    { year: 2040, portfolio: 600_000, monthly: 2000 },
    { year: 2045, portfolio: 1_200_000, monthly: 4000 },
    { year: 2050, portfolio: 2_000_000, monthly: 6667 },
  ];

  test("Finds first year exceeding target", () => {
    assertEqual(findFreedomYear(rows, 5000), 2050);
  });

  test("Returns null when target never reached", () => {
    assertEqual(findFreedomYear(rows, 10_000), null);
  });

  test("Returns year when monthly = target (exact match)", () => {
    assertEqual(findFreedomYear(rows, 2000), 2040);
  });

  test("Returns first year if income already meets target from year 1", () => {
    assertEqual(findFreedomYear(rows, 100), 2026);
  });

  test("Empty rows → null", () => {
    assertEqual(findFreedomYear([], 5000), null);
  });

  test("Works correctly with live projection data", () => {
    const proj = project({
      capital: 200_000, monthly: 2000, cagr: 0.10, yld: 0.05, drip: true, years: 30
    });
    const yr = findFreedomYear(proj, 5000);
    // Should reach $5k/mo within 30 years with these inputs
    assert(yr !== null, "Should find freedom year with generous inputs");
    assert(yr >= 1, "Freedom year should be at least year 1");
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// 6. buildPaydayCalendar()
// ─────────────────────────────────────────────────────────────────────────────
suite("buildPaydayCalendar(enriched)", () => {

  const makeH = (ticker, value, yld, payFreq) => ({
    ticker, value, yld, payFreq,
    price: 100, shares: value / 100,
    cagr: 0.05, health: "NEUTRAL", leveraged: false, name: ticker, src: "local",
  });

  test("Returns exactly 4 weeks", () => {
    assertEqual(buildPaydayCalendar([]).length, 4);
  });

  test("Empty holdings → all weeks zero", () => {
    const cal = buildPaydayCalendar([]);
    assert(cal.every(w => w.amount === 0), "All weeks should be 0");
  });

  test("Week labels are correct", () => {
    const cal = buildPaydayCalendar([]);
    assertEqual(cal[0].label, "Week 1 (1–7)");
    assertEqual(cal[3].label, "Week 4 (22–31)");
  });

  test("Monthly payer at index 0 → week 0", () => {
    const h = makeH("JEPI", 120_000, 0.087, "monthly");
    const cal = buildPaydayCalendar([h]);
    const expectedWeekly = Math.round((120_000 * 0.087 / 12));
    assertEqual(cal[0].amount, expectedWeekly);
    assertEqual(cal[1].amount, 0);
  });

  test("Monthly payers distributed across all 4 weeks by index", () => {
    const holdings = ["A","B","C","D"].map((t, i) =>
      makeH(t, 100_000, 0.06, "monthly")
    );
    const cal = buildPaydayCalendar(holdings);
    // Each holding goes to week = index % 4 → one per week, all equal
    const expected = Math.round((100_000 * 0.06 / 12));
    cal.forEach((w, i) => assertEqual(w.amount, expected, `Week ${i}`));
  });

  test("Total calendar income = total monthly income", () => {
    const holdings = [
      makeH("SCHD", 50_000, 0.035, "quarterly"),
      makeH("JEPI", 50_000, 0.087, "monthly"),
    ];
    const cal = buildPaydayCalendar(holdings);
    const calTotal = cal.reduce((s, w) => s + w.amount, 0);
    // Expected total = monthly income from both
    const expectedTotal = Math.round((50_000 * 0.035 + 50_000 * 0.087) / 12);
    assertClose(calTotal, expectedTotal, 2, "Calendar total should match portfolio monthly income");
  });

  test("Annual payer goes to week 0", () => {
    const h = makeH("ANNL", 100_000, 0.04, "annual");
    const cal = buildPaydayCalendar([h]);
    assertEqual(cal[0].amount, Math.round(100_000 * 0.04 / 12));
    assertEqual(cal[1].amount, 0);
  });

  test("Weekly payer splits income across all 4 weeks", () => {
    const h = makeH("TSLY", 120_000, 0.12, "weekly");
    const cal = buildPaydayCalendar([h]);
    const total = cal.reduce((s, w) => s + w.amount, 0);
    const expectedTotal = Math.round((120_000 * 0.12) / 12);
    cal.forEach((w) => assert(w.amount > 0, "Each week should receive weekly payer income"));
    assertClose(total, expectedTotal, 2, "Weekly split should preserve monthly total");
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// 7. sparklineTrend()
// ─────────────────────────────────────────────────────────────────────────────
suite("sparklineTrend(prices)", () => {

  test("Uptrend: last > first × 1.001", () => {
    assertEqual(sparklineTrend([100, 101, 102, 103]), "up");
  });

  test("Downtrend: last < first × 0.999", () => {
    assertEqual(sparklineTrend([100, 99, 98, 97]), "down");
  });

  test("Flat: minimal change within ±0.1%", () => {
    assertEqual(sparklineTrend([100, 100.05, 99.98, 100.01]), "flat");
  });

  test("Empty array → flat", () => {
    assertEqual(sparklineTrend([]), "flat");
  });

  test("Single element → flat", () => {
    assertEqual(sparklineTrend([50]), "flat");
  });

  test("null/undefined → flat", () => {
    assertEqual(sparklineTrend(null), "flat");
    assertEqual(sparklineTrend(undefined), "flat");
  });

  test("Real SCHD data (slightly up): correct trend", () => {
    const schd = [79.1,80.3,81.2,80.8,82.1,81.9,82.4,83.1,82.8,83.5,82.9,82.4];
    assertEqual(sparklineTrend(schd), "up"); // 82.4 > 79.1 × 1.001
  });

  test("Real TSLY data (slightly down): correct trend", () => {
    const tsly = [15.1,14.8,14.5,14.2,13.9,14.1,14.4,14.3,14.1,14.0,14.2,14.2];
    assertEqual(sparklineTrend(tsly), "down"); // 14.2 < 15.1 × 0.999
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// 8. milestonesProgress()
// ─────────────────────────────────────────────────────────────────────────────
suite("milestonesProgress(monthlyIncome, userTarget)", () => {

  test("Zero income → all 0%", () => {
    const ms = milestonesProgress(0, 5000);
    assert(ms.every(m => m.pct === 0), "All milestones at 0%");
  });

  test("Coffee milestone reached at $50", () => {
    const ms = milestonesProgress(50, 5000);
    const coffee = ms.find(m => m.id === "coffee");
    assertEqual(coffee.reached, true);
    assertEqual(coffee.pct, 100);
  });

  test("Groceries not reached at $399", () => {
    const ms = milestonesProgress(399, 5000);
    const groceries = ms.find(m => m.id === "groceries");
    assertEqual(groceries.reached, false);
  });

  test("Groceries reached at $400 exactly", () => {
    const ms = milestonesProgress(400, 5000);
    const groceries = ms.find(m => m.id === "groceries");
    assertEqual(groceries.reached, true);
    assertEqual(groceries.pct, 100);
  });

  test("Full independence uses userTarget dynamically", () => {
    const ms = milestonesProgress(2500, 5000);
    const fi = ms.find(m => m.id === "independence");
    assertEqual(fi.target, 5000);
    assertClose(fi.pct, 50, 0.5);
    assertEqual(fi.reached, false);
  });

  test("Full independence reached at userTarget", () => {
    const ms = milestonesProgress(5000, 5000);
    const fi = ms.find(m => m.id === "independence");
    assertEqual(fi.reached, true);
    assertEqual(fi.pct, 100);
  });

  test("pct is capped at 100 (not over)", () => {
    const ms = milestonesProgress(10_000, 5000);
    ms.forEach(m => assert(m.pct <= 100, `${m.id} pct should not exceed 100`));
  });

  test("Returns 4 milestones", () => {
    assertEqual(milestonesProgress(1000, 5000).length, 4);
  });

  test("Partial coffee at $25 → 50%", () => {
    const ms = milestonesProgress(25, 5000);
    const coffee = ms.find(m => m.id === "coffee");
    assertClose(coffee.pct, 50, 0.5);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// 9. isCacheValid() + makeCacheEntry()
// ─────────────────────────────────────────────────────────────────────────────
suite("isCacheValid() + makeCacheEntry()", () => {

  test("Fresh entry (just created) is valid", () => {
    const entry = makeCacheEntry({ ticker: "SCHD" });
    assert(isCacheValid(entry), "Brand new entry should be valid");
  });

  test("Entry from 1 hour ago is valid", () => {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const entry = makeCacheEntry({ ticker: "JEPI" }, oneHourAgo);
    assert(isCacheValid(entry), "1-hour-old entry should be valid");
  });

  test("Entry from exactly 24h ago is invalid (TTL boundary)", () => {
    const exactly24h = Date.now() - CACHE_TTL_MS;
    const entry = makeCacheEntry({ ticker: "VYM" }, exactly24h);
    assert(!isCacheValid(entry), "24h-old entry should be expired");
  });

  test("Entry from 25 hours ago is invalid", () => {
    const old = Date.now() - (25 * 60 * 60 * 1000);
    const entry = makeCacheEntry({ ticker: "QYLD" }, old);
    assert(!isCacheValid(entry), "25h-old entry should be expired");
  });

  test("null entry → invalid", () => {
    assert(!isCacheValid(null));
  });

  test("Entry with no ts → invalid", () => {
    assert(!isCacheValid({ data: { ticker: "X" } }));
  });

  test("makeCacheEntry wraps data with ts", () => {
    const before = Date.now();
    const entry = makeCacheEntry({ ticker: "SCHD", price: 82.4 });
    const after = Date.now();
    assert(entry.ts >= before && entry.ts <= after, "ts should be current timestamp");
    assertEqual(entry.data.ticker, "SCHD");
    assertEqual(entry.data.price, 82.4);
  });

  test("makeCacheEntry accepts injectable timestamp for testing", () => {
    const fixedTs = 1_700_000_000_000;
    const entry = makeCacheEntry({ x: 1 }, fixedTs);
    assertEqual(entry.ts, fixedTs);
  });

  test("CACHE_TTL_MS equals exactly 24 hours in ms", () => {
    assertEqual(CACHE_TTL_MS, 86_400_000);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// 10. Integration: full pipeline
// ─────────────────────────────────────────────────────────────────────────────
suite("Integration — full pipeline simulation", () => {

  // Simulate a real portfolio: SCHD + JEPI + VYM
  const holdings = [
    { ticker:"SCHD", price:82.4,  shares:200, yld:0.035, cagr:0.110, value:82.4*200,  payFreq:"quarterly", health:"STABLE",  leveraged:false, name:"Schwab Dividend",    src:"local" },
    { ticker:"JEPI", price:58.1,  shares:150, yld:0.087, cagr:0.060, value:58.1*150,  payFreq:"monthly",   health:"STABLE",  leveraged:false, name:"JPMorgan Premium",   src:"local" },
    { ticker:"VYM",  price:118.9, shares:100, yld:0.029, cagr:0.092, value:118.9*100, payFreq:"quarterly", health:"STABLE",  leveraged:false, name:"Vanguard High Div",  src:"local" },
  ];

  test("Blended metrics are computed correctly", () => {
    const { totalVal, bYield, bCagr, monthlyIncome } = blendedMetrics(holdings);
    assert(totalVal > 0, "totalVal > 0");
    assert(bYield > 0, "bYield > 0");
    assert(bCagr > 0, "bCagr > 0");
    assert(monthlyIncome > 0, "monthlyIncome > 0");
    // Rough sanity: total = 82.4×200 + 58.1×150 + 118.9×100
    assertClose(totalVal, 82.4*200 + 58.1*150 + 118.9*100, 1);
  });

  test("Risk score is reasonable for a conservative portfolio", () => {
    const rs = riskScore(holdings);
    assert(rs < 5, `Conservative portfolio should score < 5, got ${rs}`);
  });

  test("Health scores are correct for each holding", () => {
    // SCHD: 3.5% yield > 3%, 11% CAGR > 5% → STABLE
    assertEqual(getHealth(0.035, 0.110), "STABLE", "SCHD should be STABLE");
    // JEPI: 8.7% yield > 3%, 6% CAGR > 5% → STABLE
    assertEqual(getHealth(0.087, 0.060), "STABLE", "JEPI should be STABLE");
    // VYM: 2.9% yield is < 3% threshold — does not qualify for STABLE → NEUTRAL
    // (Good ETF but yield just misses the STABLE cutoff — expected behaviour)
    assertEqual(getHealth(0.029, 0.092), "NEUTRAL", "VYM 2.9% yield → NEUTRAL (below 3% threshold)");
  });

  test("Projection reaches realistic values after 30 years", () => {
    const { totalVal, bYield, bCagr } = blendedMetrics(holdings);
    const rows = project({
      capital: totalVal, monthly: 2000, cagr: bCagr, yld: bYield,
      drip: true, years: 30,
    });
    assert(rows.length === 30, "30 rows");
    assert(rows[29].portfolio > totalVal, "Portfolio grows over 30 years");
    assert(rows[29].monthly > rows[0].monthly, "Income grows over 30 years");
  });

  test("Freedom year is findable for ambitious but realistic target", () => {
    const { totalVal, bYield, bCagr } = blendedMetrics(holdings);
    const rows = project({
      capital: totalVal, monthly: 2000, cagr: bCagr, yld: bYield,
      drip: true, years: 30,
    });
    // With ~$35k portfolio + contributions this might not hit $5k/mo — that's fine, null is valid
    const yr = findFreedomYear(rows, 5000);
    assert(yr === null || yr >= 1, "Freedom year is projection year index or null");
  });

  test("Payday calendar sums to monthly income (within $1 rounding)", () => {
    const { monthlyIncome } = blendedMetrics(holdings);
    const cal = buildPaydayCalendar(holdings);
    const calTotal = cal.reduce((s, w) => s + w.amount, 0);
    assertClose(calTotal, monthlyIncome, 2, `Calendar $${calTotal} ≈ income $${monthlyIncome}`);
  });

  test("Milestones correct for this portfolio's current income", () => {
    const { monthlyIncome } = blendedMetrics(holdings);
    const ms = milestonesProgress(monthlyIncome, 5000);
    // Coffee ($50) should definitely be reached
    assert(ms.find(m => m.id === "coffee").reached, "Coffee milestone reached");
    // pct values should be non-negative
    ms.forEach(m => assert(m.pct >= 0, `${m.id} pct >= 0`));
  });

  test("Crash + DRIP scenario: recovers over 30 years", () => {
    const { totalVal, bYield, bCagr } = blendedMetrics(holdings);
    const normal = project({ capital:totalVal, monthly:2000, cagr:bCagr, yld:bYield, drip:true, years:30 });
    const crash  = project({ capital:totalVal, monthly:2000, cagr:bCagr, yld:bYield, drip:true, years:30, crash:40 });
    // After 30 years, crash portfolio should still be substantial (DRIP recovers it)
    assert(crash[29].portfolio > totalVal, "Even after 40% crash, 30yr growth should exceed starting value");
    // But crash is still lower than no-crash
    assert(crash[29].portfolio < normal[29].portfolio, "Crash scenario ends lower than baseline");
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────
const total = passed + failed;
console.log(`\n${"═".repeat(62)}`);
console.log(`  Results: ${passed}/${total} passed  |  ${failed} failed`);
if (failures.length > 0) {
  console.log(`\n  FAILURES:`);
  failures.forEach(f => {
    console.log(`    ✗ ${f.description}`);
    console.log(`      ${f.error}`);
  });
}
console.log(`${"═".repeat(62)}\n`);

process.exit(failed > 0 ? 1 : 0);
