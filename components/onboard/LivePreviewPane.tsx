"use client";

import { findFreedomYear, project } from "@/lib/engine";
import type { PortfolioProfileKey } from "@/components/onboard/WizardStep2";

const PROFILE_ASSUMPTIONS: Record<PortfolioProfileKey, { cagr: number; yld: number }> = {
  "growth-regular": { cagr: 0.11, yld: 0.012 },
  "growth-mix": { cagr: 0.14, yld: 0.018 },
  "growth-leveraged": { cagr: 0.17, yld: 0.01 },
  "income-conservative": { cagr: 0.085, yld: 0.038 },
  "income-blend": { cagr: 0.08, yld: 0.065 },
  "income-highyield": { cagr: 0.065, yld: 0.1 },
};

export default function LivePreviewPane({
  capital,
  targetMonthly,
  monthlyContribution,
  profile,
}: {
  capital: number;
  targetMonthly: number;
  monthlyContribution: number;
  profile: PortfolioProfileKey;
}) {
  const assumption = PROFILE_ASSUMPTIONS[profile];
  const currentYear = new Date().getFullYear();
  const rows = project({
    capital,
    monthly: monthlyContribution,
    cagr: assumption.cagr,
    yld: assumption.yld,
    drip: true,
    years: 30,
  });

  const latest = rows.at(-1);
  const projectedMonthly = latest?.monthly ?? 0;
  const freedomYear = findFreedomYear(rows, targetMonthly);
  const freedomScore = targetMonthly > 0 ? Math.min(100, Math.round((projectedMonthly / targetMonthly) * 100)) : 0;
  const yearsRemaining = freedomYear !== null ? Math.max(0, freedomYear - currentYear) : null;

  return (
    <aside className="rounded-2xl border border-border bg-bg-2 p-4" data-testid="onboard-live-preview">
      <h3 className="text-lg font-semibold text-textBright">Live Preview</h3>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-textDim">Projected monthly income</dt>
          <dd className="font-semibold text-textBright">${Math.round(projectedMonthly).toLocaleString()}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-textDim">Freedom Score</dt>
          <dd className="font-semibold text-textBright">{freedomScore}%</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-textDim">Freedom Date</dt>
          <dd className="font-semibold text-textBright">
            {freedomYear !== null ? `Year ${freedomYear}` : "Not reachable within 30 years."}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-textDim">Years remaining</dt>
          <dd className="font-semibold text-textBright">{yearsRemaining ?? "N/A"}</dd>
        </div>
      </dl>
    </aside>
  );
}
