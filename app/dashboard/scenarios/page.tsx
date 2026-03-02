"use client";

import ProjectionChart from "@/components/charts/ProjectionChart";
import MetricCard from "@/components/ui/MetricCard";
import { useDFPStore } from "@/lib/store";
import { useDerivedMetrics } from "@/lib/use-derived-metrics";

export default function DashboardScenariosPage() {
  const crash = useDFPStore((s) => s.crash);
  const pause = useDFPStore((s) => s.pause);
  const setCrash = useDFPStore((s) => s.setCrash);
  const setPause = useDFPStore((s) => s.setPause);
  const goal = useDFPStore((s) => s.goal);
  const metrics = useDerivedMetrics();

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-bg-2 p-4">
          <div className="mb-2 text-sm text-textDim">Market Crash: {crash}%</div>
          <input type="range" min={0} max={80} value={crash} onChange={(e) => setCrash(Number(e.target.value))} className="w-full" />
          {crash > 0 ? <div className="mt-2 text-xs text-danger">Crash stress applied.</div> : null}
        </div>
        <div className="rounded-2xl border border-border bg-bg-2 p-4">
          <div className="mb-2 text-sm text-textDim">Contribution Pause: {pause} months</div>
          <input type="range" min={0} max={60} value={pause} onChange={(e) => setPause(Number(e.target.value))} className="w-full" />
          {pause > 0 ? <div className="mt-2 text-xs text-gold-light">Contributions paused for selected period.</div> : null}
        </div>
      </div>
      <ProjectionChart projData={metrics.projData} target={goal.targetIncome} color="#9b6dff" />
      <div className="grid gap-3 md:grid-cols-3">
        <MetricCard label="Freedom Year" val={metrics.freedomYr ? String(metrics.freedomYr) : "Not reached"} />
        <MetricCard label="Coverage" val={`${metrics.coverage}%`} color="gold" />
        <MetricCard label="Year 30 Monthly" val={`$${(metrics.projData.at(-1)?.monthly ?? 0).toLocaleString()}`} color="teal" />
      </div>
    </div>
  );
}