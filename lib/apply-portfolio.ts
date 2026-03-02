import { ETF_DB } from "./etf-db";
import { normalizeTicker, roundTo } from "./utils";

export type AllocationInput = {
  ticker: string;
  weight: number;
};

export type NormalizedAllocation = {
  ticker: string;
  weight: number;
};

export type HoldingSeed = {
  ticker: string;
  shares: number;
  avgCost: number;
  cagrOvr: null;
};

export type NormalizeAllocationsResult = {
  normalized: NormalizedAllocation[];
  dropped: Array<{ ticker: string; reason: "not_in_db" | "zero_weight" }>;
};

export type BuildHoldingSeedsResult = {
  seeds: HoldingSeed[];
  skipped: Array<{ ticker: string; reason: string }>;
};

export function normalizeAllocations(
  allocsInput: AllocationInput[],
): NormalizeAllocationsResult {
  const dropped: Array<{ ticker: string; reason: "not_in_db" | "zero_weight" }> = [];

  const cleaned = allocsInput
    .map((a) => ({
      ticker: normalizeTicker(a.ticker),
      weight: Number(a.weight) || 0,
    }))
    .filter((a) => {
      if (!ETF_DB[a.ticker]) {
        dropped.push({ ticker: a.ticker, reason: "not_in_db" });
        return false;
      }
      if (a.weight <= 0) {
        dropped.push({ ticker: a.ticker, reason: "zero_weight" });
        return false;
      }
      return true;
    });

  const totalWeight = cleaned.reduce((sum, a) => sum + a.weight, 0);
  if (totalWeight <= 0) return { normalized: [], dropped };

  return {
    normalized: cleaned.map((a) => ({
      ...a,
      weight: a.weight / totalWeight,
    })),
    dropped,
  };
}

export function buildHoldingSeeds(
  allocs: NormalizedAllocation[],
  capital: number,
  supportsFractional = false,
): BuildHoldingSeedsResult {
  const seeds: HoldingSeed[] = [];
  const skipped: Array<{ ticker: string; reason: string }> = [];

  for (const alloc of allocs) {
    const db = ETF_DB[alloc.ticker];
    if (!db) continue;

    const estValue = capital * alloc.weight;

    if (supportsFractional) {
      seeds.push({
        ticker: alloc.ticker,
        shares: roundTo(estValue / db.price, 4),
        avgCost: db.price,
        cagrOvr: null as null,
      });
      continue;
    }

    const rawShares = Math.floor(estValue / db.price);

    if (rawShares < 1) {
      if (db.price <= estValue * 2) {
        seeds.push({
          ticker: alloc.ticker,
          shares: 1,
          avgCost: db.price,
          cagrOvr: null as null,
        });
      } else {
        skipped.push({
          ticker: alloc.ticker,
          reason: `Price $${db.price.toFixed(2)} exceeds affordable range for ${(alloc.weight * 100).toFixed(1)}% allocation`,
        });
      }
    } else {
      seeds.push({
        ticker: alloc.ticker,
        shares: rawShares,
        avgCost: db.price,
        cagrOvr: null as null,
      });
    }
  }

  return { seeds, skipped };
}
