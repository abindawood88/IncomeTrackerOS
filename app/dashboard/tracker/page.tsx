"use client";

import { useMemo, useState } from "react";
import { useDerivedMetrics } from "@/lib/use-derived-metrics";
import { useDFPStore } from "@/lib/store";
import { ETF_DB } from "@/lib/etf-db";
import SparklineCell from "@/components/charts/SparklineCell";
import HealthBadge from "@/components/ui/HealthBadge";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type SortKey = "value" | "gain" | "gainPct" | "income" | "ticker";
const ALLOCATION_COLORS = ["#00d4be", "#f0c842", "#7c6af7", "#f97316", "#ef4444", "#22c55e", "#06b6d4", "#a855f7", "#f59e0b", "#84cc16"];

export default function PortfolioTrackerPage() {
  const { enriched, totalVal, monthlyIncome, bYield, bCagr } = useDerivedMetrics();
  const holdings = useDFPStore((s) => s.holdings);
  const goal = useDFPStore((s) => s.goal);
  const [sort, setSort] = useState<SortKey>("value");
  const [dir, setDir] = useState<"desc" | "asc">("desc");
  const taxMultiplier = goal.taxEnabled ? 1 - Math.max(0, Math.min(100, goal.taxRate)) / 100 : 1;

  const rows = useMemo(() => {
    return enriched.map((h) => {
      const costBasis = h.shares * h.avgCost;
      const currentVal = h.value;
      const gain = currentVal - costBasis;
      const gainPct = costBasis > 0 ? (gain / costBasis) * 100 : 0;
      const annualIncome = currentVal * h.yld * taxMultiplier;
      const monthlyIncomePos = annualIncome / 12;
      const weight = totalVal > 0 ? (currentVal / totalVal) * 100 : 0;
      return { ...h, costBasis, gain, gainPct, annualIncome, monthlyIncomePos, weight };
    });
  }, [enriched, totalVal, taxMultiplier]);

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      let va = 0, vb = 0;
      if (sort === "value")    { va = a.value;       vb = b.value;       }
      if (sort === "gain")     { va = a.gain;         vb = b.gain;        }
      if (sort === "gainPct")  { va = a.gainPct;      vb = b.gainPct;     }
      if (sort === "income")   { va = a.monthlyIncomePos; vb = b.monthlyIncomePos; }
      if (sort === "ticker")   { return dir === "asc" ? a.ticker.localeCompare(b.ticker) : b.ticker.localeCompare(a.ticker); }
      return dir === "desc" ? vb - va : va - vb;
    });
  }, [rows, sort, dir]);

  function toggleSort(k: SortKey) {
    if (sort === k) setDir((d) => d === "desc" ? "asc" : "desc");
    else { setSort(k); setDir("desc"); }
  }

  const totalCost = rows.reduce((s, r) => s + r.costBasis, 0);
  const totalGain = rows.reduce((s, r) => s + r.gain, 0);
  const totalGainPct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
  const totalAnnualIncome = rows.reduce((s, r) => s + r.annualIncome, 0);

  const SortIcon = ({ k }: { k: SortKey }) => (
    <span className="ml-1 text-[10px]">{sort === k ? (dir === "desc" ? "▼" : "▲") : "⇅"}</span>
  );

  if (enriched.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-bg-2 p-12 text-center">
        <div className="text-4xl mb-3">📊</div>
        <div className="text-textBright font-semibold mb-2">No holdings yet</div>
        <div className="text-sm text-textDim">Add ETFs in the Portfolio tab to start tracking performance.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-border bg-bg-2 p-4">
          <div className="text-xs text-textDim mb-1">Portfolio Value</div>
          <div className="text-2xl font-bold text-textBright">${Math.round(totalVal).toLocaleString()}</div>
          <div className="text-xs text-textDim mt-1">Cost basis: ${Math.round(totalCost).toLocaleString()}</div>
        </div>
        <div className={`rounded-2xl border p-4 ${totalGain >= 0 ? "border-teal/40 bg-teal/5" : "border-danger/40 bg-danger/5"}`}>
          <div className="text-xs text-textDim mb-1">Total Gain / Loss</div>
          <div className={`text-2xl font-bold ${totalGain >= 0 ? "text-teal-light" : "text-danger"}`}>
            {totalGain >= 0 ? "+" : ""}${Math.round(totalGain).toLocaleString()}
          </div>
          <div className={`text-xs mt-1 ${totalGain >= 0 ? "text-teal-light" : "text-danger"}`}>
            {totalGainPct >= 0 ? "+" : ""}{totalGainPct.toFixed(2)}%
          </div>
        </div>
        <div className="rounded-2xl border border-teal/40 bg-teal/5 p-4">
          <div className="text-xs text-textDim mb-1">Monthly Income</div>
          <div className="text-2xl font-bold text-teal-light">${Math.round(monthlyIncome).toLocaleString()}</div>
          <div className="text-xs text-textDim mt-1">Annual: ${Math.round(totalAnnualIncome).toLocaleString()}</div>
        </div>
        <div className="rounded-2xl border border-border bg-bg-2 p-4">
          <div className="text-xs text-textDim mb-1">Blended Yield</div>
          <div className="text-2xl font-bold text-gold-light">{(bYield * 100).toFixed(2)}%</div>
          <div className="text-xs text-textDim mt-1">CAGR: {(bCagr * 100).toFixed(1)}%</div>
        </div>
      </div>

      {/* Allocation bar */}
      <div className="rounded-2xl border border-border bg-bg-2 p-4">
        <div className="text-xs font-semibold text-textBright mb-3">Portfolio Allocation</div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sorted}
                  dataKey="weight"
                  nameKey="ticker"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  innerRadius={45}
                  paddingAngle={1}
                  label={({ payload }) => `${payload.weight.toFixed(1)}%`}
                  labelLine={false}
                >
                  {sorted.map((r, i) => (
                    <Cell key={r.ticker} fill={ALLOCATION_COLORS[i % ALLOCATION_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, _name: string, ctx: { payload?: { value: number; weight: number } }) => [
                    `${Number(value).toFixed(1)}%`,
                    ctx?.payload?.value ? `$${Math.round(ctx.payload.value).toLocaleString()}` : "Allocation",
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {sorted.map((r, i) => (
              <div key={r.ticker} className="flex items-start justify-between gap-3 text-xs">
                <span className="flex items-start gap-2 text-textBright">
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: ALLOCATION_COLORS[i % ALLOCATION_COLORS.length] }} />
                  <span>
                    <span className="block font-semibold">{r.ticker}</span>
                    <span className="block text-textDim">{r.name}</span>
                  </span>
                </span>
                <span className="text-textDim">{r.weight.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Holdings table */}
      <div className="overflow-x-auto rounded-2xl border border-border bg-bg-2">
        <table className="min-w-[1160px] w-full text-sm">
          <thead className="bg-bg-3 text-xs uppercase text-textDim">
            <tr>
              <th className="px-3 py-2 text-left cursor-pointer" onClick={() => toggleSort("ticker")}>
                Ticker <SortIcon k="ticker" />
              </th>
              <th className="px-3 py-2 text-left">Sparkline</th>
              <th className="px-3 py-2 text-left">Shares</th>
              <th className="px-3 py-2 text-left">Avg Cost</th>
              <th className="px-3 py-2 text-left">Current</th>
              <th className="px-3 py-2 text-left cursor-pointer" onClick={() => toggleSort("value")}>
                Value <SortIcon k="value" />
              </th>
              <th className="px-3 py-2 text-left cursor-pointer" onClick={() => toggleSort("gain")}>
                Gain/Loss <SortIcon k="gain" />
              </th>
              <th className="px-3 py-2 text-left cursor-pointer" onClick={() => toggleSort("gainPct")}>
                G/L % <SortIcon k="gainPct" />
              </th>
              <th className="px-3 py-2 text-left">Yield</th>
              <th className="px-3 py-2 text-left cursor-pointer" onClick={() => toggleSort("income")}>
                Mo. Income <SortIcon k="income" />
              </th>
              <th className="px-3 py-2 text-left">Weight</th>
              <th className="px-3 py-2 text-left">Health</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.ticker} className="border-t border-border hover:bg-bg-3/40 transition">
                <td className="px-3 py-2">
                  <div className="font-bold text-textBright">{r.ticker}</div>
                  <div className="text-[10px] text-textDim truncate max-w-[120px]">{r.name}</div>
                </td>
                <td className="px-3 py-2"><SparklineCell data={r.sparkline} /></td>
                <td className="px-3 py-2 text-textDim">{r.shares.toLocaleString()}</td>
                <td className="px-3 py-2 text-textDim">${r.avgCost.toFixed(2)}</td>
                <td className="px-3 py-2">${r.price.toFixed(2)}</td>
                <td className="px-3 py-2 font-semibold text-textBright">
                  ${r.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </td>
                <td className={`px-3 py-2 font-semibold ${r.gain >= 0 ? "text-teal-light" : "text-danger"}`}>
                  {r.gain >= 0 ? "+" : ""}${Math.round(r.gain).toLocaleString()}
                </td>
                <td className={`px-3 py-2 font-semibold ${r.gainPct >= 0 ? "text-teal-light" : "text-danger"}`}>
                  {r.gainPct >= 0 ? "+" : ""}{r.gainPct.toFixed(2)}%
                </td>
                <td className="px-3 py-2 text-teal-light">{(r.yld * 100).toFixed(2)}%</td>
                <td className="px-3 py-2 text-gold-light font-semibold">
                  ${r.monthlyIncomePos.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    <div className="w-16 rounded-full bg-bg-3 h-1.5 overflow-hidden">
                      <div className="h-full bg-teal rounded-full" style={{ width: `${r.weight}%` }} />
                    </div>
                    <span className="text-xs text-textDim">{r.weight.toFixed(1)}%</span>
                  </div>
                </td>
                <td className="px-3 py-2"><HealthBadge health={r.health} /></td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-bg-3 border-t-2 border-border text-xs font-semibold">
            <tr>
              <td className="px-3 py-2 text-textBright" colSpan={5}>TOTAL</td>
              <td className="px-3 py-2 text-textBright">${Math.round(totalVal).toLocaleString()}</td>
              <td className={`px-3 py-2 ${totalGain >= 0 ? "text-teal-light" : "text-danger"}`}>
                {totalGain >= 0 ? "+" : ""}${Math.round(totalGain).toLocaleString()}
              </td>
              <td className={`px-3 py-2 ${totalGainPct >= 0 ? "text-teal-light" : "text-danger"}`}>
                {totalGainPct >= 0 ? "+" : ""}{totalGainPct.toFixed(2)}%
              </td>
              <td className="px-3 py-2 text-teal-light">{(bYield * 100).toFixed(2)}%</td>
              <td className="px-3 py-2 text-gold-light">${Math.round(monthlyIncome).toLocaleString()}</td>
              <td className="px-3 py-2 text-textDim">100%</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
