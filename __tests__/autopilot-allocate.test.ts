import assert from 'node:assert/strict';
import { runAutopilot } from '../lib/domain/autopilot/allocate';
import { ETF_DB } from '../lib/etf-db';

function check(riskTolerance: 'conservative' | 'balanced' | 'aggressive', cap: number) {
  const out = runAutopilot({ targetIncome: 1000, targetPeriod: 'monthly', startingCapital: 10000, monthlyContribution: 500, riskTolerance, strategy: 'income' });
  const total = out.allocations.reduce((s, a) => s + a.weight, 0);
  assert.ok(Math.abs(total - 1) <= 0.01);
  const lev = out.allocations.reduce((s, a) => s + (ETF_DB[a.ticker].leveraged ? a.weight : 0), 0);
  assert.ok(lev <= cap + 0.001);
  assert.ok(out.allocations.every((a) => a.weight <= 0.3 + 0.001));
  assert.ok(out.allocations.length >= 3);
  assert.ok(Array.isArray(out.warnings));
  assert.ok(out.notes.length >= 1);
}

check('conservative', 0);
check('balanced', 0.1);
check('aggressive', 0.25);
