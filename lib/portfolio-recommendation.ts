import { ETF_CATEGORIES, ETF_DB, TYPE_CATEGORY_MAP, type PortfolioTemplate } from "./etf-db";
import { rankETFs } from "./etf-scoring";
import type { PortfolioType, RiskTolerance, Strategy, TargetPeriod } from "./types";

export type RecommendationTemplate = PortfolioTemplate & {
  capitalWarning?: boolean;
};

export type RecommendationResult = {
  templates: RecommendationTemplate[];
  yieldGoal: YieldGoalResult;
  capitalWarning: boolean;
  noCapitalSet: boolean;
  message: string | null;
};

export type TemplateComparisonRow = {
  templateId: string;
  name: string;
  liveYield: number;
  liveCagr: number;
  riskCategory: "low" | "medium" | "high";
  estimatedMonthlyIncome: number;
  capitalNeeded: number;
  typesCovered: string[];
  capitalWarning: boolean;
  tags: string[];
};

export type YieldGoalResult = {
  desiredYield: number;
  capped: boolean;
  rawYield: number;
};

export const TYPE_OPTIONS: Array<{ key: PortfolioType; desc: string }> = [
  { key: "Core Dividend", desc: "Established dividend ETFs with steadier yield and lower volatility." },
  { key: "Covered Call", desc: "Option-income ETFs focused on higher cash flow with capped upside." },
  { key: "Growth / Index", desc: "Broad market and growth ETFs focused on compounding and total return." },
  { key: "Leveraged", desc: "3x or amplified ETFs with much higher volatility and drawdown risk." },
  { key: "Closed-End Funds", desc: "Income-focused CEFs with long distribution history and active management." },
  { key: "Option Income", desc: "Single-stock and premium-income ETFs from YieldMax, KURV, REX, NEOS and similar issuers." },
  { key: "Roundhill Income", desc: "Roundhill weekly-pay and income ETFs focused on frequent cash distributions." },
  { key: "Roundhill Thematic", desc: "Roundhill thematic growth ETFs focused on concentrated trend exposure." },
];

export function typeMatchesTicker(type: PortfolioType, ticker: string): boolean {
  const db = ETF_DB[ticker];
  if (db?.categories) {
    const categoryKeys = TYPE_CATEGORY_MAP[type] ?? [];
    return categoryKeys.some((key) => db.categories.includes(key));
  }
  const categoryKeys = TYPE_CATEGORY_MAP[type];
  if (!categoryKeys) return false;
  return categoryKeys.some((key) => ETF_CATEGORIES[key]?.includes(ticker));
}

export function templateTypeCoverage(
  tpl: PortfolioTemplate,
  preferredTypes: PortfolioType[],
): number {
  if (!preferredTypes.length) return 0;
  const holdings = tpl.holdings.map((h) => h.ticker);
  const matches = holdings.filter((ticker) =>
    preferredTypes.some((type) => typeMatchesTicker(type, ticker)),
  ).length;
  return matches / holdings.length;
}

export function desiredYieldForGoal(
  strategy: Strategy,
  targetMonthly: number,
  capital: number,
  targetPeriod: TargetPeriod = "monthly",
): YieldGoalResult {
  if (capital > 0) {
    const annualTarget = targetPeriod === "yearly" ? targetMonthly : targetMonthly * 12;
    const raw = annualTarget / capital;
    const capped = raw > 0.3;
    return {
      desiredYield: Math.min(0.3, Math.max(0.005, raw)),
      capped,
      rawYield: raw,
    };
  }
  const fallback = strategy === "growth" ? 0.025 : strategy === "hyper" ? 0.12 : 0.06;
  return {
    desiredYield: fallback,
    capped: false,
    rawYield: fallback,
  };
}

export function scoreTemplate(
  tpl: PortfolioTemplate,
  strategy: Strategy,
  risk: RiskTolerance,
  targetMonthly: number,
  capital: number,
  targetPeriod: TargetPeriod,
  preferredTypes: PortfolioType[],
): number {
  const desiredYield = desiredYieldForGoal(strategy, targetMonthly, capital, targetPeriod).desiredYield;
  const liveYield = tpl.holdings.reduce(
    (sum, h) => sum + (ETF_DB[h.ticker]?.yield ?? 0) * h.weight,
    0,
  );
  let score = 0;

  if (strategy === "income" && (tpl.category === "income" || tpl.category === "hybrid")) score += 4;
  if (strategy === "growth" && (tpl.category === "growth" || tpl.category === "hybrid")) score += 4;
  if (strategy === "hyper" && (tpl.category === "highyield" || tpl.category === "hybrid")) score += 4;

  if (risk === "low") {
    if (tpl.category === "growth" || tpl.category === "income") score += 2;
    if (tpl.category === "highyield") score -= 3;
  } else if (risk === "medium") {
    if (tpl.category === "hybrid") score += 2;
  } else {
    if (tpl.category === "highyield") score += 3;
  }

  const yieldDistance = Math.abs(liveYield - desiredYield);
  score += Math.max(0, 2 - yieldDistance * 20);
  score += templateTypeCoverage(tpl, preferredTypes) * 10;
  return score;
}

