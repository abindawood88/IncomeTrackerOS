"use client";

import { useMemo, useState } from "react";
import AddHoldingForm from "@/components/portfolio/AddHoldingForm";
import AllocationEditor from "@/components/portfolio/AllocationEditor";
import HoldingsTable from "@/components/portfolio/HoldingsTable";
import FeatureGate from "@/components/ui/FeatureGate";
import { ETF_DB } from "@/lib/etf-db";
import { parseHoldingsCSV, type CSVImportResult } from "@/lib/csv-import";
import { useDFPStore } from "@/lib/store";
import { useToast } from "@/lib/use-toast";
import { useDerivedMetrics } from "@/lib/use-derived-metrics";
import { useSubscription } from "@/lib/use-subscription";

export default function DashboardPortfolioPage() {
  const [tab, setTab] = useState<"holdings" | "allocation">("holdings");
  const [importOpen, setImportOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [preview, setPreview] = useState<CSVImportResult | null>(null);
  const { limits } = useSubscription();
  const { toast } = useToast();
  const strategy = useDFPStore((s) => s.goal.strategy);
  const keyStatus = useDFPStore((s) => s.keyStatus);
  const holdings = useDFPStore((s) => s.holdings);
  const addHolding = useDFPStore((s) => s.addHolding);
  const removeHolding = useDFPStore((s) => s.removeHolding);
  const updateHolding = useDFPStore((s) => s.updateHolding);
  const applyLiveData = useDFPStore((s) => s.applyLiveData);
  const resetPortfolio = useDFPStore((s) => s.resetPortfolio);
  const allocs = useDFPStore((s) => s.allocs);
  const setAllocs = useDFPStore((s) => s.setAllocs);
  const enriched = useDerivedMetrics().enriched;

  const canRefresh = holdings.length > 0;
  const holdingsLimitReached = Number.isFinite(limits.holdingsMax) && holdings.length >= limits.holdingsMax;

  async function refreshAll() {
    if (!canRefresh) return;
    const tickers = holdings.map((h) => h.ticker.toUpperCase());
    const res = await fetch("/api/fetch-ticker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tickers }),
    });
    const data = (await res.json()) as { results?: Array<{ ticker: string; [k: string]: unknown }> };
    (data.results ?? []).forEach((r) => applyLiveData(r.ticker as string, r as never));
  }

  const totalVal = useMemo(() => enriched.reduce((s, h) => s + h.value, 0), [enriched]);

  async function loadCsvFile(file: File | null) {
    if (!file) return;
    const text = await file.text();
    setCsvText(text);
  }

  function applyImport(mode: "replace" | "merge") {
    if (!preview) return;
    if (mode === "replace") resetPortfolio();
    const available = Number.isFinite(limits.holdingsMax) ? limits.holdingsMax - holdings.length : Infinity;
    const rowsToApply = preview.valid.slice(0, Math.max(0, available));
    if (rowsToApply.length < preview.valid.length) {
      toast("Holding limit reached on your current plan.", "warning");
    }
    rowsToApply.forEach((row) =>
      addHolding({ ticker: row.ticker, shares: row.shares, avgCost: row.avgCost, cagrOvr: null }),
    );
    setPreview(null);
    setImportOpen(false);
    setCsvText("");
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab("holdings")}
          className={`rounded-lg px-3 py-2 text-sm ${tab === "holdings" ? "bg-gold text-bg" : "border border-border text-textDim"}`}
        >
          Holdings
        </button>
        <button
          type="button"
          onClick={() => setTab("allocation")}
          className={`rounded-lg px-3 py-2 text-sm ${tab === "allocation" ? "bg-gold text-bg" : "border border-border text-textDim"}`}
        >
          Allocation
        </button>
      </div>

      {tab === "holdings" ? (
        <>
          <div className="rounded-2xl border border-border bg-bg-2 p-4">
            <FeatureGate feature="csv_import" title="CSV Import">
              <button
                data-testid="import-csv-toggle"
                type="button"
                onClick={() => setImportOpen((open) => !open)}
                className="rounded-lg border border-border px-3 py-2 text-sm text-textBright"
              >
                Import CSV
              </button>
            </FeatureGate>
            {importOpen ? (
              <div className="mt-4 space-y-3">
                <label className="block text-sm text-textDim">
                  Paste your CSV here
                  <textarea
                    data-testid="csv-textarea"
                    rows={8}
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    placeholder="ticker,shares,avgCost"
                    className="mt-1 w-full rounded-xl border border-border bg-bg-1 px-3 py-2 font-mono text-sm text-textBright"
                  />
                </label>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-bg-1 px-4 py-6 text-sm text-textDim">
                  <span>Drop a .csv file or click to browse</span>
                  <input
                    data-testid="csv-file-input"
                    type="file"
                    accept=".csv,text/csv"
                    onChange={(e) => void loadCsvFile(e.target.files?.[0] ?? null)}
                    className="hidden"
                  />
                </label>
                <div className="text-xs text-textDim">
                  Expected columns: ticker, shares, avgCost (or symbol, qty, cost_basis)
                </div>
                <button
                  data-testid="csv-preview-btn"
                  type="button"
                  onClick={() => setPreview(parseHoldingsCSV(csvText))}
                  className="rounded-lg bg-gold px-3 py-2 text-sm font-semibold text-bg"
                >
                  Preview Import
                </button>
              </div>
            ) : null}
          </div>

          {preview ? (
            <div className="rounded-2xl border border-border bg-bg-2 p-4">
              <div className="mb-3 text-sm font-semibold text-textBright">Import Preview</div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-sm">
                  <thead className="text-left text-textDim">
                    <tr className="border-b border-border">
                      <th className="px-3 py-2">Ticker</th>
                      <th className="px-3 py-2 text-right">Shares</th>
                      <th className="px-3 py-2 text-right">Avg Cost</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.valid.map((row) => {
                      const known = Boolean(ETF_DB[row.ticker]);
                      return (
                        <tr key={`${row.ticker}-${row.shares}`} className="border-b border-border/60">
                          <td className="px-3 py-2 font-semibold text-textBright">{row.ticker}</td>
                          <td className="px-3 py-2 text-right text-textBright">{row.shares}</td>
                          <td className="px-3 py-2 text-right text-textBright">${row.avgCost.toLocaleString()}</td>
                          <td className="px-3 py-2">
                            <span
                              className={`rounded-full px-2 py-1 text-xs ${
                                known ? "bg-teal/10 text-teal-light" : "bg-gold/10 text-gold-light"
                              }`}
                            >
                              {known ? "✓ Known" : "⚠ Unknown"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {preview.rejected.length > 0 ? (
                <div className="mt-4 rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
                  <div className="mb-2 font-semibold">Rejected Rows</div>
                  {preview.rejected.map((row) => (
                    <div key={`${row.row}-${row.reason}`}>
                      Row {row.row}: {row.reason}
                    </div>
                  ))}
                </div>
              ) : null}
              <div className="mt-3 text-sm text-textDim">
                {preview.valid.length} holdings ready to import, {preview.rejected.length} rows rejected
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  data-testid="csv-replace-btn"
                  type="button"
                  onClick={() => applyImport("replace")}
                  className="rounded-lg bg-gold px-3 py-2 text-sm font-semibold text-bg"
                >
                  Replace Portfolio
                </button>
                <button
                  data-testid="csv-merge-btn"
                  type="button"
                  onClick={() => applyImport("merge")}
                  className="rounded-lg border border-border px-3 py-2 text-sm text-textBright"
                >
                  Merge with Existing
                </button>
                <button
                  data-testid="csv-cancel-btn"
                  type="button"
                  onClick={() => setPreview(null)}
                  className="rounded-lg border border-border px-3 py-2 text-sm text-textDim"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}

          <div className="rounded-xl border border-border bg-bg-2 px-3 py-2 text-xs text-textDim">
            Live market data is pulled from StockAnalysis.
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={refreshAll}
              disabled={!canRefresh}
              className="rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-40"
            >
              Refresh All
            </button>
          </div>
          <AddHoldingForm
            strategy={strategy}
            onAdd={(h) => {
              if (holdingsLimitReached) {
                toast("Free plan supports up to 3 holdings. Upgrade to add more.", "warning");
                return;
              }
              addHolding({ ticker: h.ticker, shares: h.shares, avgCost: h.avgCost, cagrOvr: null });
              toast("Holding added", "success");
            }}
          />
          <HoldingsTable
            rows={enriched}
            raw={holdings}
            keyStatus={keyStatus}
            onDelete={removeHolding}
            onUpdate={updateHolding}
            onApplyLive={applyLiveData}
          />
        </>
      ) : (
        <>
          <AllocationEditor allocs={allocs} setAllocs={setAllocs} />
          <div className="text-sm text-textDim">Estimated portfolio value: ${Math.round(totalVal).toLocaleString()}</div>
        </>
      )}
    </div>
  );
}
