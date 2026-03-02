import type { ExpenseCoverageResult, ExpenseGoal } from "./types";

export function computeExpenseCoverage(
  monthlyIncome: number,
  goals: ExpenseGoal[],
): ExpenseCoverageResult[] {
  let remaining = Math.max(0, monthlyIncome);
  let cumulativeUsed = 0;

  return goals.map((goal) => {
    const amount = goal.amountMonthly;
    const covered = Math.min(remaining, amount);
    const uncovered = Math.max(0, amount - covered);
    const pct = amount > 0 ? Math.round((covered / amount) * 100) : 0;
    remaining -= covered;
    cumulativeUsed += covered;

    return {
      goal,
      covered,
      uncovered,
      pct,
      fullyMet: uncovered === 0,
      cumulativeUsed,
    };
  });
}

export function totalExpenses(goals: ExpenseGoal[]): number {
  return goals.reduce((sum, goal) => sum + goal.amountMonthly, 0);
}

export function totalEnabledExpenses(goals: ExpenseGoal[]): number {
  return goals.reduce((sum, goal) => sum + (goal.enabledForGoal ? goal.amountMonthly : 0), 0);
}

export function computeRequiredMonthlyIncomeFromExpenses(args: {
  goals: ExpenseGoal[];
  coveragePct: number;
  taxEnabled: boolean;
  taxRate: number;
}): number {
  const coverage = Math.max(0, Math.min(100, args.coveragePct)) / 100;
  const requiredNetMonthly = totalEnabledExpenses(args.goals) * coverage;
  if (!args.taxEnabled) return requiredNetMonthly;
  const clampedTaxRate = Math.max(0, Math.min(100, args.taxRate));
  const denominator = 1 - clampedTaxRate / 100;
  if (denominator <= 0) return 0;
  return requiredNetMonthly / denominator;
}

export function coveredGoalCount(results: ExpenseCoverageResult[]): number {
  return results.filter((result) => result.fullyMet).length;
}