export function makeHyperHighRiskTemplate(): PortfolioTemplate {
  const holdings = [
    { ticker: "TQQQ", weight: 0.16 },
    { ticker: "UPRO", weight: 0.12 },
    { ticker: "SOXL", weight: 0.10 },
    { ticker: "TSLY", weight: 0.12 },
    { ticker: "KQQQ", weight: 0.12 },
    { ticker: "FEPI", weight: 0.12 },
    { ticker: "TSYY", weight: 0.11 },
    { ticker: "LIFT", weight: 0.07 },
    { ticker: "VOO", weight: 0.08 },
  ];

  return {
    id: "hyper-high-risk-blend",
    name: "Hyper Risk Blend",
    description:
      "Leverages 3x ETFs with high-yield ETFs across YieldMax, KURV, REX, GraniteShares YieldBOOST, and TappAlpha LIFT, plus a small VOO stability anchor.",
    category: "highyield",
    color: "#ef4444",
    targetYield: holdings.reduce((sum, h) => sum + (ETF_DB[h.ticker]?.yield ?? 0) * h.weight, 0),
    targetCagr: holdings.reduce((sum, h) => sum + (ETF_DB[h.ticker]?.cagr ?? 0) * h.weight, 0),
    holdings,
    tags: ["Leveraged", "High Yield", "High Risk", "Stability Anchor"],
  };
}

export function makeClosedEndIncomeTemplate(): PortfolioTemplate {
  const holdings = [
    { ticker: "UTG", weight: 0.22 },
    { ticker: "UTF", weight: 0.20 },
    { ticker: "EVT", weight: 0.16 },
    { ticker: "BST", weight: 0.16 },
    { ticker: "BME", weight: 0.14 },
    { ticker: "DNP", weight: 0.12 },
  ];

  return {
    id: "cef-income-stability",
    name: "Closed-End Income Target",
    description: "Income-oriented closed-end fund mix using long-running CEFs with durable distributions and solid long-run return profiles.",
    category: "income",
    color: "#0ea5a4",
    targetYield: holdings.reduce((sum, h) => sum + (ETF_DB[h.ticker]?.yield ?? 0) * h.weight, 0),
    targetCagr: holdings.reduce((sum, h) => sum + (ETF_DB[h.ticker]?.cagr ?? 0) * h.weight, 0),
    holdings,
    tags: ["CEF Income", "Long Distribution History", "Monthly Cashflow"],
  };
}

export function makeTypeFocusedTemplate(
  preferredTypes: PortfolioType[],
  strategy: Strategy,
  risk: RiskTolerance,
  targetMonthly: number,
  capital: number,
  targetPeriod: TargetPeriod,
): PortfolioTemplate | null {
  if (!preferredTypes.length) return null;

  const desiredYield = desiredYieldForGoal(strategy, targetMonthly, capital, targetPeriod).desiredYield;
  const allCandidates = Object.values(ETF_DB)
    .filter(
      (etf) =>
        etf.source !== "stub" &&
        preferredTypes.some((type) => typeMatchesTicker(type, etf.ticker)),
    );
  const ranked = rankETFs(allCandidates, {
    targetYield: desiredYield,
    strategy,
    riskTolerance: risk,
  });
  const scored = ranked.map((item) => ({ etf: item.etf, score: item.components.total }));

  const byType = preferredTypes.map((type) =>
    scored.filter((item) => typeMatchesTicker(type, item.etf.ticker)),
  );
  const seen = new Set<string>();
  const candidates: Array<{ etf: (typeof ETF_DB)[string]; score: number }> = [];

  if (preferredTypes.length > 1) {
    const perTypeTarget = Math.max(1, Math.floor(6 / preferredTypes.length));
    for (const group of byType) {
      let added = 0;
      for (const item of group) {
        if (seen.has(item.etf.ticker)) continue;
        candidates.push(item);
        seen.add(item.etf.ticker);
        added += 1;
        if (added >= perTypeTarget) break;
      }
    }
  }

  for (const item of scored) {
    if (seen.has(item.etf.ticker)) continue;
    candidates.push(item);
    seen.add(item.etf.ticker);
    if (candidates.length >= 6) break;
  }

  if (!candidates.length) return null;

  const weightBase = [0.24, 0.20, 0.17, 0.15, 0.13, 0.11];
  const holdings = candidates.slice(0, 6).map((item, idx) => ({
    ticker: item.etf.ticker,
    weight: weightBase[idx] ?? 0.1,
  }));
  const totalWeight = holdings.reduce((sum, h) => sum + h.weight, 0);
  const normalized = holdings.map((h) => ({ ...h, weight: h.weight / totalWeight }));

  const label = preferredTypes.length === 1 ? preferredTypes[0] : "Custom Type Mix";

  return {
    id: `type-focused-${preferredTypes.join("-").toLowerCase().replace(/\s+/g, "-")}`,
    name: `${label} Target`,
    description: `Auto-built to match your selected portfolio type${preferredTypes.length > 1 ? "s" : ""}, risk profile, and income goal.`,
    category: strategy === "growth" ? "growth" : strategy === "hyper" ? "highyield" : "income",
    color: strategy === "growth" ? "#2563eb" : strategy === "hyper" ? "#ef4444" : "#0ea5a4",
    targetYield: normalized.reduce((sum, h) => sum + (ETF_DB[h.ticker]?.yield ?? 0) * h.weight, 0),
    targetCagr: normalized.reduce((sum, h) => sum + (ETF_DB[h.ticker]?.cagr ?? 0) * h.weight, 0),
    holdings: normalized,
    tags: [...preferredTypes, `${risk} risk`, `${strategy} goal`],
  };
}

