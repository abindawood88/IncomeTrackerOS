import assert from 'node:assert/strict';
import { calculateDashboardKPIs } from '../lib/domain/portfolio/kpis';
import type { EnrichedHolding, ExpenseGoal } from '../lib/types';

test('kpis.test', () => {
const holdings: EnrichedHolding[] = [
  { ticker: 'A', shares: 10, avgCost: 10, price: 100, value: 1000, yld: 0.06, cagr: 0.1, src: 'local', payFreq: 'monthly', sparkline: [], health: 'STABLE', leveraged: false, name: 'A' },
  { ticker: 'B', shares: 10, avgCost: 10, price: 200, value: 2000, yld: 0.03, cagr: 0.1, src: 'local', payFreq: 'monthly', sparkline: [], health: 'STABLE', leveraged: false, name: 'B' },
];
const expenses: ExpenseGoal[] = [{ id: '1', name: 'Rent', amountMonthly: 100, enabledForGoal: true, createdAt: 1 }];

{
  const k = calculateDashboardKPIs(holdings, expenses, [10, 80, 120], 100, 2026);
  assert.equal(k.portfolioValue, 3000);
  assert.equal(k.annualDividendIncome, 120);
  assert.equal(k.monthlyDividendIncome, 10);
  assert.equal(k.expensesCoveredPercent, 10);
  assert.equal(k.estimatedFreedomYear, 2029);
}

{
  const k = calculateDashboardKPIs(holdings, [], [10, 20], 100, 2026);
  assert.equal(k.incomeFreedomScore, null);
  assert.equal(k.expensesCoveredPercent, null);
  assert.equal(k.estimatedFreedomYear, null);
}

{
  const k = calculateDashboardKPIs(holdings, [{ id: '1', name: 'x', amountMonthly: 1, enabledForGoal: true, createdAt: 1 }], [500], 100, 2026);
  assert.equal(k.expensesCoveredPercent, 100);
}

});
