"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import LivePreviewPane from "@/components/onboard/LivePreviewPane";
import WizardProgress from "@/components/onboard/WizardProgress";
import WizardStep1, { type Step1State } from "@/components/onboard/WizardStep1";
import WizardStep2, {
  PROFILE_DEFS,
  defaultProfileForFocus,
  type FreedomFocus,
  type PortfolioProfileKey,
} from "@/components/onboard/WizardStep2";
import WizardStep3, {
  type PortfolioInputMode,
  type PresetPortfolioKey,
} from "@/components/onboard/WizardStep3";
import { ETF_DB } from "@/lib/etf-db";
import { computeRequiredMonthlyIncomeFromExpenses } from "@/lib/expense-coverage";
import { useDFPStore } from "@/lib/store";

function profileToStoreStrategy(profile: PortfolioProfileKey): "income" | "growth" | "hyper" {
  if (profile.startsWith("growth-leveraged")) return "hyper";
  if (profile.startsWith("growth-")) return "growth";
  if (profile === "income-highyield") return "hyper";
  return "income";
}

const PRESET_PORTFOLIOS: Record<PresetPortfolioKey, string[]> = {
  "income-core": ["SCHD", "DGRO", "VYM"],
  "balanced-growth": ["VTI", "VOO", "SCHD"],
  "high-yield": ["JEPI", "JEPQ", "QYLD"],
  "covered-call": ["JEPI", "JEPQ", "XYLD"],
};

type ParsedHolding = { ticker: string; shares: number; avgCost: number };
type ManualHoldingValidation = {
  rows: ParsedHolding[];
  errors: string[];
  warnings: string[];
};

function validateManualHoldings(input: string): ManualHoldingValidation {
  const out: ManualHoldingValidation = { rows: [], errors: [], warnings: [] };
  const nonEmptyLines = input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const lines = nonEmptyLines.slice(0, 20);

  if (nonEmptyLines.length > 20) {
    out.warnings.push("Only the first 20 lines are used.");
  }
  if (lines.length === 0) {
    out.errors.push("Add at least one holding line.");
    return out;
  }

  for (let index = 0; index < lines.length; index += 1) {
    const lineNumber = index + 1;
    const cells = lines[index].split(",").map((cell) => cell.trim());

    if (cells.length < 2 || cells.length > 3) {
      out.errors.push(`Line ${lineNumber}: use TICKER,SHARES[,AVG_COST].`);
      continue;
    }

    const ticker = (cells[0] ?? "").toUpperCase();
    if (!/^[A-Z]{1,6}$/.test(ticker)) {
      out.errors.push(`Line ${lineNumber}: ticker "${cells[0] ?? ""}" is invalid.`);
      continue;
    }

    const shares = Number(cells[1]);
    if (!Number.isFinite(shares) || shares <= 0) {
      out.errors.push(`Line ${lineNumber}: shares must be a positive number.`);
      continue;
    }

    const rawAvgCost = cells[2];
    const fallbackPrice = ETF_DB[ticker]?.price ?? 100;
    const avgCost = rawAvgCost && rawAvgCost.length > 0 ? Number(rawAvgCost) : fallbackPrice;
    if (!Number.isFinite(avgCost) || avgCost <= 0) {
      out.errors.push(`Line ${lineNumber}: avg cost must be a positive number.`);
      continue;
    }

    if (!ETF_DB[ticker]) {
      out.warnings.push(`Line ${lineNumber}: ${ticker} not in local ETF DB, using fallback assumptions.`);
    }

    out.rows.push({ ticker, shares, avgCost });
  }

  return out;
}

