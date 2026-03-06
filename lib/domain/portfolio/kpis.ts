import type { DashboardKPIs, EnrichedHolding, ExpenseGoal } from '../../types';
import { totalExpenses } from '../../expense-coverage';

export function calculateDashboardKPIs(
  holdings: EnrichedHolding[],
  expenses: ExpenseGoal[],
  projectionMonthlyRows: number[],
  targetMonthlyIncome: number,
  currentYear: number = new Date().getFullYear(),
): DashboardKPIs {
  const portfolioValue = holdings.reduce((s, h) => s + h.value, 0);
  const annualDividendIncome = holdings.reduce((s, h) => s + h.value * h.yld, 0);
  const monthlyDividendIncome = annualDividendIncome / 12;
  const totalMonthlyExpenses = totalExpenses(expenses);

  const incomeFreedomScore = totalMonthlyExpenses > 0 ? monthlyDividendIncome / totalMonthlyExpenses : null;
  const expensesCoveredPercent = incomeFreedomScore !== null ? Math.min(100, incomeFreedomScore * 100) : null;

  const freedomIdx = projectionMonthlyRows.findIndex((m) => m >= targetMonthlyIncome);
  const estimatedFreedomYear = freedomIdx >= 0 ? currentYear + freedomIdx + 1 : null;

  return {
    portfolioValue,
    monthlyDividendIncome,
    annualDividendIncome,
    incomeFreedomScore,
    expensesCoveredPercent,
    estimatedFreedomYear,
    totalExpenses: totalMonthlyExpenses,
  };
}
