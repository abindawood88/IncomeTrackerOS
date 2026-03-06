import assert from 'node:assert/strict';
import { generateRiskWarnings } from '../lib/domain/risk/warnings';
import type { EnrichedHolding } from '../lib/types';

test('risk-warnings.test', () => {
const mk = (ticker: string, value: number, yld: number, leveraged = false): EnrichedHolding => ({ ticker, shares: 1, avgCost: 1, price: value, value, yld, cagr: 0, src: 'local', payFreq: 'monthly', sparkline: [], health: 'STABLE', leveraged, name: ticker });

{
  const holdings = [mk('A', 450, 0.22, true), mk('B', 550, 0.16, false)];
  const warnings = generateRiskWarnings(holdings, { targetIncome: 500, targetPeriod: 'monthly', capital: 10000 }, () => 0.01);
  assert.ok(warnings.some((w) => w.id.includes('concentration')));
  assert.ok(warnings.some((w) => w.id === 'leverage-overuse'));
  assert.ok(warnings.some((w) => w.id === 'high-blended-yield'));
  warnings.forEach((w) => { assert.ok(w.id && w.severity && w.message); });
}

{
  const warnings = generateRiskWarnings([], { targetIncome: 500, targetPeriod: 'monthly', capital: 10000 });
  assert.equal(warnings.length, 0);
}

{
  const warnings = generateRiskWarnings([mk('A', 1000, 0.05)], { targetIncome: 500, targetPeriod: 'monthly', capital: 12000 });
  assert.ok(warnings.some((w) => w.id === 'unrealistic-income-target'));
}

});
