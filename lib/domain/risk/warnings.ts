import type { EnrichedHolding, RiskWarning } from '../../types';

const THRESHOLDS = {
  CONCENTRATION_MAX: 0.4,
  LEVERAGE_WARN: 0.25,
  HIGH_YIELD: 0.15,
  HIGH_EXPENSE_RATIO: 0.008,
  UNREALISTIC_INCOME_MULTIPLE: 0.2,
} as const;

export function generateRiskWarnings(
  holdings: EnrichedHolding[],
  goal: {
    targetIncome: number;
    targetPeriod: 'monthly' | 'yearly';
    capital: number;
  },
  getExpenseRatio?: (ticker: string) => number,
): RiskWarning[] {
  const warnings: RiskWarning[] = [];
  const totalValue = holdings.reduce((s, h) => s + h.value, 0);
  if (totalValue === 0) return warnings;

  holdings.forEach((h) => {
    const w = h.value / totalValue;
    if (w > THRESHOLDS.CONCENTRATION_MAX) {
      warnings.push({
        id: `concentration-${h.ticker}`,
        severity: 'high',
        message: `${h.ticker} makes up ${(w * 100).toFixed(0)}% of your portfolio.`,
        detail: 'Consider diversifying to reduce single-ETF concentration risk.',
      });
    }
  });

  const leveragedValue = holdings.filter((h) => h.leveraged).reduce((s, h) => s + h.value, 0);
  const leveragedPct = leveragedValue / totalValue;
  if (leveragedPct > THRESHOLDS.LEVERAGE_WARN) {
    warnings.push({
      id: 'leverage-overuse',
      severity: 'high',
      message: `${(leveragedPct * 100).toFixed(0)}% of your portfolio is in leveraged ETFs.`,
      detail: 'Leveraged ETFs can decay significantly over time. Reduce exposure unless you have high risk tolerance.',
    });
  }

  const blendedYield = holdings.reduce((s, h) => s + (h.value / totalValue) * h.yld, 0);
  if (blendedYield > THRESHOLDS.HIGH_YIELD) {
    warnings.push({
      id: 'high-blended-yield',
      severity: 'medium',
      message: `Your blended yield of ${(blendedYield * 100).toFixed(1)}% is very high.`,
      detail: 'Yields above 15% often come with high capital erosion risk. Verify sustainability.',
    });
  }

  const annualTarget = goal.targetPeriod === 'monthly' ? goal.targetIncome * 12 : goal.targetIncome;
  const capitalRequired = annualTarget / Math.max(blendedYield, 0.01);
  if (goal.capital > 0 && annualTarget / goal.capital > THRESHOLDS.UNREALISTIC_INCOME_MULTIPLE) {
    warnings.push({
      id: 'unrealistic-income-target',
      severity: 'medium',
      message: `Your income target requires a yield of ${((annualTarget / goal.capital) * 100).toFixed(0)}% on current capital.`,
      detail: `At your current blended yield, you would need approximately $${Math.round(capitalRequired).toLocaleString()} in capital.`,
    });
  }

  if (getExpenseRatio) {
    const weightedExpenseRatio = holdings.reduce((s, h) => s + (h.value / totalValue) * getExpenseRatio(h.ticker), 0);
    if (weightedExpenseRatio > THRESHOLDS.HIGH_EXPENSE_RATIO) {
      warnings.push({
        id: 'high-expense-ratio',
        severity: 'low',
        message: `Portfolio weighted expense ratio is ${(weightedExpenseRatio * 100).toFixed(2)}%.`,
        detail: 'Consider lower-cost alternatives for core positions to reduce long-term fee drag.',
      });
    }
  }

  return warnings;
}