export function makeSingleTypeTemplate(
  type: PortfolioType,
  strategy: Strategy,
  risk: RiskTolerance,
  targetMonthly: number,
  capital: number,
  targetPeriod: TargetPeriod,
): PortfolioTemplate | null {
  const tpl = makeTypeFocusedTemplate([type], strategy, risk, targetMonthly, capital, targetPeriod);
  if (!tpl) return null;
  return {
    ...tpl,
    id: `type-${type.toLowerCase().replace(/\s+/g, "-")}`,
    name: `${type} Focus`,
    description: `Built from ${type} holdings to match your selected goal and risk profile.`,
    tags: [type, `${risk} risk`, `${strategy} goal`],
  };
}

export function buildRecommendations(args: {
  strategy: Strategy;
  risk: RiskTolerance;
  targetMonthly: number;
  capital: number;
  hasSetCapital: boolean;
  targetPeriod: TargetPeriod;
  preferredTypes: PortfolioType[];
  baseTemplates: PortfolioTemplate[];
}): RecommendationResult {
  const { strategy, risk, targetMonthly, capital, hasSetCapital, targetPeriod, preferredTypes, baseTemplates } = args;
  if (!hasSetCapital || capital <= 0) {
    return {
      templates: [],
      yieldGoal: desiredYieldForGoal(strategy, targetMonthly, 0, targetPeriod),
      capitalWarning: false,
      noCapitalSet: true,
      message: "Set your starting capital to receive personalized portfolio recommendations.",
    };
  }

  const yieldGoal = desiredYieldForGoal(strategy, targetMonthly, capital, targetPeriod);
  let message: string | null = null;
  if (yieldGoal.capped) {
    message = `Your income target requires ~${(yieldGoal.rawYield * 100).toFixed(0)}% yield. We've shown the highest available options, but this goal may not be achievable at your current capital level.`;
  }

  const dynamicTemplates = preferredTypes
    .map((type) => makeSingleTypeTemplate(type, strategy, risk, targetMonthly, capital, targetPeriod))
    .filter((tpl): tpl is PortfolioTemplate => Boolean(tpl));

  const multiTypeTemplate = makeTypeFocusedTemplate(
    preferredTypes,
    strategy,
    risk,
    targetMonthly,
    capital,
    targetPeriod,
  );
  if (multiTypeTemplate && preferredTypes.length > 1) {
    dynamicTemplates.unshift(multiTypeTemplate);
  }

  const templates = [...dynamicTemplates, ...baseTemplates];
  if (preferredTypes.includes("Closed-End Funds")) {
    templates.unshift(makeClosedEndIncomeTemplate());
  }
  if (strategy === "hyper" && risk === "high") {
    templates.unshift(makeHyperHighRiskTemplate());
  }

  const coverageThreshold = preferredTypes.length > 0 ? 0.5 : 0.2;
  const filteredTemplates = preferredTypes.length
    ? templates.filter((tpl) => templateTypeCoverage(tpl, preferredTypes) > coverageThreshold)
    : templates;

  const sorted = filteredTemplates
    .filter((tpl, index, arr) => arr.findIndex((x) => x.id === tpl.id) === index)
    .sort(
      (a, b) =>
        scoreTemplate(b, strategy, risk, targetMonthly, capital, targetPeriod, preferredTypes) -
        scoreTemplate(a, strategy, risk, targetMonthly, capital, targetPeriod, preferredTypes),
    );
  const viable = sorted.filter((tpl) => validateTemplateForCapital(tpl, capital).viable);
  if (viable.length > 0) {
    return {
      templates: viable.slice(0, 3),
      yieldGoal,
      capitalWarning: false,
      noCapitalSet: false,
      message,
    };
  }

  return {
    templates: sorted.slice(0, 3).map((tpl) => ({ ...tpl, capitalWarning: true })),
    yieldGoal,
    capitalWarning: true,
    noCapitalSet: false,
    message,
  };
}

