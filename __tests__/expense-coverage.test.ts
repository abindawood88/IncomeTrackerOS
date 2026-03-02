import assert from "node:assert/strict";
import { computeExpenseCoverage, computeRequiredMonthlyIncomeFromExpenses } from "../lib/expense-coverage";
import type { ExpenseGoal } from "../lib/types";

function goal(id: string, name: string, amountMonthly: number, enabledForGoal = true): ExpenseGoal {
  return { id, name, amountMonthly, enabledForGoal, createdAt: 1 };
}

{
  const results = computeExpenseCoverage(2000, [goal("1", "Car", 400), goal("2", "Phone", 100)]);
  assert.deepEqual(
    { covered: results[0].covered, uncovered: results[0].uncovered, pct: results[0].pct, fullyMet: results[0].fullyMet },
    { covered: 400, uncovered: 0, pct: 100, fullyMet: true },
  );
  assert.deepEqual(
    { covered: results[1].covered, uncovered: results[1].uncovered, pct: results[1].pct, fullyMet: results[1].fullyMet },
    { covered: 100, uncovered: 0, pct: 100, fullyMet: true },
  );
}

{
  const results = computeExpenseCoverage(500, [goal("1", "Car", 400), goal("2", "Mortgage", 900)]);
  assert.equal(results[0].covered, 400);
  assert.equal(results[1].covered, 100);
  assert.equal(results[1].uncovered, 800);
  assert.equal(results[1].pct, 11);
}

{
  const withTax = computeRequiredMonthlyIncomeFromExpenses({
    goals: [goal("1", "Rent", 2000), goal("2", "Phone", 100, false)],
    coveragePct: 50,
    taxEnabled: true,
    taxRate: 20,
  });
  assert.equal(withTax, 1250);
}

{
  const withoutTax = computeRequiredMonthlyIncomeFromExpenses({
    goals: [goal("1", "Rent", 2000), goal("2", "Phone", 100)],
    coveragePct: 50,
    taxEnabled: false,
    taxRate: 20,
  });
  assert.equal(withoutTax, 1050);
}
