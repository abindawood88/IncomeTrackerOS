import assert from "node:assert/strict";
import { useDFPStore, sanitizeGoalPatch } from "../lib/store";

function resetStore(): void {
  useDFPStore.setState((state) => ({
    ...state,
    goal: {
      targetIncome: 5000,
      capital: 0,
      hasSetCapital: false,
      monthly: 2000,
      drip: true,
      years: 30,
      strategy: "income",
      riskTolerance: "medium",
      targetPeriod: "monthly",
      taxEnabled: true,
      taxRate: 30,
      goalMode: "manual",
      coveragePct: 100,
      preferredTypes: ["Core Dividend", "Option Income"],
    },
    holdings: [],
    allocs: [],
    actualDividends: new Array(12).fill(0),
    expenseGoals: [],
    onboarding: { currentStep: "strategy", completedAt: null },
  }));
}

{
  const patch = sanitizeGoalPatch({ capital: -5000 });
  assert.equal(patch.capital, 0);
}
{
  const patch = sanitizeGoalPatch({ capital: 200_000_000 });
  assert.equal(patch.capital, 100_000_000);
}
{
  const patch = sanitizeGoalPatch({ taxRate: Number.NaN });
  assert.equal(patch.taxRate, 0);
}
{
  const patch = sanitizeGoalPatch({ taxRate: 150 });
  assert.equal(patch.taxRate, 100);
}
{
  const patch = sanitizeGoalPatch({ years: 0 });
  assert.equal(patch.years, 1);
}
{
  const patch = sanitizeGoalPatch({ years: 200 });
  assert.equal(patch.years, 50);
}
{
  const patch = sanitizeGoalPatch({ preferredTypes: new Array(8).fill("Core Dividend") as never });
  assert.equal(patch.preferredTypes?.length, 4);
}

resetStore();
useDFPStore.getState().setGoal({ capital: -5000 });
assert.equal(useDFPStore.getState().goal.capital, 0);
useDFPStore.getState().setGoal({ years: 200 });
assert.equal(useDFPStore.getState().goal.years, 50);
useDFPStore.getState().setGoal({ taxRate: Number.NaN });
assert.equal(useDFPStore.getState().goal.taxRate, 0);

resetStore();
useDFPStore.getState().addHolding({ ticker: "SCHD", shares: -10, avgCost: 80, cagrOvr: null });
assert.equal(useDFPStore.getState().holdings.length, 0);
resetStore();
useDFPStore.getState().addHolding({ ticker: "SCHD", shares: Number.NaN, avgCost: 80, cagrOvr: null });
assert.equal(useDFPStore.getState().holdings.length, 0);
resetStore();
useDFPStore.getState().addHolding({ ticker: "schd", shares: 10, avgCost: 80, cagrOvr: null });
assert.equal(useDFPStore.getState().holdings[0].ticker, "SCHD");

{
  const patch = sanitizeGoalPatch({ coveragePct: 150 });
  assert.equal(patch.coveragePct, 100);
}
