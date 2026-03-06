import type { ETFRecord } from '../../types';

function normalize(value: number, min: number, max: number): number {
  if (max === min) return 50;
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

export type AutopilotScoreComponents = {
  dividendStabilityScore: number;
  dividendYieldScore: number;
  inverseVolatility: number;
  dividendGrowthScore: number;
  inverseExpenseRatio: number;
  total: number;
};

export function scoreEtfAutopilot(etf: ETFRecord): AutopilotScoreComponents {
  const healthMap = { STABLE: 100, WARNING: 60, NEUTRAL: 40, CRITICAL: 10 };
  const healthScore = healthMap[etf.health] ?? 40;
  const drawdownScore = normalize(1 - etf.maxDrawdown, 0, 1);
  const dividendStabilityScore = healthScore * 0.6 + drawdownScore * 0.4;

  const yldPct = etf.yield * 100;
  let dividendYieldScore: number;
  if (yldPct >= 4 && yldPct <= 12) dividendYieldScore = normalize(yldPct, 4, 12) * 0.5 + 50;
  else if (yldPct < 4) dividendYieldScore = normalize(yldPct, 0, 4) * 0.5;
  else dividendYieldScore = Math.max(0, 100 - (yldPct - 12) * 3);

  const inverseVolatility = normalize(100 - etf.volatilityScore, 0, 100);
  const dividendGrowthScore = normalize(etf.dividendGrowthRate * 100, 0, 15);
  const inverseExpenseRatio = normalize(1 - Math.min(1, etf.expenseRatio * 100), 0, 1);

  const total =
    0.35 * dividendStabilityScore +
    0.25 * dividendYieldScore +
    0.2 * inverseVolatility +
    0.1 * dividendGrowthScore +
    0.1 * inverseExpenseRatio;

  return {
    dividendStabilityScore: Math.round(dividendStabilityScore),
    dividendYieldScore: Math.round(dividendYieldScore),
    inverseVolatility: Math.round(inverseVolatility),
    dividendGrowthScore: Math.round(dividendGrowthScore),
    inverseExpenseRatio: Math.round(inverseExpenseRatio),
    total: Math.round(total),
  };
}
