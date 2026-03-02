import type { ExpenseCoverageResult, ExpenseGoal } from "./types";

export function computeExpenseCoverage(
  monthlyIncome: number,
  goals: ExpenseGoal[],
): ExpenseCoverageResult[] {
  let remaining = Math.max(0, monthlyIncome);
  let cumulativeUsed = 0;

  return goals.map((goal) => {
    const covered = Math.min(remaining, goal.amount);
    const uncovered = Math.max(0, goal.amount - covered);
    const pct = goal.amount > 0 ? Math.round((covered / goal.amount) * 100) : 0;
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
  return goals.reduce((sum, goal) => sum + goal.amount, 0);
}

export function coveredGoalCount(results: ExpenseCoverageResult[]): number {
  return results.filter((result) => result.fullyMet).length;
}
