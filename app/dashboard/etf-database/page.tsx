"use client";

import { useMemo, useState } from "react";
import { ETF_DB, ETF_CATEGORIES } from "@/lib/etf-db";
import HealthBadge from "@/components/ui/HealthBadge";
import SparklineCell from "@/components/charts/SparklineCell";
import { useDFPStore } from "@/lib/store";
import type { ETFRecord } from "@/lib/types";

type SortKey = "yield" | "cagr" | "price" | "ticker";

export default function ETFDatabasePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [sortKey, setSortKey] = useState<SortKey>("yield");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [compareList, setCompareList] = useState<string[]>([]);
  const addHolding = useDFPStore((s) => s.addHolding);

  const allEtfs = useMemo(() => Object.values(ETF_DB), []);

  const categories = ["All", ...Object.keys(ETF_CATEGORIES)];

  const filtered = useMemo(() => {
    let list: ETFRecord[] = allEtfs;

    if (category !== "All") {
      const tickers = ETF_CATEGORIES[category] ?? [];
      list = list.filter((e) => tickers.includes(e.ticker));
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (e) => e.ticker.toLowerCase().includes(q) || e.name.toLowerCase().includes(q)
      );
    }

    list = [...list].sort((a, b) => {
      let va = 0, vb = 0;
      if (sortKey === "yield")  { va = a.yield ?? 0; vb = b.yield ?? 0; }
      if (sortKey === "cagr")   { va = a.cagr ?? 0;  vb = b.cagr ?? 0;  }
      if (sortKey === "price")  { va = a.price; vb = b.price; }
      if (sortKey === "ticker") { return sortDir === "asc" ? a.ticker.localeCompare(b.ticker) : b.ticker.localeCompare(a.ticker); }
      return sortDir === "desc" ? vb - va : va - vb;
    });

    return list;
  }, [allEtfs, category, search, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortKey(key); setSortDir("desc"); }
  }

  function toggleCompare(ticker: string) {
    setCompareList((prev) =>
      prev.includes(ticker) ? prev.filter((t) => t !== ticker) : prev.length < 4 ? [...prev, ticker] : prev
    );
  }

  const compareData = compareList.map((t) => ETF_DB[t]).filter(Boolean) as ETFRecord[];

  function quickAdd(e: ETFRecord) {
    addHolding({ ticker: e.ticker, shares: 1, avgCost: e.price, cagrOvr: null });
  }

  const SortIcon = ({ k }: { k: SortKey }) => (
    <span className="ml-1 text-[10px]">
      {sortKey === k ? (sortDir === "desc" ? "▼" : "▲") : "⇅"}
    </span>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-textBright">ETF Database</h2>
          <p className="text-xs text-textDim">{allEtfs.length} ETFs • Local baseline data</p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search ticker or name…"
          className="rounded-lg border border-border bg-bg-1 px-3 py-2 text-sm text-textBright w-64"
        />
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`rounded-full px-3 py-1 text-xs transition ${
              category === cat
                ? "bg-teal text-bg font-semibold"
                : "border border-border text-textDim hover:text-textBright"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Compare panel */}
      {compareList.length > 0 && (
        <div className="rounded-2xl border border-gold/40 bg-gold-dim p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-gold-light">Compare ({compareList.length}/4)</span>
            <button type="button" onClick={() => setCompareList([])} className="text-xs text-textDim hover:text-textBright">
              Clear
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            {compareData.map((e) => (
              <div key={e.ticker} className="rounded-xl border border-border bg-bg-2 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-bold text-textBright">{e.ticker}</span>
                  <HealthBadge health={e.health} />
                </div>
                <div className="text-xs text-textDim truncate mb-2">{e.name}</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-textDim">Yield</span>
                    <span className="text-teal-light font-semibold">{(e.yield * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-textDim">CAGR</span>
                    <span className="text-gold-light">{e.cagr ? (e.cagr * 100).toFixed(1) + "%" : "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-textDim">Price</span>
                    <span>${e.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-textDim">Frequency</span>
                    <span className="capitalize">{e.payFreq}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-border bg-bg-2">
        <table className="min-w-[1060px] w-full text-sm">
          <thead className="bg-bg-3 text-xs uppercase text-textDim">
            <tr>
              <th className="px-3 py-2 text-left w-8">
                <span className="text-[10px]">Cmp</span>
              </th>
              <th className="px-3 py-2 text-left cursor-pointer" onClick={() => toggleSort("ticker")}>
                Ticker <SortIcon k="ticker" />
              </th>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Sparkline</th>
              <th className="px-3 py-2 text-left cursor-pointer" onClick={() => toggleSort("price")}>
                Price <SortIcon k="price" />
              </th>
              <th className="px-3 py-2 text-left cursor-pointer" onClick={() => toggleSort("yield")}>
                Yield <SortIcon k="yield" />
              </th>
              <th className="px-3 py-2 text-left cursor-pointer" onClick={() => toggleSort("cagr")}>
                CAGR <SortIcon k="cagr" />
              </th>
              <th className="px-3 py-2 text-left">Freq</th>
              <th className="px-3 py-2 text-left">Health</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">Add</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => {
              const inCompare = compareList.includes(e.ticker);
              const annualIncomePerShare = e.price * e.yield;
              return (
                <tr key={e.ticker} className={`border-t border-border hover:bg-bg-3/50 transition ${inCompare ? "bg-gold-dim/30" : ""}`}>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => toggleCompare(e.ticker)}
                      className={`w-5 h-5 rounded border text-[10px] transition ${
                        inCompare ? "border-gold bg-gold text-bg" : "border-border text-textDim hover:border-gold"
                      }`}
                    >
                      {inCompare ? "✓" : "+"}
                    </button>
                  </td>
                  <td className="px-3 py-2 font-bold text-textBright">{e.ticker}</td>
                  <td className="px-3 py-2 text-textDim max-w-[200px] truncate">{e.name}</td>
                  <td className="px-3 py-2"><SparklineCell data={e.sparkline} /></td>
                  <td className="px-3 py-2">${e.price.toFixed(2)}</td>
                  <td className="px-3 py-2">
                    <span className={`font-semibold ${e.yield >= 0.10 ? "text-danger" : e.yield >= 0.05 ? "text-teal-light" : "text-gold-light"}`}>
                      {(e.yield * 100).toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gold-light">
                    {e.cagr ? (e.cagr * 100).toFixed(1) + "%" : <span className="text-textDim">—</span>}
                  </td>
                  <td className="px-3 py-2 capitalize text-textDim">{e.payFreq}</td>
                  <td className="px-3 py-2"><HealthBadge health={e.health} /></td>
                  <td className="px-3 py-2">
                    {e.leveraged ? (
                      <span className="rounded-full bg-danger/20 px-2 py-0.5 text-[10px] text-danger">3x Lev</span>
                    ) : e.yield >= 0.10 ? (
                      <span className="rounded-full bg-gold-dim px-2 py-0.5 text-[10px] text-gold-light">High Yield</span>
                    ) : (
                      <span className="rounded-full bg-bg-3 px-2 py-0.5 text-[10px] text-textDim">Standard</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => quickAdd(e)}
                      className="rounded border border-teal/40 px-2 py-1 text-xs text-teal-light hover:bg-teal/10 transition"
                    >
                      + Add
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-textDim">No ETFs match your search.</div>
        )}
      </div>

      <div className="text-xs text-textDim">
        Showing {filtered.length} of {allEtfs.length} ETFs. Data is local baseline — use Sync in Portfolio for live prices.
      </div>
    </div>
  );
}
