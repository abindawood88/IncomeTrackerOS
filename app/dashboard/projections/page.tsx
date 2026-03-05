"use client";

import { useMemo, useState } from "react";
import ProjectionChart from "@/components/charts/ProjectionChart";
import DRIPSimulatorPanel from "@/components/projections/DRIPSimulatorPanel";
import FeatureGate from "@/components/ui/FeatureGate";
import ProgressBar from "@/components/ui/ProgressBar";
import { useDerivedMetrics } from "@/lib/use-derived-metrics";

export default function DashboardProjectionsPage() {
  const [expanded, setExpanded] = useState(false);
  const metrics = useDerivedMetrics();

  const rows = useMemo(() => (expanded ? metrics.projData : metrics.projData.slice(0, 10)), [expanded, metrics.projData]);

  return (
    <div className="space-y-4">
      <ProjectionChart projData={metrics.projData} target={metrics.targetMonthly} color="#f0c842" />
      <FeatureGate feature="drip_simulator" title="DRIP simulator">
        <DRIPSimulatorPanel
          capital={metrics.totalVal}
          monthly={0}
          cagr={metrics.bCagr}
          yld={metrics.bYield}
          years={30}
        />
      </FeatureGate>
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
            {rows.map((r) => {
              const isFreedom = metrics.freedomYr === r.year;
              const pct = Math.min(100, Math.round((r.monthly / metrics.targetMonthly) * 100));
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
      <button type="button" onClick={() => setExpanded((v) => !v)} className="rounded-lg border border-border px-3 py-2 text-sm">
        {expanded ? "Collapse" : "Show all 30 years"}
      </button>
    </div>
  );
}
