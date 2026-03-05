"use client";

import { useMemo, useState } from "react";
import ProjectionChart from "@/components/charts/ProjectionChart";
import DRIPSimulatorPanel from "@/components/projections/DRIPSimulatorPanel";
import FeatureGate from "@/components/ui/FeatureGate";
import ProgressBar from "@/components/ui/ProgressBar";
import { findFreedomYear, project } from "@/lib/engine";
import { useDFPStore } from "@/lib/store";
import { useDerivedMetrics } from "@/lib/use-derived-metrics";

export default function DashboardProjectionsPage() {
  const metrics = useDerivedMetrics();
  const baseMonthly = useDFPStore((s) => s.goal.monthly);
  const baseDrip = useDFPStore((s) => s.goal.drip);
  const crash = useDFPStore((s) => s.crash);
  const pause = useDFPStore((s) => s.pause);

  const [yearsPreset, setYearsPreset] = useState<10 | 20 | 30>(30);
  const [contributionFactor, setContributionFactor] = useState(1);
  const [dripEnabled, setDripEnabled] = useState(baseDrip);
  const effectiveMonthly = Math.max(0, Math.round(baseMonthly * contributionFactor));

  const projectionRows = useMemo(() => {
    return project({
      capital: metrics.totalVal,
      monthly: effectiveMonthly,
      cagr: metrics.bCagr,
      yld: metrics.bYield,
      drip: dripEnabled,
      years: yearsPreset,
      crash,
      pause,
    });
  }, [metrics.totalVal, effectiveMonthly, metrics.bCagr, metrics.bYield, dripEnabled, yearsPreset, crash, pause]);

  const freedomYear = useMemo(
    () => findFreedomYear(projectionRows, metrics.targetMonthly),
    [projectionRows, metrics.targetMonthly],
  );

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-bg-2 p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <div className="mb-2 text-sm font-semibold text-textBright">Projection horizon</div>
            <div className="flex gap-2">
              {[10, 20, 30].map((years) => (
                <button
                  key={years}
                  type="button"
                  onClick={() => setYearsPreset(years as 10 | 20 | 30)}
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    yearsPreset === years ? "border-gold bg-gold-dim text-gold-light" : "border-border text-textDim"
                  }`}
                >
                  {years} years
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold text-textBright">DRIP factor</div>
            <button
              type="button"
              onClick={() => setDripEnabled((v) => !v)}
              className={`rounded-lg border px-3 py-2 text-sm ${
                dripEnabled ? "border-teal/60 bg-teal/10 text-teal-light" : "border-border text-textDim"
              }`}
            >
              {dripEnabled ? "DRIP On" : "DRIP Off"}
            </button>
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold text-textBright">Contribution factor</div>
            <div className="flex items-center gap-2">
              {[0.5, 1, 1.5, 2].map((factor) => (
                <button
                  key={factor}
                  type="button"
                  onClick={() => setContributionFactor(factor)}
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    contributionFactor === factor
                      ? "border-gold bg-gold-dim text-gold-light"
                      : "border-border text-textDim"
                  }`}
                >
                  {factor}x
                </button>
              ))}
            </div>
            <div className="mt-2 text-xs text-textDim">
              Monthly contribution: ${effectiveMonthly.toLocaleString()}
            </div>
          </div>
        </div>
      </section>

      <ProjectionChart projData={projectionRows} target={metrics.targetMonthly} color="#f0c842" />
      <div className="overflow-x-auto rounded-2xl border border-border bg-bg-2">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-bg-3 text-left text-xs uppercase text-textDim">
            <tr>
              <th className="px-3 py-2">Year</th>
              <th className="px-3 py-2">Monthly Income</th>
              <th className="px-3 py-2">Portfolio Value</th>
              <th className="px-3 py-2">vs Target</th>
            </tr>
          </thead>
          <tbody>
            {projectionRows.map((r) => {
              const isFreedom = freedomYear === r.year;
              const pct =
                metrics.targetMonthly > 0
                  ? Math.min(100, Math.round((r.monthly / metrics.targetMonthly) * 100))
                  : 0;
              return (
                <tr key={r.year} className={`border-t border-border ${isFreedom ? "bg-gold-dim" : ""}`}>
                  <td className="px-3 py-2">{r.year}</td>
                  <td className="px-3 py-2">${r.monthly.toLocaleString()}</td>
                  <td className="px-3 py-2">${r.portfolio.toLocaleString()}</td>
                  <td className="px-3 py-2">
                    <ProgressBar value={pct} color={isFreedom ? "gold" : "teal"} height={6} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <FeatureGate feature="drip_simulator" title="DRIP Simulator">
        <DRIPSimulatorPanel
          capital={metrics.totalVal}
          monthly={effectiveMonthly}
          cagr={metrics.bCagr}
          yld={metrics.bYield}
          years={yearsPreset}
          target={metrics.targetMonthly}
        />
      </FeatureGate>
    </div>
  );
}
