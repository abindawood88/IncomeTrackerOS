import type { ETFRecord, RiskTolerance, Strategy } from "./types";
import { clamp } from "./utils";

export type ETFScoreComponents = {
  yieldScore: number;
  stabilityScore: number;
  riskScore: number;
  qualityScore: number;
  payFreqScore: number;
  total: number;
};

export type ScoredETF = {
  etf: ETFRecord;
  components: ETFScoreComponents;
};

export function scoreETF(
  etf: ETFRecord,
  params: {
    targetYield: number;
    strategy: Strategy;
    riskTolerance: RiskTolerance;
  },
): ETFScoreComponents {
  const yieldDiff = Math.abs(etf.yield - params.targetYield);
  const yieldScore = clamp(25 - yieldDiff * 150, 0, 25);

  let stabilityScore = 12;
  if (etf.sparkline.length >= 6) {
    const mean = etf.sparkline.reduce((sum, price) => sum + price, 0) / etf.sparkline.length;
    if (mean > 0) {
      const variance =
        etf.sparkline.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) /
        etf.sparkline.length;
      const stdDev = Math.sqrt(variance);
      const cv = stdDev / mean;
      stabilityScore = clamp(25 - cv * 250, 0, 25);
    }
  }

  let riskScore = 20;
  if (etf.leveraged) {
    if (params.riskTolerance === "low") riskScore -= 18;
    else if (params.riskTolerance === "medium") riskScore -= 10;
    else riskScore -= 2;
  }

  if (etf.yield > 0.15 && params.strategy !== "hyper") {
    if (params.riskTolerance === "low") riskScore -= 12;
    else if (params.riskTolerance === "medium") riskScore -= 6;
  }

  if (etf.health === "STABLE") riskScore = Math.min(20, riskScore + 3);
  if (etf.health === "CRITICAL") riskScore = Math.max(0, riskScore - 8);
  if (etf.health === "WARNING") riskScore = Math.max(0, riskScore - 3);
  riskScore = clamp(riskScore, 0, 20);

  const cagr = etf.cagr ?? 0;
  const totalReturn = etf.yield + Math.max(0, cagr);
  let qualityScore = 0;
  if (params.strategy === "growth") qualityScore = clamp(cagr * 120, 0, 20);
  else if (params.strategy === "hyper") qualityScore = clamp(etf.yield * 80, 0, 20);
  else qualityScore = clamp(totalReturn * 60, 0, 20);
  if (cagr < 0) qualityScore = Math.max(0, qualityScore - 8);

  let payFreqScore = 0;
  if (params.strategy === "income" || params.strategy === "hyper") {
    if (etf.payFreq === "weekly") payFreqScore = 10;
    else if (etf.payFreq === "monthly") payFreqScore = 8;
    else if (etf.payFreq === "quarterly") payFreqScore = 3;
    else payFreqScore = 0;
  } else {
    payFreqScore = 5;
  }

  const total = clamp(
    yieldScore + stabilityScore + riskScore + qualityScore + payFreqScore,
    0,
    100,
  );

  return {
    yieldScore,
    stabilityScore,
    riskScore,
    qualityScore,
    payFreqScore,
    total,
  };
}

export function rankETFs(
  etfs: ETFRecord[],
  params: Parameters<typeof scoreETF>[1],
): ScoredETF[] {
  return etfs
    .map((etf) => ({ etf, components: scoreETF(etf, params) }))
    .sort((a, b) => b.components.total - a.components.total);
}
