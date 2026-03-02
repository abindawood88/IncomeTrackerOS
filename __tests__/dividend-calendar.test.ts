import assert from "node:assert/strict";
import { buildDividendCalendar } from "../lib/dividend-calendar";
import type { EnrichedHolding, PayFrequency } from "../lib/types";

function mockHolding(overrides: Partial<EnrichedHolding>): EnrichedHolding {
  return {
    ticker: "MOCK",
    name: "Mock ETF",
    shares: 100,
    avgCost: 100,
    price: 100,
    value: 10_000,
    yld: 0.1,
    cagr: 0.05,
    src: "local",
    payFreq: "monthly",
    sparkline: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    health: "STABLE",
    leveraged: false,
    ...overrides,
  };
}

{
  const holdings = [mockHolding({ ticker: "XDTE", payFreq: "weekly", yld: 0.2 })];
  const cal = buildDividendCalendar(holdings);
  const nonZeroWeeks = cal.weeklyCalendar.filter((week) => week.totalAmount > 0);
  assert.equal(nonZeroWeeks.length, 52);
}

{
  const holdings = [mockHolding({ ticker: "JEPI", payFreq: "monthly", yld: 0.087 })];
  const cal = buildDividendCalendar(holdings);
  const nonZeroMonths = cal.monthlyTotals.filter((amount) => amount > 0);
  assert.equal(nonZeroMonths.length, 12);
}

{
  const holdings = [mockHolding({ ticker: "XDTE", payFreq: "weekly", yld: 0.2 })];
  const cal = buildDividendCalendar(holdings);
  const sumOfMonthly = cal.monthlyTotals.reduce((sum, value) => sum + value, 0);
  assert.ok(Math.abs(cal.annualTotal - sumOfMonthly) < 0.1);
}

{
  const holdings = [mockHolding({ ticker: "XDTE", payFreq: "weekly", yld: 0.2 })];
  const gross = buildDividendCalendar(holdings, 1);
  const net = buildDividendCalendar(holdings, 0.7);
  assert.ok(Math.abs(net.annualTotal - gross.annualTotal * 0.7) < 0.1);
}

{
  const empty = buildDividendCalendar([]);
  assert.equal(empty.annualTotal, 0);
  assert.equal(empty.schedule.length, 0);
}

{
  const holdings = [mockHolding({ ticker: "JEPI", payFreq: "monthly" as PayFrequency })];
  const cal = buildDividendCalendar(holdings);
  assert.ok("estimatedAnnual" in cal.schedule[0]);
  assert.ok("estimatedMonthly" in cal.schedule[0]);
  assert.ok("estimatedWeekly" in cal.schedule[0]);
  assert.ok("buyByDate" in cal.schedule[0]);
  assert.ok("daysUntilExDiv" in cal.schedule[0]);
}
