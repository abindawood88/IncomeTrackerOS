"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useDerivedMetrics } from "@/lib/use-derived-metrics";
import { useDFPStore } from "@/lib/store";
import { buildYieldTrackerData } from "@/lib/yield-tracker";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function getMonthlySchedule(payFreq: string, baseMonthly: number): number[] {
  const months = new Array(12).fill(0);
  if (payFreq === "weekly" || payFreq === "monthly") {
    for (let i = 0; i < 12; i++) months[i] = baseMonthly;
  } else if (payFreq === "quarterly") {
    // Pay in March, June, September, December (indices 2, 5, 8, 11)
    [2, 5, 8, 11].forEach((m) => (months[m] = baseMonthly * 3));
  } else if (payFreq === "annual") {
    months[11] = baseMonthly * 12;
  }
  return months;
}

export default function YieldTrackerPage() {
  const { enriched, totalVal, monthlyIncome, bYield } = useDerivedMetrics();
  const goal = useDFPStore((s) => s.goal);
  const actualDividends = useDFPStore((s) => s.actualDividends);
  const setActualDividend = useDFPStore((s) => s.setActualDividend);
  const [view, setView] = useState<"chart" | "table">("chart");
  const taxMultiplier = goal.taxEnabled ? 1 - Math.max(0, Math.min(100, goal.taxRate)) / 100 : 1;

  const holdingRows = useMemo(() => {
    return enriched.map((h) => {
      const annualIncome = h.value * h.yld;
      const mo = (annualIncome * taxMultiplier) / 12;
      const schedule = getMonthlySchedule(h.payFreq, mo);
      return { ...h, annualIncome: annualIncome * taxMultiplier, monthlyAvg: mo, schedule };
    });
  }, [enriched, taxMultiplier]);

  const monthlyTotals = useMemo(() => {
    const totals = new Array(12).fill(0);
    holdingRows.forEach((r) => {
      r.schedule.forEach((v, i) => { totals[i] += v; });
    });
    return totals;
  }, [holdingRows]);

  const annualTotal = monthlyTotals.reduce((s, v) => s + v, 0);
  const goalMonthly = goal.targetPeriod === "yearly" ? goal.targetIncome / 12 : goal.targetIncome;
  const coverage = goalMonthly > 0 ? Math.min(100, (monthlyIncome / goalMonthly) * 100) : 0;
  const trackerData = useMemo(
    () => buildYieldTrackerData(actualDividends, monthlyTotals, goalMonthly),
    [actualDividends, monthlyTotals, goalMonthly],
  );
  // Income by pay frequency
  const freqBreakdown = useMemo(() => {
    const byFreq: Record<string, number> = { weekly: 0, monthly: 0, quarterly: 0, annual: 0 };
    holdingRows.forEach((r) => { byFreq[r.payFreq] = (byFreq[r.payFreq] || 0) + r.annualIncome; });
    return byFreq;
  }, [holdingRows]);

  if (enriched.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-bg-2 p-12 text-center">
        <div className="text-4xl mb-3">💰</div>
        <div className="text-textBright font-semibold mb-2">No income to track yet</div>
        <div className="text-sm text-textDim">Add holdings in Portfolio to start tracking your dividend income.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header KPIs */}
      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-teal/40 bg-teal/5 p-4">
          <div className="text-xs text-textDim mb-1">Monthly Income (avg)</div>
          <div className="text-2xl font-bold text-teal-light">${Math.round(monthlyIncome).toLocaleString()}</div>
          <div className="text-xs text-textDim mt-1">Annual: ${Math.round(annualTotal).toLocaleString()}</div>
        </div>
        <div className="rounded-2xl border border-gold/40 bg-gold/5 p-4">
          <div className="text-xs text-textDim mb-1">Blended Yield</div>
          <div className="text-2xl font-bold text-gold-light">{(bYield * 100).toFixed(2)}%</div>
          <div className="text-xs text-textDim mt-1">On ${Math.round(totalVal).toLocaleString()} portfolio</div>
        </div>
        <div className="rounded-2xl border border-border bg-bg-2 p-4">
          <div className="text-xs text-textDim mb-1">Goal Coverage</div>
          <div className="text-2xl font-bold text-textBright">{Math.round(coverage)}%</div>
          <div className="text-xs text-textDim mt-1">Target: ${goalMonthly.toLocaleString()}/mo</div>
        </div>
        <div className="rounded-2xl border border-border bg-bg-2 p-4">
          <div className="text-xs text-textDim mb-1">Income Sources</div>
          <div className="space-y-1 mt-1">
            {Object.entries(freqBreakdown).map(([freq, amt]) => (
              amt > 0 ? (
                <div key={freq} className="flex justify-between text-xs">
                  <span className="capitalize text-textDim">{freq}</span>
                  <span className="text-teal-light">${Math.round(amt).toLocaleString()}/yr</span>
                </div>
              ) : null
            ))}
          </div>
        </div>
      </div>

      {/* View toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setView("chart")}
          className={`rounded-lg px-3 py-2 text-sm ${view === "chart" ? "bg-gold text-bg" : "border border-border text-textDim"}`}
        >
          Bar Chart
        </button>
        <button
          type="button"
          onClick={() => setView("table")}
          className={`rounded-lg px-3 py-2 text-sm ${view === "table" ? "bg-gold text-bg" : "border border-border text-textDim"}`}
        >
          Monthly Table
        </button>
      </div>

      {view === "chart" ? (
        <div className="rounded-2xl border border-border bg-bg-2 p-4">
          <div className="text-sm font-semibold text-textBright mb-1">Monthly Income: Actual vs Target vs Estimated</div>
          <div className="mb-4 text-xs text-textDim">
            Estimated uses the scheduled monthly baseline, adjusted by an exponentially smoothed bias from prior actual payments.
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trackerData} barGap={6} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#223047" />
                <XAxis dataKey="label" stroke="#9db0d0" />
                <YAxis
                  stroke="#9db0d0"
                  tickFormatter={(value: number) => `$${Math.round(value)}`}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `$${Number(value).toFixed(2)}`,
                    name === "actual" ? "Actual" : name === "target" ? "Target" : "Estimated",
                  ]}
                  labelFormatter={(label: string) => `${label}`}
                />
                <Legend
                  formatter={(value: string) =>
                    value === "actual" ? "Actual" : value === "target" ? "Target" : "Estimated"
                  }
                />
                <Bar dataKey="actual" fill="#00d4be" radius={[6, 6, 0, 0]} />
                <Bar dataKey="target" fill="#f97316" radius={[6, 6, 0, 0]} />
                <Bar dataKey="estimated" fill="#f0c842" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        /* Monthly breakdown table */
        <div className="overflow-x-auto rounded-2xl border border-border bg-bg-2">
          <table className="w-full text-xs" style={{ minWidth: "900px" }}>
            <thead className="bg-bg-3 text-[10px] uppercase text-textDim">
              <tr>
                <th className="px-3 py-2 text-left sticky left-0 bg-bg-3">Ticker</th>
                <th className="px-3 py-2 text-left">Freq</th>
                {MONTHS.map((m) => (
                  <th key={m} className="px-2 py-2 text-right">{m}</th>
                ))}
                <th className="px-3 py-2 text-right">Annual</th>
              </tr>
            </thead>
            <tbody>
              {holdingRows.map((r) => (
                <tr key={r.ticker} className="border-t border-border hover:bg-bg-3/40 transition">
                  <td className="px-3 py-2 font-semibold text-textBright sticky left-0 bg-bg-2">{r.ticker}</td>
                  <td className="px-3 py-2 capitalize text-textDim">{r.payFreq}</td>
                  {r.schedule.map((v, i) => (
                    <td key={i} className={`px-2 py-2 text-right ${v > 0 ? "text-teal-light font-medium" : "text-textDim"}`}>
                      {v > 0 ? `$${Math.round(v).toLocaleString()}` : "—"}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-right text-gold-light font-semibold">
                    ${Math.round(r.annualIncome).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-bg-3 border-t-2 border-border text-xs font-semibold">
              <tr>
                <td className="px-3 py-2 text-textBright sticky left-0 bg-bg-3" colSpan={2}>TOTAL</td>
                {monthlyTotals.map((v, i) => (
                  <td key={i} className={`px-2 py-2 text-right ${v > 0 ? "text-teal-light" : "text-textDim"}`}>
                    {v > 0 ? `$${Math.round(v).toLocaleString()}` : "—"}
                  </td>
                ))}
                <td className="px-3 py-2 text-right text-gold-light">${Math.round(annualTotal).toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-bg-2 p-4">
        <div className="text-sm font-semibold text-textBright mb-1">Enter Actual Dividends Received</div>
        <div className="text-xs text-textDim mb-3">Track what you really received each month to compare against estimate and target.</div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {MONTHS.map((m, i) => (
            <label key={m} className="rounded-lg border border-border bg-bg-1 px-3 py-2 text-xs text-textDim">
              {m}
              <input
                type="number"
                min={0}
                step="0.01"
                value={actualDividends[i] ?? 0}
                onChange={(e) => setActualDividend(i, Number(e.target.value))}
                className="mt-1 w-full rounded border border-border bg-bg-2 px-2 py-1 text-textBright"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Per-holding yield breakdown */}
      <div className="rounded-2xl border border-border bg-bg-2 p-4">
        <div className="text-sm font-semibold text-textBright mb-3">Income by Holding</div>
        <div className="space-y-2">
          {holdingRows
            .sort((a, b) => b.annualIncome - a.annualIncome)
            .map((r) => {
              const sharePct = annualTotal > 0 ? (r.annualIncome / annualTotal) * 100 : 0;
              return (
                <div key={r.ticker} className="flex items-center gap-3">
                  <div className="w-14 font-semibold text-textBright text-xs">{r.ticker}</div>
                  <div className="flex-1 rounded-full bg-bg-3 h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-teal transition-all"
                      style={{ width: `${sharePct}%` }}
                    />
                  </div>
                  <div className="w-28 text-right text-xs text-teal-light font-semibold">
                    ${Math.round(r.monthlyAvg).toLocaleString()}/mo
                  </div>
                  <div className="w-20 text-right text-xs text-textDim">
                    {(r.yld * 100).toFixed(2)}% yield
                  </div>
                  <div className="w-16 text-right text-xs text-textDim">
                    {sharePct.toFixed(1)}%
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
