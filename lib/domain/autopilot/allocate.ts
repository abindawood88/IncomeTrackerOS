import type { AutopilotOutput, ETFRecord, RecommendationInput } from '../../types';
import { loadEtfRegistry } from '../../etf-db';
import { scoreEtfAutopilot } from './score';
import { normalizeRiskTolerance } from '../../utils';

const MAX_SINGLE_WEIGHT = 0.3;
const MIN_HOLDINGS = 3;
const LEVERAGE_CAPS: Record<'low' | 'medium' | 'high', number> = { low: 0, medium: 0.1, high: 0.25 };

export function runAutopilot(
  input: RecommendationInput,
  currentHoldings?: { ticker: string; weight: number }[],
): AutopilotOutput {
  const riskLevel = normalizeRiskTolerance(input.riskTolerance);
  const leverageCap = LEVERAGE_CAPS[riskLevel];
  const allEtfs = loadEtfRegistry();
  const warnings: string[] = [];
  const notes: string[] = [];

  let candidates = filterCandidatesByStrategy(allEtfs, input.strategy, riskLevel);
  if (candidates.length < MIN_HOLDINGS) {
    candidates = allEtfs.filter((e) => !e.leveraged || riskLevel !== 'low');
    warnings.push('Limited ETF universe — showing best available options.');
  }

  const scored = candidates.map((etf) => ({ etf, score: scoreEtfAutopilot(etf) })).sort((a, b) => b.score.total - a.score.total);
  const topN = Math.min(8, scored.length);
  const selected = scored.slice(0, topN).map((s) => s.etf);
  const rawWeights = assignWeightsByStrategy(selected, input.strategy);
  const cappedWeights = enforceLeverageCap(rawWeights, selected, leverageCap, notes);
  const finalWeights = enforceMaxWeight(cappedWeights, MAX_SINGLE_WEIGHT, notes);
  const allocations = normalizeWeights(finalWeights);

  const blendedYield = allocations.reduce((s, a) => s + (selected.find((e) => e.ticker === a.ticker)?.yield ?? 0) * a.weight, 0);
  const blendedGrowthRate = allocations.reduce((s, a) => s + (selected.find((e) => e.ticker === a.ticker)?.cagr ?? 0) * a.weight, 0);

  const etfScores: Record<string, number> = {};
  scored.slice(0, topN).forEach((s) => {
    etfScores[s.etf.ticker] = s.score.total;
  });

  const rebalanceActions = generateRebalanceActions(allocations, currentHoldings);
  const riskScore = allocations.reduce((s, a) => s + (selected.find((e) => e.ticker === a.ticker)?.volatilityScore ?? 50) * a.weight, 0);

  if (leverageCap === 0) notes.push('Leverage excluded — conservative risk tolerance selected.');
  if (input.strategy === 'income') notes.push('Income strategy prioritizes high-yield, stable ETFs.');
  if (input.strategy === 'growth') notes.push('Growth strategy prioritizes low-expense, high-CAGR ETFs.');

  const totalWeight = allocations.reduce((s, a) => s + a.weight, 0);
  if (Math.abs(totalWeight - 1) > 0.01) warnings.push('Allocation normalization issue — weights may not sum to 100%.');

  return { allocations, etfScores, blendedYield, blendedGrowthRate, riskScore, warnings, notes, rebalanceActions };
}

function filterCandidatesByStrategy(etfs: ETFRecord[], strategy: string, riskLevel: 'low' | 'medium' | 'high'): ETFRecord[] {
  return etfs.filter((etf) => {
    if (riskLevel === 'low' && etf.leveraged) return false;
    if (riskLevel === 'medium' && etf.volatilityScore > 75) return false;
    if (strategy === 'income' && etf.yield < 0.02) return false;
    if (strategy === 'growth' && etf.cagr !== null && etf.cagr < 0.05) return false;
    return true;
  });
}

function assignWeightsByStrategy(etfs: ETFRecord[], strategy: string): { ticker: string; weight: number }[] {
  if (strategy === 'income') {
    const totalYield = etfs.reduce((s, e) => s + e.yield, 0);
    return etfs.map((e) => ({ ticker: e.ticker, weight: totalYield > 0 ? e.yield / totalYield : 1 / etfs.length }));
  }
  if (strategy === 'growth') {
    const totalCagr = etfs.reduce((s, e) => s + Math.max(0, e.cagr ?? 0), 0);
    return etfs.map((e) => ({ ticker: e.ticker, weight: totalCagr > 0 ? Math.max(0, e.cagr ?? 0) / totalCagr : 1 / etfs.length }));
  }
  return etfs.map((e) => ({ ticker: e.ticker, weight: 1 / etfs.length }));
}

function enforceLeverageCap(weights: { ticker: string; weight: number }[], etfs: ETFRecord[], cap: number, notes: string[]) {
  const leveragedTotal = weights.reduce((s, w) => s + (etfs.find((e) => e.ticker === w.ticker)?.leveraged ? w.weight : 0), 0);
  if (leveragedTotal <= cap) return weights;
  const scale = leveragedTotal > 0 ? cap / leveragedTotal : 0;
  notes.push(`Reduced leveraged ETF exposure to ${(cap * 100).toFixed(0)}% per risk rules.`);
  return weights.map((w) => (etfs.find((e) => e.ticker === w.ticker)?.leveraged ? { ...w, weight: w.weight * scale } : w));
}

function enforceMaxWeight(weights: { ticker: string; weight: number }[], max: number, notes: string[]) {
  let changed = false;
  const capped = weights.map((w) => {
    if (w.weight > max) {
      changed = true;
      return { ...w, weight: max };
    }
    return w;
  });
  if (changed) notes.push(`Single ETF allocation capped at ${(max * 100).toFixed(0)}%.`);
  return capped;
}

function normalizeWeights(weights: { ticker: string; weight: number }[]) {
  const total = weights.reduce((s, w) => s + w.weight, 0);
  if (total === 0) return weights.map((w) => ({ ...w, weight: 1 / weights.length }));
  return weights.map((w) => ({ ticker: w.ticker, weight: parseFloat((w.weight / total).toFixed(4)) }));
}

function generateRebalanceActions(target: { ticker: string; weight: number }[], current?: { ticker: string; weight: number }[]) {
  if (!current?.length) return undefined;
  return target.map((t) => {
    const existing = current.find((c) => c.ticker === t.ticker);
    if (!existing) return { action: 'buy' as const, ticker: t.ticker, targetWeight: t.weight };
    const diff = t.weight - existing.weight;
    if (Math.abs(diff) < 0.02) return { action: 'hold' as const, ticker: t.ticker, currentWeight: existing.weight, targetWeight: t.weight };
    return { action: diff > 0 ? ('buy' as const) : ('sell' as const), ticker: t.ticker, currentWeight: existing.weight, targetWeight: t.weight };
  });
}
