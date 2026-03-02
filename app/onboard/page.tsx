"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { buildHoldingSeeds, normalizeAllocations } from "@/lib/apply-portfolio";
import { ETF_DB, PORTFOLIO_ARCHETYPES, PORTFOLIO_TEMPLATES } from "@/lib/etf-db";
import {
  buildRecommendations,
  buildReviewUniverse,
  compareTemplates,
  type RecommendationResult,
  type RecommendationTemplate,
} from "@/lib/portfolio-recommendation";
import { useDFPStore } from "@/lib/store";
import type { OnboardingStep, RiskTolerance, Strategy, TargetPeriod } from "@/lib/types";
import { isOnboardingComplete } from "@/lib/utils";

const STEP_ORDER: OnboardingStep[] = [
  "strategy",
  "risk",
  "target",
  "capital",
  "types",
  "recommendations",
  "apply",
];

const STRATEGY_OPTIONS: Array<{
  key: Strategy;
  title: string;
  desc: string;
  range: string;
}> = [
  { key: "income", title: "Income", desc: "Prioritizes cash flow and steadier income ETFs.", range: "4% - 9% yield" },
  { key: "growth", title: "Growth", desc: "Focuses on compounding and lower current yield.", range: "1% - 4% yield" },
  { key: "hyper", title: "Hyper Income", desc: "Targets aggressive income with higher volatility.", range: "9% - 20%+ yield" },
];

const RISK_OPTIONS: Array<{ key: RiskTolerance; title: string; desc: string }> = [
  { key: "low", title: "Low", desc: "Lower volatility and more conservative income sources." },
  { key: "medium", title: "Medium", desc: "Balances income with some growth and moderate risk." },
  { key: "high", title: "High", desc: "Accepts higher volatility for higher yield potential." },
];

