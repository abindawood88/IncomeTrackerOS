import assert from 'node:assert/strict';
import { scoreEtfAutopilot } from '../lib/domain/autopilot/score';
import { ETF_DB } from '../lib/etf-db';

{
  const schd = scoreEtfAutopilot(ETF_DB.SCHD);
  const tqqq = scoreEtfAutopilot(ETF_DB.TQQQ);
  const tsly = scoreEtfAutopilot(ETF_DB.TSLY);
  assert.ok(schd.total > 60);
  assert.ok(tqqq.inverseVolatility < 40);
  assert.ok(tsly.dividendStabilityScore < schd.dividendStabilityScore);
  [schd, tqqq, tsly].forEach((s) => {
    assert.ok(s.total >= 0 && s.total <= 100);
    assert.ok(Number.isFinite(s.total));
    Object.values(s).forEach((v) => assert.ok(v >= 0 && v <= 100));
  });
}