export default function OnboardPage() {
  const router = useRouter();
  const setGoal = useDFPStore((s) => s.setGoal);
  const setOnboardingStep = useDFPStore((s) => s.setOnboardingStep);
  const completeOnboarding = useDFPStore((s) => s.completeOnboarding);
  const resetPortfolio = useDFPStore((s) => s.resetPortfolio);
  const addHolding = useDFPStore((s) => s.addHolding);
  const addExpenseGoal = useDFPStore((s) => s.addExpenseGoal);
  const expenseGoals = useDFPStore((s) => s.expenseGoals);

  const [step, setStep] = useState(1);
  const [step1, setStep1] = useState<Step1State>({
    goalMode: "expenses",
    targetIncome: 3000,
    targetExpense: 3000,
    coveragePct: 100,
    capital: 50000,
    monthlyContribution: 1000,
  });
  const [focus, setFocus] = useState<FreedomFocus>("income");
  const [profile, setProfile] = useState<PortfolioProfileKey>(defaultProfileForFocus("income"));
  const [portfolioMode, setPortfolioMode] = useState<PortfolioInputMode>("preset");
  const [presetPortfolio, setPresetPortfolio] = useState<PresetPortfolioKey>("income-core");
  const [manualHoldings, setManualHoldings] = useState("");

  const effectiveTargetMonthly = useMemo(() => {
    if (step1.goalMode !== "expenses") return step1.targetIncome;
    return computeRequiredMonthlyIncomeFromExpenses({
      goals: [
        {
          id: "onboarding-expense",
          name: "Monthly expenses",
          amountMonthly: step1.targetExpense,
          enabledForGoal: true,
          createdAt: 0,
        },
      ],
      coveragePct: step1.coveragePct,
      taxEnabled: false,
      taxRate: 0,
    });
  }, [step1.coveragePct, step1.goalMode, step1.targetExpense, step1.targetIncome]);
  const manualValidation = useMemo(() => validateManualHoldings(manualHoldings), [manualHoldings]);
  const manualHasBlockingErrors = portfolioMode === "manual" && manualValidation.errors.length > 0;

  function seedPortfolio(): void {
    resetPortfolio();

    if (portfolioMode === "manual") {
      if (manualValidation.rows.length > 0) {
        for (const row of manualValidation.rows) {
          addHolding({ ticker: row.ticker, shares: row.shares, avgCost: row.avgCost, cagrOvr: null });
        }
        return;
      }
    }

    const profileTickers = PROFILE_DEFS.find((item) => item.key === profile)?.etfs ?? [];
    const presetTickers = PRESET_PORTFOLIOS[presetPortfolio] ?? [];
    const tickers = profileTickers.length > 0 ? profileTickers : presetTickers.length > 0 ? presetTickers : [];
    if (tickers.length === 0) return;
    const budgetPerHolding = step1.capital > 0 ? step1.capital / tickers.length : 0;

    for (const ticker of tickers) {
      const price = ETF_DB[ticker]?.price ?? 100;
      const shares = Math.max(1, Math.floor(budgetPerHolding / Math.max(price, 1)));
      addHolding({ ticker, shares, avgCost: price, cagrOvr: null });
    }
  }

  function handleFinish(): void {
    if (manualHasBlockingErrors) return;

    if (step1.goalMode === "expenses" && step1.targetExpense > 0) {
      const exists = expenseGoals.some((goal) => goal.name === "Core monthly expenses");
      if (!exists) addExpenseGoal("Core monthly expenses", step1.targetExpense);
    }

    setGoal({
      targetIncome: step1.goalMode === "expenses" ? step1.targetExpense : step1.targetIncome,
      goalMode: step1.goalMode === "expenses" ? "expenses" : "manual",
      coveragePct: step1.coveragePct,
      capital: step1.capital,
      hasSetCapital: step1.capital > 0,
      monthly: step1.monthlyContribution,
      strategy: profileToStoreStrategy(profile),
    });
    seedPortfolio();
    setOnboardingStep("complete");
    completeOnboarding();
    router.push("/dashboard/overview");
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="mb-2 text-3xl font-semibold text-textBright">Onboarding Wizard</h1>
      <p className="mb-6 text-sm text-textDim">Three steps to calculate your Freedom Date.</p>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <WizardProgress step={step} />

          {step === 1 ? <WizardStep1 value={step1} onChange={setStep1} /> : null}
          {step === 2 ? (
            <WizardStep2
              focus={focus}
              profile={profile}
              onFocusChange={(nextFocus) => {
                setFocus(nextFocus);
                setProfile(defaultProfileForFocus(nextFocus));
              }}
              onProfileChange={setProfile}
            />
          ) : null}
          {step === 3 ? (
            <WizardStep3
              mode={portfolioMode}
              preset={presetPortfolio}
              manualHoldings={manualHoldings}
              manualValidCount={manualValidation.rows.length}
              manualErrors={manualValidation.errors}
              manualWarnings={manualValidation.warnings}
              onModeChange={setPortfolioMode}
              onPresetChange={setPresetPortfolio}
              onManualHoldingsChange={setManualHoldings}
            />
          ) : null}

          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              data-testid="onboard-back"
              className="rounded-lg border border-border px-4 py-2 text-sm text-textDim disabled:opacity-50"
              disabled={step === 1}
              onClick={() => setStep((prev) => Math.max(1, prev - 1))}
            >
              Back
            </button>

            {step < 3 ? (
              <button
                type="button"
                data-testid="onboard-next"
                className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-bg"
                onClick={() => setStep((prev) => Math.min(3, prev + 1))}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                data-testid="onboard-finish"
                className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-bg disabled:opacity-50"
                onClick={handleFinish}
                disabled={manualHasBlockingErrors}
              >
                Finish
              </button>
            )}
          </div>
        </section>

        <LivePreviewPane
          capital={step1.capital}
          targetMonthly={effectiveTargetMonthly}
          monthlyContribution={step1.monthlyContribution}
          profile={profile}
        />
      </div>
    </main>
  );
}