export default function OnboardPage() {
  const router = useRouter();
  const goal = useDFPStore((s) => s.goal);
  const onboarding = useDFPStore((s) => s.onboarding);
  const setGoal = useDFPStore((s) => s.setGoal);
  const addHolding = useDFPStore((s) => s.addHolding);
  const resetPortfolio = useDFPStore((s) => s.resetPortfolio);
  const setAllocs = useDFPStore((s) => s.setAllocs);
  const holdingsCount = useDFPStore((s) => s.holdings.length);
  const setOnboardingStep = useDFPStore((s) => s.setOnboardingStep);
  const completeOnboarding = useDFPStore((s) => s.completeOnboarding);
  const resetOnboarding = useDFPStore((s) => s.resetOnboarding);

  const [selectedTemplate, setSelectedTemplate] = useState<RecommendationTemplate | null>(null);
  const [reviewAllocs, setReviewAllocs] = useState<Array<{ ticker: string; weight: number }>>([]);
  const [allocationWarnings, setAllocationWarnings] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  useEffect(() => {
    if (isOnboardingComplete(onboarding)) {
      router.replace("/dashboard/overview");
    }
  }, [onboarding, router]);

  useEffect(() => {
    if (onboarding.currentStep === "apply" && !selectedTemplate) {
      setOnboardingStep("recommendations");
    }
  }, [onboarding.currentStep, selectedTemplate, setOnboardingStep]);

  const recommendationResult = useMemo<RecommendationResult>(
    () =>
      buildRecommendations({
        strategy: goal.strategy,
        risk: goal.riskTolerance,
        targetMonthly: goal.targetPeriod === "yearly" ? goal.targetIncome * 12 : goal.targetIncome,
        capital: goal.capital,
        hasSetCapital: Boolean(goal.hasSetCapital),
        targetPeriod: goal.targetPeriod,
        preferredTypes: goal.preferredTypes,
        baseTemplates: PORTFOLIO_TEMPLATES,
      }),
    [
      goal.strategy,
      goal.riskTolerance,
      goal.targetIncome,
      goal.capital,
      goal.hasSetCapital,
      goal.targetPeriod,
      goal.preferredTypes,
    ],
  );

  const comparisonRows = useMemo(
    () => compareTemplates(recommendationResult.templates, goal.capital, goal.preferredTypes),
    [recommendationResult.templates, goal.capital, goal.preferredTypes],
  );

  const reviewUniverse = useMemo(
    () =>
      buildReviewUniverse({
        strategy: goal.strategy,
        risk: goal.riskTolerance,
        targetMonthly: goal.targetPeriod === "yearly" ? goal.targetIncome * 12 : goal.targetIncome,
        capital: goal.capital,
        targetPeriod: goal.targetPeriod,
        preferredTypes: goal.preferredTypes,
      }),
    [
      goal.strategy,
      goal.riskTolerance,
      goal.targetIncome,
      goal.capital,
      goal.targetPeriod,
      goal.preferredTypes,
    ],
  );

  const highestYield = comparisonRows.reduce((max, row) => Math.max(max, row.liveYield), 0);
  const riskRank: Record<"low" | "medium" | "high", number> = { low: 1, medium: 2, high: 3 };
  const lowestRisk = comparisonRows.reduce(
    (best, row) => (riskRank[row.riskCategory] < riskRank[best] ? row.riskCategory : best),
    "high" as "low" | "medium" | "high",
  );

  function goToStep(step: OnboardingStep): void {
    setOnboardingStep(step);
  }

  function chooseTemplate(template: RecommendationTemplate): void {
    setSelectedTemplate(template);
    setReviewAllocs(template.holdings.map((holding) => ({ ticker: holding.ticker, weight: holding.weight * 100 })));
    goToStep("apply");
  }

  function applyAllocations(): void {
    if (!selectedTemplate) return;
    if (holdingsCount > 0) {
      const ok = window.confirm(
        "Starting from scratch will erase current portfolio holdings and allocation. Continue?",
      );
      if (!ok) return;
    }

    const { normalized, dropped } = normalizeAllocations(reviewAllocs);
    const warnings = dropped.map((item) =>
      item.reason === "not_in_db"
        ? `${item.ticker}: not found in the ETF database`
        : `${item.ticker}: removed because weight is zero`,
    );

    if (!normalized.length) {
      setAllocationWarnings(warnings.length ? warnings : ["No valid allocations to apply."]);
      return;
    }

    const { seeds, skipped } = buildHoldingSeeds(normalized, goal.capital);
    warnings.push(...skipped.map((item) => `${item.ticker}: ${item.reason}`));
    setAllocationWarnings(warnings);
    if (!seeds.length) return;

    resetPortfolio();
    seeds.forEach((seed) => addHolding(seed));
    setAllocs(normalized.map((holding) => ({ ticker: holding.ticker, w: holding.weight * 100 })));
    completeOnboarding();
    router.push("/dashboard/overview");
  }

  const progressIndex = Math.max(0, STEP_ORDER.indexOf(onboarding.currentStep));

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-textBright">Onboarding</h1>
          <p className="text-sm text-textDim">Build your profile, compare portfolios, and apply a plan.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetOnboarding();
            setSelectedTemplate(null);
            setReviewAllocs([]);
            router.refresh();
          }}
          className="text-sm text-textDim underline"
        >
          Start Over
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-bg-2 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-textBright">Setup Progress</div>
          <div className="text-xs text-textDim">
            Step {progressIndex + 1} of {STEP_ORDER.length}
          </div>
        </div>
        <div className="grid gap-2 md:grid-cols-7">
          {STEP_ORDER.map((step, index) => {
            const active = step === onboarding.currentStep;
            const completed = index < progressIndex;
            return (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                    active
                      ? "bg-gold text-bg"
                      : completed
                        ? "bg-teal text-bg"
                        : "border border-border text-textDim"
                  }`}
                >
                  {index + 1}
                </div>
                <span className={`text-xs ${active ? "text-textBright" : "text-textDim"}`}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {recommendationResult.message && onboarding.currentStep === "recommendations" ? (
        <div className="rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-gold-light">
          {recommendationResult.message}
        </div>
      ) : null}

      {allocationWarnings.length > 0 ? (
        <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {allocationWarnings.map((warning) => (
            <div key={warning}>{warning}</div>
          ))}
        </div>
      ) : null}

      {onboarding.currentStep === "strategy" ? (
        <section className="space-y-4 rounded-2xl border border-border bg-bg-2 p-6">
          <h2 className="text-xl font-semibold text-textBright">Choose Your Strategy</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {STRATEGY_OPTIONS.map((option) => (
              <button
                key={option.key}
                data-testid={`strategy-${option.key === "hyper" ? "hyper" : option.key}`}
                type="button"
                onClick={() => {
                  setGoal({ strategy: option.key });
                  goToStep("risk");
                }}
                className={`rounded-2xl border p-5 text-left ${
                  goal.strategy === option.key ? "border-gold bg-gold/10" : "border-border bg-bg-1"
                }`}
              >
                <div className="text-lg font-semibold text-textBright">{option.title}</div>
                <div className="mt-2 text-sm text-textDim">{option.desc}</div>
                <div className="mt-3 text-xs text-teal-light">{option.range}</div>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {onboarding.currentStep === "risk" ? (
        <section className="space-y-4 rounded-2xl border border-border bg-bg-2 p-6">
          <h2 className="text-xl font-semibold text-textBright">Pick Your Risk Tolerance</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {RISK_OPTIONS.map((option) => (
              <button
                key={option.key}
                data-testid={`risk-${option.key}`}
                type="button"
                onClick={() => {
                  setGoal({ riskTolerance: option.key });
                  goToStep("target");
                }}
                className={`rounded-2xl border p-5 text-left ${
                  goal.riskTolerance === option.key ? "border-gold bg-gold/10" : "border-border bg-bg-1"
                }`}
              >
                <div className="text-lg font-semibold text-textBright">{option.title}</div>
                <div className="mt-2 text-sm text-textDim">{option.desc}</div>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {onboarding.currentStep === "target" ? (
        <section className="space-y-4 rounded-2xl border border-border bg-bg-2 p-6">
          <h2 className="text-xl font-semibold text-textBright">Set Your Income Target</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-textDim">
              Target period
              <div className="mt-2 flex gap-2">
                {(["monthly", "yearly"] as TargetPeriod[]).map((period) => (
                  <button
                    key={period}
                    data-testid={`target-period-${period}`}
                    type="button"
                    onClick={() => setGoal({ targetPeriod: period })}
                    className={`rounded-lg px-4 py-2 text-sm ${
                      goal.targetPeriod === period ? "bg-gold text-bg" : "border border-border text-textDim"
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </label>
            <label className="text-sm text-textDim">
              Target income
              <input
                data-testid="target-income"
                type="number"
                min={0}
                value={goal.targetPeriod === "yearly" ? goal.targetIncome * 12 : goal.targetIncome}
                onChange={(e) =>
                  setGoal({
                    targetIncome:
                      goal.targetPeriod === "yearly"
                        ? Math.max(0, Number(e.target.value) || 0) / 12
                        : Math.max(0, Number(e.target.value) || 0),
                  })
                }
                className="mt-2 w-full rounded-lg border border-border bg-bg-1 px-3 py-2 text-textBright"
              />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-center gap-2 text-sm text-textDim">
              <input
                data-testid="tax-toggle"
                type="checkbox"
                checked={goal.taxEnabled}
                onChange={(e) => setGoal({ taxEnabled: e.target.checked })}
                className="h-4 w-4"
              />
              Apply dividend tax impact
            </label>
            <label className="text-sm text-textDim">
              Tax rate (%)
              <input
                data-testid="tax-rate"
                type="number"
                min={0}
                max={100}
                value={goal.taxRate}
                onChange={(e) => setGoal({ taxRate: Number(e.target.value) || 0 })}
                className="mt-2 w-full rounded-lg border border-border bg-bg-1 px-3 py-2 text-textBright"
              />
            </label>
          </div>
          <button
            data-testid="continue-target"
            type="button"
            onClick={() => goToStep("capital")}
            className="rounded-lg bg-gold px-4 py-2 font-semibold text-bg"
          >
            Continue
          </button>
        </section>
      ) : null}

      {onboarding.currentStep === "capital" ? (
        <section className="space-y-4 rounded-2xl border border-border bg-bg-2 p-6">
          <h2 className="text-xl font-semibold text-textBright">Set Your Starting Capital</h2>
          <label className="block text-sm text-textDim">
            Starting capital
            <div className="mt-2 flex items-center rounded-lg border border-border bg-bg-1 px-3">
              <span className="text-textDim">$</span>
              <input
                data-testid="capital-input"
                type="number"
                min={0}
                value={goal.hasSetCapital ? goal.capital : ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === "") {
                    setGoal({ capital: 0, hasSetCapital: false });
                    return;
                  }
                  setGoal({ capital: Number(raw) || 0, hasSetCapital: true });
                }}
                className="w-full bg-transparent px-2 py-2 text-textBright outline-none"
              />
            </div>
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <button
              data-testid="continue-capital"
              type="button"
              onClick={() => goToStep("types")}
              className="rounded-lg bg-gold px-4 py-2 font-semibold text-bg"
            >
              Continue
            </button>
            <button
              data-testid="capital-later"
              type="button"
              onClick={() => {
                setGoal({ capital: 0, hasSetCapital: false });
                goToStep("types");
              }}
              className="text-sm text-textDim underline"
            >
              I&apos;ll add capital later
            </button>
          </div>
        </section>
      ) : null}

      {onboarding.currentStep === "types" ? (
        <section className="space-y-4 rounded-2xl border border-border bg-bg-2 p-6">
          <h2 className="text-xl font-semibold text-textBright">Choose a Portfolio Archetype</h2>
          <div className="max-h-[32rem] overflow-y-auto pr-1">
            <div className="grid gap-4 md:grid-cols-2">
              {PORTFOLIO_ARCHETYPES.map((arch) => {
                const active = goal.selectedArchetype === arch.key;
                const riskTone =
                  arch.riskLevel === "low"
                    ? "bg-emerald-500/15 text-emerald-300"
                    : arch.riskLevel === "medium"
                      ? "bg-amber-500/15 text-amber-300"
                      : arch.riskLevel === "high"
                        ? "bg-orange-500/15 text-orange-300"
                        : "bg-danger/15 text-danger";
                return (
                  <button
                    key={arch.key}
                    data-testid={`archetype-${arch.key}`}
                    type="button"
                    onClick={() => {
                      setGoal({
                        selectedArchetype: arch.key,
                        preferredTypes: arch.preferredTypes,
                        strategy: arch.strategy,
                      });
                      goToStep("recommendations");
                    }}
                    className={`relative rounded-2xl border-2 p-5 text-left transition ${
                      active
                        ? "border-sky-500 bg-sky-500/10 shadow-md"
                        : "border-border bg-bg-1 hover:border-slate-400"
                    }`}
                  >
                    <span className={`absolute right-3 top-3 rounded-full px-2 py-1 text-[11px] font-semibold ${riskTone}`}>
                      {arch.riskLevel === "very-high"
                        ? "Very High Risk"
                        : `${arch.riskLevel.charAt(0).toUpperCase()}${arch.riskLevel.slice(1)} Risk`}
                    </span>
                    <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white ${arch.color}`}>
                      {arch.icon.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="pr-24">
                      <div className="text-base font-semibold text-textBright">{arch.name}</div>
                      <div className="text-sm text-textDim">{arch.tagline}</div>
                    </div>
                    <p className="mt-3 text-xs leading-5 text-textDim">{arch.description}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-textDim">
                      <span>
                        Yield: {(arch.expectedYieldRange[0] * 100).toFixed(0)}-
                        {(arch.expectedYieldRange[1] * 100).toFixed(0)}%
                      </span>
                      <span>
                        CAGR: {(arch.expectedCagrRange[0] * 100).toFixed(0)}-
                        {(arch.expectedCagrRange[1] * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-medium text-sky-300">Best for: {arch.bestFor}</p>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              data-testid="continue-types"
              type="button"
              onClick={() => {
                setGoal({ preferredTypes: [], selectedArchetype: null });
                goToStep("recommendations");
              }}
              className="rounded-lg border border-border px-4 py-2 text-textDim"
            >
              Skip Archetypes
            </button>
          </div>
        </section>
      ) : null}

      {onboarding.currentStep === "recommendations" ? (
        <section className="space-y-4 rounded-2xl border border-border bg-bg-2 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-textBright">Recommended Portfolios</h2>
            <button
              type="button"
              onClick={() => setCompareOpen((open) => !open)}
              className="rounded-lg border border-border px-3 py-2 text-sm text-textBright"
            >
              Compare Side by Side
            </button>
          </div>

          {recommendationResult.noCapitalSet ? (
            <div className="rounded-xl border border-border bg-bg-1 px-4 py-3 text-sm text-textDim">
              Set your starting capital to receive personalized portfolio recommendations.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {recommendationResult.templates.map((template, index) => (
                <div key={template.id} className="rounded-2xl border border-border bg-bg-1 p-4">
                  <div className="text-lg font-semibold text-textBright">{template.name}</div>
                  <div className="mt-1 text-sm text-textDim">{template.description}</div>
                  <div className="mt-3 text-sm text-textDim">
                    Yield {(template.targetYield * 100).toFixed(1)}% • CAGR {(template.targetCagr * 100).toFixed(1)}%
                  </div>
                  {template.capitalWarning ? (
                    <div className="mt-2 rounded-lg bg-gold/10 px-3 py-2 text-xs text-gold-light">
                      Capital may be too low to buy this mix cleanly.
                    </div>
                  ) : null}
                  <div className="mt-4 flex gap-2">
                    <button
                      data-testid={`apply-template-${index}`}
                      type="button"
                      onClick={() => chooseTemplate(template)}
                      className="rounded-lg bg-gold px-3 py-2 text-sm font-semibold text-bg"
                    >
                      Apply
                    </button>
                    <button
                      type="button"
                      onClick={() => chooseTemplate(template)}
                      className="rounded-lg border border-border px-3 py-2 text-sm text-textDim"
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {compareOpen && comparisonRows.length >= 2 ? (
            <div className="overflow-x-auto rounded-2xl border border-border bg-bg-1 p-4">
              <table className="w-full min-w-[840px] text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 text-left text-textDim">Metric</th>
                    {comparisonRows.map((row, index) => (
                      <th key={row.templateId} className="px-3 py-2 text-left">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-textBright">{row.name}</span>
                          <button
                            type="button"
                            onClick={() => chooseTemplate(recommendationResult.templates[index])}
                            className="rounded-lg bg-gold px-2 py-1 text-xs font-semibold text-bg"
                          >
                            Apply
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/60">
                    <td className="px-3 py-2 text-textDim">Est. Yield</td>
                    {comparisonRows.map((row) => (
                      <td
                        key={`${row.templateId}-yield`}
                        className={`px-3 py-2 ${
                          row.liveYield === highestYield ? "rounded-lg bg-teal/10 text-teal-light" : "text-textBright"
                        }`}
                      >
                        {(row.liveYield * 100).toFixed(1)}%
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="px-3 py-2 text-textDim">Est. CAGR</td>
                    {comparisonRows.map((row) => (
                      <td key={`${row.templateId}-cagr`} className="px-3 py-2 text-textBright">
                        {(row.liveCagr * 100).toFixed(1)}%
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="px-3 py-2 text-textDim">Risk Level</td>
                    {comparisonRows.map((row) => (
                      <td
                        key={`${row.templateId}-risk`}
                        className={`px-3 py-2 ${
                          row.riskCategory === lowestRisk ? "rounded-lg bg-sky-500/10 text-sky-300" : "text-textBright"
                        }`}
                      >
                        {row.riskCategory}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="px-3 py-2 text-textDim">Monthly Income</td>
                    {comparisonRows.map((row) => (
                      <td key={`${row.templateId}-income`} className="px-3 py-2 text-textBright">
                        ${row.estimatedMonthlyIncome.toLocaleString()}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="px-3 py-2 text-textDim">Min Capital Needed</td>
                    {comparisonRows.map((row) => (
                      <td key={`${row.templateId}-capital`} className="px-3 py-2 text-textBright">
                        ${Math.round(row.capitalNeeded).toLocaleString()}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="px-3 py-2 text-textDim">Types Covered</td>
                    {comparisonRows.map((row) => (
                      <td key={`${row.templateId}-types`} className="px-3 py-2 text-textBright">
                        {row.typesCovered.length > 0 ? row.typesCovered.join(", ") : "—"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-textDim">Capital Warning</td>
                    {comparisonRows.map((row) => (
                      <td
                        key={`${row.templateId}-warning`}
                        className={`px-3 py-2 ${
                          row.capitalWarning ? "rounded-lg bg-gold/10 text-gold-light" : "text-textBright"
                        }`}
                      >
                        {row.capitalWarning ? "⚠ Insufficient" : "—"}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      ) : null}

      {onboarding.currentStep === "apply" ? (
        <section className="space-y-4 rounded-2xl border border-border bg-bg-2 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-textBright">Apply Portfolio</h2>
            <button
              type="button"
              onClick={() => goToStep("recommendations")}
              className="rounded-lg border border-border px-3 py-2 text-sm text-textDim"
            >
              Back
            </button>
          </div>
          {selectedTemplate ? (
            <>
              <div className="text-sm text-textDim">
                Review and customize the ETF list before applying it to your portfolio.
              </div>
              <div className="space-y-3">
                {reviewAllocs.map((row, index) => {
                  const db = ETF_DB[row.ticker];
                  return (
                    <div key={`${row.ticker}-${index}`} className="grid gap-3 rounded-xl border border-border bg-bg-1 p-3 md:grid-cols-[160px_1fr_100px_auto] md:items-center">
                      <select
                        value={row.ticker}
                        onChange={(e) => {
                          const next = [...reviewAllocs];
                          next[index] = { ...next[index], ticker: e.target.value };
                          setReviewAllocs(next);
                        }}
                        className="rounded-lg border border-border bg-bg-2 px-3 py-2 text-sm text-textBright"
                      >
                        {reviewUniverse.map((ticker) => (
                          <option key={ticker} value={ticker}>
                            {ticker}
                          </option>
                        ))}
                      </select>
                      <div className="text-sm text-textDim">{db?.name ?? "ETF"}</div>
                      <input
                        type="number"
                        min={0}
                        step="0.1"
                        value={row.weight}
                        onChange={(e) => {
                          const next = [...reviewAllocs];
                          next[index] = { ...next[index], weight: Math.max(0, Number(e.target.value) || 0) };
                          setReviewAllocs(next);
                        }}
                        className="rounded-lg border border-border bg-bg-2 px-3 py-2 text-right text-sm text-textBright"
                      />
                      <button
                        type="button"
                        onClick={() => setReviewAllocs(reviewAllocs.filter((_, itemIndex) => itemIndex !== index))}
                        className="rounded-lg border border-danger/40 px-3 py-2 text-sm text-danger"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setReviewAllocs([
                      ...reviewAllocs,
                      { ticker: reviewUniverse[0] ?? "SCHD", weight: 5 },
                    ])
                  }
                  className="rounded-lg border border-border px-3 py-2 text-sm text-textDim"
                >
                  Add ETF
                </button>
                <button
                  data-testid="apply-portfolio-final"
                  type="button"
                  onClick={applyAllocations}
                  className="rounded-lg bg-gold px-4 py-2 font-semibold text-bg"
                >
                  Apply Portfolio
                </button>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-border bg-bg-1 px-4 py-3 text-sm text-textDim">
              Select a recommendation first.
            </div>
          )}
        </section>
      ) : null}
    </main>
  );
}
