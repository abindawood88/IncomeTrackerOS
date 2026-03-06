import assert from "node:assert/strict";
import { effectiveTargetMonthly } from "../lib/use-derived-metrics";

test('goal-target.test', () => {
const expenses = [
  { id: "1", name: "Rent", amountMonthly: 2000, enabledForGoal: true, createdAt: 1 },
  { id: "2", name: "Phone", amountMonthly: 100, enabledForGoal: false, createdAt: 1 },
];

{
  const target = effectiveTargetMonthly({
    goalMode: "manual",
    manualTargetMonthly: 4200,
    expenses,
    coveragePct: 100,
    taxEnabled: true,
    taxRate: 30,
  });
  assert.equal(target, 4200);
}

{
  const target = effectiveTargetMonthly({
    goalMode: "expenses",
    manualTargetMonthly: 4200,
    expenses,
    coveragePct: 50,
    taxEnabled: true,
    taxRate: 20,
  });
  assert.equal(target, 1250);
}

});
