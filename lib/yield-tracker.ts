export type MonthlyYieldEntry = {
  month: number;
  label: string;
  actual: number;
  estimated: number;
  target: number;
};

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function buildYieldTrackerData(
  actualDividends: number[],
  monthlyIncomeFromHoldings: number | number[],
  targetIncome: number,
): MonthlyYieldEntry[] {
  const baseSeries = Array.isArray(monthlyIncomeFromHoldings)
    ? Array.from({ length: 12 }, (_, i) => monthlyIncomeFromHoldings[i] ?? 0)
    : Array.from({ length: 12 }, () => monthlyIncomeFromHoldings);

  const alpha = 0.6;

  return Array.from({ length: 12 }, (_, i) => {
    const actual = actualDividends[i] ?? 0;
    let adjustment = 1;
    let hasHistory = false;

    for (let j = 0; j < i; j += 1) {
      const priorActual = actualDividends[j] ?? 0;
      const priorBase = baseSeries[j] ?? 0;
      if (priorActual <= 0 || priorBase <= 0) continue;
      const ratio = priorActual / priorBase;
      adjustment = alpha * ratio + (1 - alpha) * adjustment;
      hasHistory = true;
    }

    const estimated = hasHistory
      ? baseSeries[i] * clamp(adjustment, 0.25, 4)
      : baseSeries[i];

    return {
      month: i,
      label: MONTH_LABELS[i],
      actual,
      estimated: Math.max(0, estimated),
      target: targetIncome,
    };
  });
}

export function currentMonthEstimate(
  actualDividends: number[],
  monthlyIncomeFromHoldings: number | number[],
): number {
  const currentMonth = new Date().getMonth();
  return buildYieldTrackerData(actualDividends, monthlyIncomeFromHoldings, 0)[currentMonth].estimated;
}
