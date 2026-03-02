import assert from "node:assert/strict";
import { computeExpenseCoverage } from "../lib/expense-coverage";
import type { ExpenseGoal } from "../lib/types";

function goal(id: string, label: string, amount: number): ExpenseGoal {
  return { id, label, amount, createdAt: 1 };
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
  const results = computeExpenseCoverage(0, [goal("1", "Car", 400)]);
  assert.equal(results[0].covered, 0);
  assert.equal(results[0].uncovered, 400);
  assert.equal(results[0].pct, 0);
  assert.equal(results[0].fullyMet, false);
}

{
  const results = computeExpenseCoverage(1000, [goal("1", "Free", 0)]);
  assert.equal(results[0].pct, 0);
  assert.equal(results[0].fullyMet, true);
}

{
  const a = computeExpenseCoverage(500, [goal("1", "Car", 400), goal("2", "Mortgage", 900)]);
  const b = computeExpenseCoverage(500, [goal("2", "Mortgage", 900), goal("1", "Car", 400)]);
  assert.notDeepEqual(a.map((row) => row.covered), b.map((row) => row.covered));
}

{
  const results = computeExpenseCoverage(1500, [
    goal("1", "Car", 400),
    goal("2", "Phone", 100),
    goal("3", "Mortgage", 900),
  ]);
  assert.equal(results[0].cumulativeUsed, 400);
  assert.equal(results[1].cumulativeUsed, 500);
  assert.equal(results[2].cumulativeUsed, 1400);
}
