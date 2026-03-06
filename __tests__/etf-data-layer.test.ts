import assert from 'node:assert/strict';
import { ETF_DB, filterEtfs, normalizeEtfRecord, sortEtfs, validateEtfRecord } from '../lib/etf-db';

test('etf-data-layer.test', () => {
{
  const n = normalizeEtfRecord({ ticker: 'X', price: 1, yield: 0.01 });
  assert.ok(typeof n.expenseRatio === 'number');
  assert.ok(Array.isArray(n.sectorTags));
}
{
  assert.ok(validateEtfRecord(normalizeEtfRecord({ ticker: 'X', price: -1, yield: 0.01 })).length > 0);
  assert.ok(validateEtfRecord(normalizeEtfRecord({ ticker: 'X', price: 1, yield: 0.01, expenseRatio: 2 })).length > 0);
}
{
  const etfs = Object.values(ETF_DB);
  assert.ok(filterEtfs(etfs, { search: 'schd' }).some((e) => e.ticker === 'SCHD'));
  assert.ok(filterEtfs(etfs, { categories: ['Covered Call'] }).every((e) => e.category === 'Covered Call'));
  assert.ok(filterEtfs(etfs, { leveraged: false }).every((e) => !e.leveraged));
}
{
  const etfs = Object.values(ETF_DB);
  const byYield = sortEtfs(etfs, 'yield', 'desc');
  assert.ok(byYield[0].yield >= byYield[1].yield);
  const byExpense = sortEtfs(etfs, 'expenseRatio', 'asc');
  assert.ok(byExpense[0].expenseRatio <= byExpense[1].expenseRatio);
}

});
