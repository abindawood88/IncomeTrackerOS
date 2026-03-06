"use client";

import { useEffect, useMemo, useState } from "react";
import { ETF_DB, filterEtfs, sortEtfs } from "@/lib/etf-db";
import { scoreETF } from "@/lib/etf-scoring";
import { useDFPStore } from "@/lib/store";

const CATEGORIES = ["Core Dividend", "Covered Call", "Growth / Index", "Leveraged", "Option Income", "Closed-End Funds", "Roundhill Income", "Roundhill Thematic"];

export default function EtfScreener() {
  const holdings = useDFPStore((s) => s.holdings);
  const addHolding = useDFPStore((s) => s.addHolding);
  const goal = useDFPStore((s) => s.goal);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [maxYield, setMaxYield] = useState(30);
  const [maxExpenseRatio, setMaxExpenseRatio] = useState<number | undefined>(undefined);
  const [excludeLeveraged, setExcludeLeveraged] = useState(false);
  const [sortKey, setSortKey] = useState<"yield" | "expenseRatio" | "volatilityScore" | "cagr">("yield");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const inPortfolio = useMemo(() => new Set(holdings.map((h) => h.ticker.toUpperCase())), [holdings]);

  const rows = useMemo(() => {
    const filtered = filterEtfs(Object.values(ETF_DB), {
      search: debouncedSearch,
      categories,
      minYield: 0,
      maxYield: maxYield / 100,
      maxExpenseRatio,
      leveraged: excludeLeveraged ? false : undefined,
    });
    return sortEtfs(filtered, sortKey, sortDirection);
  }, [debouncedSearch, categories, maxYield, maxExpenseRatio, excludeLeveraged, sortKey, sortDirection]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ticker or name" className="rounded-lg border border-border bg-bg-2 px-3 py-2 text-sm" />
        <select value={maxExpenseRatio?.toString() ?? "any"} onChange={(e) => setMaxExpenseRatio(e.target.value === "any" ? undefined : Number(e.target.value))} className="rounded-lg border border-border bg-bg-2 px-3 py-2 text-sm">
          <option value="any">Any expense ratio</option>
          <option value="0.001">&lt;0.1%</option>
          <option value="0.005">&lt;0.5%</option>
          <option value="0.01">&lt;1%</option>
        </select>
        <select value={sortKey} onChange={(e) => setSortKey(e.target.value as typeof sortKey)} className="rounded-lg border border-border bg-bg-2 px-3 py-2 text-sm">
          <option value="yield">Yield</option><option value="expenseRatio">Expense Ratio</option><option value="volatilityScore">Volatility</option><option value="cagr">CAGR</option>
        </select>
        <button className="rounded-lg border border-border px-3 py-2 text-sm" onClick={() => setSortDirection((d) => (d === "asc" ? "desc" : "asc"))}>{sortDirection.toUpperCase()}</button>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={excludeLeveraged} onChange={(e) => setExcludeLeveraged(e.target.checked)} />Exclude leveraged</label>
      </div>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button key={c} className={`rounded-full border px-2 py-1 text-xs ${categories.includes(c) ? "border-teal-400" : "border-border"}`} onClick={() => setCategories((prev) => (prev.includes(c) ? prev.filter((v) => v !== c) : [...prev, c]))}>{c}</button>
        ))}
      </div>
      <div className="space-y-2">
        <label className="text-sm text-textDim">Max Yield: {maxYield}%</label>
        <input type="range" min={0} max={30} value={maxYield} onChange={(e) => setMaxYield(Number(e.target.value))} className="w-full" />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-border bg-bg-2 p-5 text-sm text-textDim">No ETFs match your current filters. <button className="underline" onClick={() => { setSearch(""); setDebouncedSearch(""); setCategories([]); setMaxYield(30); setExcludeLeveraged(false); setMaxExpenseRatio(undefined); }}>Clear Filters</button></div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-bg-2">
          <table className="w-full min-w-[1100px] text-sm"><thead className="text-left text-xs uppercase text-textDim"><tr><th className="px-3 py-2">Ticker</th><th className="px-3 py-2">Name</th><th className="px-3 py-2">Yield</th><th className="px-3 py-2">CAGR</th><th className="px-3 py-2">Expense</th><th className="px-3 py-2">Volatility</th><th className="px-3 py-2">Pay Freq</th><th className="px-3 py-2">Category</th><th className="px-3 py-2">Score</th><th className="px-3 py-2">Action</th></tr></thead>
            <tbody>{rows.map((etf) => { const score = scoreETF(etf, { targetYield: 0.05, strategy: goal.strategy, riskTolerance: goal.riskTolerance }).total; const already = inPortfolio.has(etf.ticker); return <tr key={etf.ticker} className="border-t border-border"><td className="px-3 py-2 font-semibold">{etf.ticker} <span className="text-xs text-textDim">{etf.health}</span></td><td className="px-3 py-2">{etf.name}</td><td className="px-3 py-2">{(etf.yield * 100).toFixed(2)}%</td><td className="px-3 py-2">{((etf.cagr ?? 0) * 100).toFixed(2)}%</td><td className="px-3 py-2">{(etf.expenseRatio * 100).toFixed(2)}%</td><td className="px-3 py-2">{etf.volatilityScore}</td><td className="px-3 py-2">{etf.payFreq}</td><td className="px-3 py-2">{etf.category}</td><td className="px-3 py-2"><span className="rounded-full border border-border px-2 py-1">{Math.round(score)}</span></td><td className="px-3 py-2">{already ? <span className="text-xs text-teal-300">In Portfolio</span> : <button className="rounded-lg border border-border px-2 py-1 text-xs" onClick={() => addHolding({ ticker: etf.ticker, shares: 1, avgCost: etf.price, cagrOvr: null })}>Add to Portfolio</button>}</td></tr>; })}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
