"use client";

import { useEffect, useMemo, useState } from "react";
import { useDFPStore } from "@/lib/store";

type Etf = {
  ticker: string;
  name: string;
  yield: number;
};

export default function EtfBrowserPage() {
  const [items, setItems] = useState<Etf[]>([]);
  const [q, setQ] = useState("");
  const holdings = useDFPStore((s) => s.holdings);
  const addHolding = useDFPStore((s) => s.addHolding);

  useEffect(() => {
    void fetch("/api/etfs").then(async (res) => {
      const data = (await res.json()) as { items: Etf[] };
      setItems(data.items);
    });
  }, []);

  const filtered = useMemo(() => {
    return items
      .filter((item) => item.ticker.toLowerCase().includes(q.toLowerCase()) || item.name.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => b.yield - a.yield);
  }, [items, q]);

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold">ETF Browser</h1>
      <input data-testid="etf-search" value={q} onChange={(e) => setQ(e.target.value)} className="w-full rounded-lg border border-border bg-bg-2 px-3 py-2" placeholder="Search ETFs" />
      <div className="grid gap-2">
        {filtered.slice(0, 40).map((item) => {
          const inPortfolio = holdings.some((h) => h.ticker === item.ticker);
          return (
            <div key={item.ticker} className="flex items-center justify-between rounded-lg border border-border bg-bg-2 p-3">
              <div>
                <div className="font-semibold">{item.ticker}</div>
                <div className="text-xs text-textDim">{item.name}</div>
              </div>
              <button
                data-testid={`add-etf-${item.ticker}`}
                disabled={inPortfolio}
                onClick={() => addHolding({ ticker: item.ticker, shares: 1, avgCost: 100, cagrOvr: null })}
                className="rounded-lg border border-border px-3 py-2 text-xs disabled:opacity-50"
              >
                {inPortfolio ? "In Portfolio" : "Add to Portfolio"}
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
}
