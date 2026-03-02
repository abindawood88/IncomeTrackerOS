import assert from "node:assert/strict";
import { computeRebalancePlan } from "../lib/rebalance";
import type { EnrichedHolding } from "../lib/types";

function holding(
  ticker: string,
  shares: number,
  price: number,
  value: number,
): EnrichedHolding {
  return {
    ticker,
    shares,
    avgCost: price,
    price,
    value,
    yld: 0.03,
    cagr: 0.08,
    src: "local",
    payFreq: "monthly",
    sparkline: [],
    health: "STABLE",
    leveraged: false,
    name: ticker,
  };
}

{
  const result = computeRebalancePlan([], [
    { ticker: "SCHD", weight: 0.6 },
    { ticker: "VYM", weight: 0.4 },
  ], 10_000);
  assert.ok(result.actions.every((action) => action.action === "buy"));
}

{
  const result = computeRebalancePlan(
    [holding("SCHD", 72.8155, 82.4, 6000), holding("VYM", 33.6417, 118.9, 4000)],
    [
      { ticker: "SCHD", weight: 0.6 },
      { ticker: "VYM", weight: 0.4 },
    ],
  );
  assert.ok(result.actions.every((action) => action.action === "hold"));
}

{
  const result = computeRebalancePlan(
    [holding("TQQQ", 32, 62.5, 2000)],
    [{ ticker: "SCHD", weight: 1 }],
    0,
  );
  assert.ok(result.actions.some((action) => action.action === "sell" && action.ticker === "TQQQ"));
}

{
  const result = computeRebalancePlan([], [{ ticker: "GHOSTETF", weight: 1 }], 10_000);
  assert.deepEqual(result.unresolvable, ["GHOSTETF"]);
  assert.equal(result.actions.length, 0);
}

{
  const result = computeRebalancePlan(
    [holding("SCHD", 36.4078, 82.4, 3000)],
    [{ ticker: "QQQ", weight: 1 }],
    1000,
  );
  assert.equal(
    result.netCashRequired,
    Math.round((result.totalBuyCost - result.totalSellProceeds - 1000) * 100) / 100,
  );
}

{
  const result = computeRebalancePlan([], [{ ticker: "VOO", weight: 1 }], 1000, true);
  const buy = result.actions.find((action) => action.action === "buy");
  assert.ok(buy && buy.shares === 2.0437);
}

{
  const result = computeRebalancePlan([], [{ ticker: "VOO", weight: 1 }], 1000, false);
  const buy = result.actions.find((action) => action.action === "buy");
  assert.ok(buy && buy.shares === 2);
}

{
  const result = computeRebalancePlan(
    [holding("SCHD", 60.6796, 82.4, 5000)],
    [{ ticker: "SCHD", weight: 0.51 }],
    5000,
    false,
    0.02,
  );
  assert.equal(result.actions[0].action, "hold");
}
