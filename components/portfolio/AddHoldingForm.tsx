"use client";

import { FormEvent, useState } from "react";

const SUGGESTED = {
  income: ["SCHD", "JEPI", "DIVO", "SPHD"],
  growth: ["VIG", "VYM", "DVY", "SCHD"],
  hyper: ["TSLY", "KQQQ", "FEPI", "TSYY", "LIFT", "TQQQ"],
} as const;

export default function AddHoldingForm({
  strategy,
  onAdd,
}: {
  strategy: "income" | "growth" | "hyper";
  onAdd: (payload: { ticker: string; shares: number; avgCost: number }) => void;
}) {
  const [ticker, setTicker] = useState("");
  const [shares, setShares] = useState("");
  const [avgCost, setAvgCost] = useState("");

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!ticker || !shares) return;
    onAdd({
      ticker: ticker.trim().toUpperCase(),
      shares: Number(shares),
      avgCost: Number(avgCost || 0),
    });
    setTicker("");
    setShares("");
    setAvgCost("");
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-bg-2 p-4">
      <div className="grid gap-3 md:grid-cols-4">
        <input
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          placeholder="Ticker"
          className="rounded-lg border border-border bg-bg-1 px-3 py-2 text-textBright"
        />
        <input
          value={shares}
          onChange={(e) => setShares(e.target.value)}
          placeholder="Shares"
          type="number"
          className="rounded-lg border border-border bg-bg-1 px-3 py-2 text-textBright"
        />
        <input
          value={avgCost}
          onChange={(e) => setAvgCost(e.target.value)}
          placeholder="Avg Cost"
          type="number"
          className="rounded-lg border border-border bg-bg-1 px-3 py-2 text-textBright"
        />
        <button type="submit" className="rounded-lg bg-teal px-3 py-2 font-semibold text-bg">
          Add
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTED[strategy].map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => setTicker(chip)}
            className="rounded-full border border-border px-3 py-1 text-xs text-textDim hover:text-textBright"
          >
            {chip}
          </button>
        ))}
      </div>
    </form>
  );
}
