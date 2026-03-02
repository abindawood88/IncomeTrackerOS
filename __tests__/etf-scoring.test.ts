import assert from "node:assert/strict";
import { ETF_DB } from "../lib/etf-db";
import { rankETFs, scoreETF } from "../lib/etf-scoring";

{
  const jepi = scoreETF(ETF_DB.JEPI, {
    targetYield: 0.09,
    strategy: "income",
    riskTolerance: "low",
  });
  const tsly = scoreETF(ETF_DB.TSLY, {
    targetYield: 0.09,
    strategy: "income",
    riskTolerance: "low",
  });
  assert.ok(jepi.total > tsly.total);
}

{
  const ranked = rankETFs([ETF_DB.TSLY, ETF_DB.JEPI, ETF_DB.SCHD], {
    targetYield: 0.08,
    strategy: "income",
    riskTolerance: "low",
  });
  assert.equal(ranked[0].etf.ticker, "JEPI");
  assert.equal(ranked.at(-1)?.etf.ticker, "TSLY");
}

{
  const growth = scoreETF(ETF_DB.QQQ, {
    targetYield: 0.02,
    strategy: "growth",
    riskTolerance: "medium",
  });
  const hyper = scoreETF(ETF_DB.TSLY, {
    targetYield: 0.18,
    strategy: "hyper",
    riskTolerance: "high",
  });
  assert.ok(growth.qualityScore > 0);
  assert.ok(hyper.payFreqScore >= 8);
  assert.ok(growth.total <= 100 && hyper.total <= 100);
}
