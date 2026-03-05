"use client";

import { useEffect, useMemo, useState } from "react";
import { useDFPStore } from "@/lib/store";

type EtfRow = {
  ticker: string;
  name: string;
  yield: number;
  expenseRatio: number;
};

export default function EtfBrowserPage() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"ticker" | "yield">("ticker");
  const [rows, setRows] = useState<EtfRow[]>([]);
  const holdings = useDFPStore((s) => s.holdings);
  const addHolding = useDFPStore((s) => s.addHolding);

  useEffect(() => {
    void (async () => {
      const res = await fetch(`/api/etfs?q=${encodeURIComponent(query)}&sort=${sort}`);
      const json = (await res.json()) as { rows: EtfRow[] };
      setRows(json.rows);
    })();
  }, [query, sort]);

  const inPortfolio = useMemo(() => new Set(holdings.map((h) => h.ticker.toUpperCase())), [holdings]);

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold text-textBright">ETF Browser</h1>
      <div className="flex flex-wrap gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search ETF"
          className="rounded-lg border border-border bg-bg-2 px-3 py-2 text-sm"
        />
        <select
          value={sort}
          onChange={(e) => setSort((e.target.value as "ticker" | "yield") ?? "ticker")}
          className="rounded-lg border border-border bg-bg-2 px-3 py-2 text-sm"
        >
          <option value="ticker">Sort: Ticker</option>
          <option value="yield">Sort: Yield</option>
        </select>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border bg-bg-2">
        <table className="w-full min-w-[620px] text-sm">
          <thead className="text-left text-xs uppercase text-textDim">
            <tr>
              <th className="px-3 py-2">Ticker</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Yield %</th>
              <th className="px-3 py-2">Expense %</th>
              <th className="px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const already = inPortfolio.has(row.ticker);
              return (
                <tr key={row.ticker} className="border-t border-border">
                  <td className="px-3 py-2 font-semibold">{row.ticker}</td>
                  <td className="px-3 py-2">{row.name}</td>
                  <td className="px-3 py-2">{row.yield.toFixed(1)}</td>
                  <td className="px-3 py-2">{row.expenseRatio.toFixed(2)}</td>
                  <td className="px-3 py-2">
                    {already ? (
                      <span className="rounded-full border border-teal/40 bg-teal-dim px-2 py-1 text-xs text-teal-light">In Portfolio</span>
                    ) : (
                      <button
                        type="button"
                        className="rounded-lg border border-border px-2 py-1 text-xs"
                        onClick={() => addHolding({ ticker: row.ticker, shares: 1, avgCost: 100, cagrOvr: null })}
                      >
                        Add to Portfolio
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
