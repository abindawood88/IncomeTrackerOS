import assert from 'node:assert/strict';
import { project } from '../lib/engine';

test('projection-engine.test', () => {
{
  const rows = project({ capital: 10000, monthly: 100, cagr: 0.05, yld: 0.06, drip: false, years: 2, totalMonthlyExpenses: 0 } as any);
  assert.equal(rows[0].annualDividendIncome, rows[0].monthly * 12);
  assert.equal(rows[0].expensesCoveredPercent, -1);
  assert.ok(rows[1].cumulativeContributions > rows[0].cumulativeContributions);
}

{
  const a = project({ capital: 10000, monthly: 0, cagr: 0.05, yld: 0.06, drip: false, years: 5 } as any);
  const b = project({ capital: 10000, monthly: 0, cagr: 0.05, yld: 0.06, drip: true, years: 5 } as any);
  assert.ok(b[4].portfolio > a[4].portfolio);
}

{
  const nt = project({ capital: 10000, monthly: 0, cagr: 0, yld: 0.1, drip: false, years: 1, taxRate: 0 } as any);
  const wt = project({ capital: 10000, monthly: 0, cagr: 0, yld: 0.1, drip: false, years: 1, taxRate: 0.3 } as any);
  assert.ok(wt[0].annualDividendIncome < nt[0].annualDividendIncome);
}

{
  const rows = project({ capital: 10000, monthly: 0, cagr: 0, yld: 0.1, drip: false, years: 60 } as any);
  assert.equal(rows.length, 50);
}

{
  const rows = project({ capital: -1, monthly: 0, cagr: 0, yld: 0, drip: false, years: 2 } as any);
  rows.forEach((r) => Object.values(r).forEach((v) => assert.ok(Number.isFinite(v))));
}

});
