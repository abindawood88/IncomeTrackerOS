import { ETF_DB } from "./etf-db";
import { normalizeTicker, roundTo } from "./utils";
import type { EnrichedHolding } from "./types";

export type RebalanceAction =
  | { action: "buy"; ticker: string; shares: number; estimatedCost: number; reason: string }
  | { action: "sell"; ticker: string; shares: number; estimatedProceeds: number; reason: string }
  | { action: "hold"; ticker: string; currentWeight: number; targetWeight: number };

export type RebalancePlan = {
  actions: RebalanceAction[];
  totalBuyCost: number;
  totalSellProceeds: number;
  netCashRequired: number;
  currentTotalValue: number;
  targetTotalValue: number;
  unresolvable: string[];
};

export type TargetAllocation = {
  ticker: string;
  weight: number;
};

export function computeRebalancePlan(
  currentHoldings: EnrichedHolding[],
  targetAllocations: TargetAllocation[],
  additionalCapital = 0,
  supportsFractional = false,
  thresholdPct = 0.02,
): RebalancePlan {
  const unresolvable: string[] = [];
  const targetPrices: Record<string, number> = {};

  for (const alloc of targetAllocations) {
    const ticker = normalizeTicker(alloc.ticker);
    const db = ETF_DB[ticker];
    if (!db || db.source === "stub") {
      unresolvable.push(ticker);
      continue;
    }
    const existing = currentHoldings.find((holding) => holding.ticker === ticker);
    targetPrices[ticker] = existing?.price ?? db.price;
  }

  const currentTotalValue =
    currentHoldings.reduce((sum, holding) => sum + holding.value, 0) + additionalCapital;
  const targetTotalValue = currentTotalValue;

  const currentMap: Record<string, { shares: number; value: number; price: number }> = {};
  for (const holding of currentHoldings) {
    currentMap[holding.ticker] = {
      shares: holding.shares,
      value: holding.value,
      price: holding.price,
    };
  }

  const actions: RebalanceAction[] = [];
  let totalBuyCost = 0;
  let totalSellProceeds = 0;
  const processedTickers = new Set<string>();

  for (const alloc of targetAllocations) {
    const ticker = normalizeTicker(alloc.ticker);
    if (unresolvable.includes(ticker)) continue;
    processedTickers.add(ticker);

    const targetValue = targetTotalValue * alloc.weight;
    const currentEntry = currentMap[ticker];
    const currentValue = currentEntry?.value ?? 0;
    const price = targetPrices[ticker] ?? currentEntry?.price ?? 0;
    if (price <= 0) continue;

    const currentWeight = currentTotalValue > 0 ? currentValue / currentTotalValue : 0;
    const drift = Math.abs(alloc.weight - currentWeight);
    if (drift < thresholdPct) {
      actions.push({ action: "hold", ticker, currentWeight, targetWeight: alloc.weight });
      continue;
    }

    const valueDelta = targetValue - currentValue;
    const rawShares = valueDelta / price;

    if (valueDelta > 0) {
      const shares = supportsFractional ? roundTo(rawShares, 4) : Math.floor(rawShares);
      if (shares <= 0) {
        actions.push({ action: "hold", ticker, currentWeight, targetWeight: alloc.weight });
        continue;
      }
      const estimatedCost = roundTo(shares * price, 2);
      totalBuyCost += estimatedCost;
      actions.push({
        action: "buy",
        ticker,
        shares,
        estimatedCost,
        reason: `Underweight by ${((alloc.weight - currentWeight) * 100).toFixed(1)}%`,
      });
      continue;
    }

    const shares = supportsFractional ? roundTo(Math.abs(rawShares), 4) : Math.floor(Math.abs(rawShares));
    if (shares <= 0) {
      actions.push({ action: "hold", ticker, currentWeight, targetWeight: alloc.weight });
      continue;
    }
    const estimatedProceeds = roundTo(shares * price, 2);
    totalSellProceeds += estimatedProceeds;
    actions.push({
      action: "sell",
      ticker,
      shares,
      estimatedProceeds,
      reason: `Overweight by ${((currentWeight - alloc.weight) * 100).toFixed(1)}%`,
    });
  }

  for (const holding of currentHoldings) {
    if (processedTickers.has(holding.ticker)) continue;
    const shares = supportsFractional ? roundTo(holding.shares, 4) : Math.floor(holding.shares);
    if (shares <= 0) continue;
    const estimatedProceeds = roundTo(shares * holding.price, 2);
    totalSellProceeds += estimatedProceeds;
    actions.push({
      action: "sell",
      ticker: holding.ticker,
      shares,
      estimatedProceeds,
      reason: "Not in target portfolio",
    });
  }

  actions.sort((a, b) => {
    const order = { sell: 0, buy: 1, hold: 2 };
    return order[a.action] - order[b.action];
  });

  return {
    actions,
    totalBuyCost: roundTo(totalBuyCost, 2),
    totalSellProceeds: roundTo(totalSellProceeds, 2),
    netCashRequired: roundTo(totalBuyCost - totalSellProceeds - additionalCapital, 2),
    currentTotalValue: roundTo(currentTotalValue, 2),
    targetTotalValue: roundTo(targetTotalValue, 2),
    unresolvable,
  };
}

export function rebalanceToTemplate(
  currentHoldings: EnrichedHolding[],
  templateHoldings: Array<{ ticker: string; weight: number }>,
  additionalCapital = 0,
  supportsFractional = false,
): RebalancePlan {
  return computeRebalancePlan(
    currentHoldings,
    templateHoldings.map((holding) => ({
      ticker: normalizeTicker(holding.ticker),
      weight: holding.weight,
    })),
    additionalCapital,
    supportsFractional,
  );
}