export function buildReviewUniverse(args: {
  strategy: Strategy;
  risk: RiskTolerance;
  targetMonthly: number;
  capital: number;
  targetPeriod: TargetPeriod;
  preferredTypes: PortfolioType[];
}): string[] {
  const { strategy, risk, targetMonthly, capital, targetPeriod, preferredTypes } = args;
  const desiredYield = desiredYieldForGoal(strategy, targetMonthly, capital, targetPeriod).desiredYield;

  const pool = Object.values(ETF_DB).filter((etf) =>
    etf.source !== "stub" &&
    (preferredTypes.length === 0
      ? true
      : preferredTypes.some((type) => typeMatchesTicker(type, etf.ticker))),
  );

  const ranked = rankETFs(pool, {
    targetYield: desiredYield,
    strategy,
    riskTolerance: risk,
  }).map((item) => ({
    ticker: item.etf.ticker,
    score: item.components.total,
    etf: item.etf,
  }));

  if (preferredTypes.length <= 1) {
    return ranked.slice(0, 60).map((x) => x.ticker);
  }

  const grouped = preferredTypes.map((type) =>
    ranked.filter((item) => typeMatchesTicker(type, item.ticker)),
  );
  const seen = new Set<string>();
  const result: string[] = [];
  const groupIndexes = grouped.map(() => 0);

  while (result.length < 60) {
    let addedThisRound = false;
    for (let g = 0; g < grouped.length; g += 1) {
      while (
        groupIndexes[g] < grouped[g].length &&
        seen.has(grouped[g][groupIndexes[g]].ticker)
      ) {
        groupIndexes[g] += 1;
      }
      if (groupIndexes[g] >= grouped[g].length) continue;
      const item = grouped[g][groupIndexes[g]++];
      seen.add(item.ticker);
      result.push(item.ticker);
      addedThisRound = true;
      if (result.length >= 60) break;
    }
    if (!addedThisRound) break;
  }

  for (const item of ranked) {
    if (result.length >= 60) break;
    if (seen.has(item.ticker)) continue;
    seen.add(item.ticker);
    result.push(item.ticker);
  }

  return result;
}

export function validateTemplateForCapital(
  tpl: PortfolioTemplate,
  capital: number,
): { viable: boolean; affordableCount: number; totalCount: number } {
  const totalCount = tpl.holdings.length;
  const affordableCount = tpl.holdings.filter((h) => {
    const db = ETF_DB[h.ticker];
    if (!db) return false;
    const estValue = capital * h.weight;
    return db.price <= estValue * 2;
  }).length;

  return {
    viable: totalCount > 0 ? affordableCount / totalCount >= 0.6 : false,
    affordableCount,
    totalCount,
  };
}

export function compareTemplates(
  templates: PortfolioTemplate[],
  capital: number,
  preferredTypes: PortfolioType[],
): TemplateComparisonRow[] {
  return templates.map((tpl) => {
    const liveYield = tpl.holdings.reduce(
      (sum, holding) => sum + (ETF_DB[holding.ticker]?.yield ?? 0) * holding.weight,
      0,
    );
    const liveCagr = tpl.holdings.reduce(
      (sum, holding) => sum + (ETF_DB[holding.ticker]?.cagr ?? 0) * holding.weight,
      0,
    );
    const capitalNeeded = tpl.holdings.reduce(
      (sum, holding) => sum + (ETF_DB[holding.ticker]?.price ?? 0),
      0,
    );
    const estimatedMonthlyIncome = Math.round((capital * liveYield) / 12);
    const hasLeveraged = tpl.holdings.some((holding) => ETF_DB[holding.ticker]?.leveraged);
    const riskCategory: "low" | "medium" | "high" =
      hasLeveraged || liveYield > 0.15 ? "high" : liveYield > 0.07 ? "medium" : "low";
    const typesCovered = preferredTypes.filter((type) =>
      tpl.holdings.some((holding) => typeMatchesTicker(type, holding.ticker)),
    );
    const { viable } = validateTemplateForCapital(tpl, capital);

    return {
      templateId: tpl.id,
      name: tpl.name,
      liveYield,
      liveCagr,
      riskCategory,
      estimatedMonthlyIncome,
      capitalNeeded,
      typesCovered,
      capitalWarning: !viable,
      tags: tpl.tags,
    };
  });
}
