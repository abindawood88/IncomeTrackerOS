import assert from "node:assert/strict";
import { ETF_DB, PORTFOLIO_TEMPLATES, validateETFCategoryConsistency } from "../lib/etf-db";
import {
  buildRecommendations,
  compareTemplates,
  desiredYieldForGoal,
  validateTemplateForCapital,
} from "../lib/portfolio-recommendation";

test('portfolio-recommendation.test', () => {
{
  const result = desiredYieldForGoal("income", 1000, 100_000);
  assert.equal(result.desiredYield, 0.12);
  assert.equal(result.capped, false);
  assert.equal(result.rawYield, 0.12);
}

{
  const result = desiredYieldForGoal("income", 5000, 10_000);
  assert.equal(result.desiredYield, 0.3);
  assert.equal(result.capped, true);
  assert.equal(result.rawYield, 6);
}

assert.equal(desiredYieldForGoal("income", 0, 0).desiredYield, 0.06);
assert.equal(desiredYieldForGoal("growth", 0, 0).desiredYield, 0.025);
assert.equal(desiredYieldForGoal("hyper", 0, 0).desiredYield, 0.12);
assert.equal(desiredYieldForGoal("income", 12_000, 100_000, "yearly").desiredYield, 0.12);
assert.equal(desiredYieldForGoal("income", 1_000, 100_000, "monthly").desiredYield, 0.12);

{
  const result = buildRecommendations({
    strategy: "income",
    risk: "medium",
    targetMonthly: 1000,
    capital: 0,
    hasSetCapital: false,
    targetPeriod: "monthly",
    preferredTypes: [],
    baseTemplates: [],
  });
  assert.equal(result.templates.length, 0);
  assert.equal(result.noCapitalSet, true);
}

{
  const result = buildRecommendations({
    strategy: "income",
    risk: "medium",
    targetMonthly: 2000,
    capital: 5000,
    hasSetCapital: true,
    targetPeriod: "monthly",
    preferredTypes: [],
    baseTemplates: PORTFOLIO_TEMPLATES,
  });
  assert.equal(result.yieldGoal.capped, true);
  assert.ok(result.message && result.message.includes("%"));
}

{
  const result = buildRecommendations({
    strategy: "income",
    risk: "medium",
    targetMonthly: 1000,
    capital: 50_000,
    hasSetCapital: true,
    targetPeriod: "monthly",
    preferredTypes: [],
    baseTemplates: PORTFOLIO_TEMPLATES,
  });
  assert.ok(result.templates.length <= 3);
}

{
  const result = buildRecommendations({
    strategy: "income",
    risk: "medium",
    targetMonthly: 1000,
    capital: 50_000,
    hasSetCapital: true,
    targetPeriod: "monthly",
    preferredTypes: ["Leveraged"],
    baseTemplates: PORTFOLIO_TEMPLATES.filter((tpl) => tpl.id === "dividend-aristocrats"),
  });
  assert.equal(result.templates.some((tpl) => tpl.id === "dividend-aristocrats"), false);
}

{
  const badTemplate = {
    ...PORTFOLIO_TEMPLATES[0],
    id: "expensive",
    holdings: [
      { ticker: "VOO", weight: 0.5 },
      { ticker: "QQQ", weight: 0.5 },
    ],
  };
  const result = buildRecommendations({
    strategy: "growth",
    risk: "low",
    targetMonthly: 100,
    capital: 10,
    hasSetCapital: true,
    targetPeriod: "monthly",
    preferredTypes: [],
    baseTemplates: [badTemplate],
  });
  assert.equal(result.templates[0].capitalWarning, true);
}

{
  const dup = PORTFOLIO_TEMPLATES[0];
  const result = buildRecommendations({
    strategy: "income",
    risk: "medium",
    targetMonthly: 1000,
    capital: 100_000,
    hasSetCapital: true,
    targetPeriod: "monthly",
    preferredTypes: ["Core Dividend"],
    baseTemplates: [dup, dup],
  });
  const ids = result.templates.map((tpl) => tpl.id);
  assert.equal(new Set(ids).size, ids.length);
}

{
  const result = validateTemplateForCapital(
    {
      ...PORTFOLIO_TEMPLATES[0],
      holdings: [
        { ticker: "SCHD", weight: 0.5 },
        { ticker: "VYM", weight: 0.5 },
      ],
    },
    100_000,
  );
  assert.deepEqual(result, { viable: true, affordableCount: 2, totalCount: 2 });
}

{
  const result = validateTemplateForCapital(
    {
      ...PORTFOLIO_TEMPLATES[0],
      holdings: [{ ticker: "SCHD", weight: 1 }],
    },
    1,
  );
  assert.equal(result.viable, false);
}

{
  const input = {
    strategy: "income" as const,
    risk: "medium" as const,
    targetMonthly: 1200,
    capital: 100_000,
    hasSetCapital: true,
    targetPeriod: "monthly" as const,
    preferredTypes: [],
    baseTemplates: PORTFOLIO_TEMPLATES,
  };
  const result = buildRecommendations(input);
  if (result.templates.length >= 1) {
    const rows = compareTemplates(result.templates, input.capital, input.preferredTypes);
    assert.ok(Array.isArray(rows));
    assert.ok(rows.length >= 1);
  }
}

{
  const consistency = validateETFCategoryConsistency(ETF_DB);
  assert.equal(consistency.length, 0);
}
});
