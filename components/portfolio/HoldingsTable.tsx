"use client";

import { Fragment, useMemo, useState } from "react";
import SparklineCell from "../charts/SparklineCell";
import HealthBadge from "../ui/HealthBadge";
import type { EnrichedHolding, LiveData, RawHolding } from "@/lib/types";

type EditState = {
  shares: string;
  avgCost: string;
  cagrOvr: string;
};

export default function HoldingsTable({
  rows,
  raw,
  keyStatus,
  onDelete,
  onUpdate,
  onApplyLive,
}: {
  rows: EnrichedHolding[];
  raw: RawHolding[];
  keyStatus: "idle" | "validating" | "ok" | "error";
  onDelete: (ticker: string) => void;
  onUpdate: (ticker: string, patch: Partial<RawHolding>) => void;
  onApplyLive: (ticker: string, data: LiveData) => void;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [editingTicker, setEditingTicker] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<EditState>({
    shares: "0",
    avgCost: "0",
    cagrOvr: "",
  });

  const summary = useMemo(() => {
    const totalValue = rows.reduce((sum, row) => sum + row.value, 0);
    const annualIncome = rows.reduce((sum, row) => sum + row.value * row.yld, 0);
    const blendedYield = totalValue > 0 ? annualIncome / totalValue : 0;
    const blendedCagr =
      totalValue > 0 ? rows.reduce((sum, row) => sum + row.value * (row.cagr ?? 0), 0) / totalValue : 0;
    return { totalValue, annualIncome, blendedYield, blendedCagr };
  }, [rows]);

  async function syncOne(ticker: string) {
    setLoading(ticker);
    try {
      const res = await fetch("/api/fetch-ticker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickers: [ticker] }),
      });
      const data = (await res.json()) as { results?: LiveData[] };
      const hit = data.results?.[0];
      if (hit) onApplyLive(ticker, hit);
    } finally {
      setLoading(null);
    }
  }

  function handleStartEdit(holding: RawHolding): void {
    setEditingTicker(holding.ticker);
    setEditValues({
      shares: String(holding.shares),
      avgCost: String(holding.avgCost),
      cagrOvr: holding.cagrOvr !== null ? String(holding.cagrOvr * 100) : "",
    });
  }

  function handleSaveEdit(ticker: string): void {
    onUpdate(ticker, {
      shares: Number(editValues.shares),
      avgCost: Number(editValues.avgCost),
      cagrOvr: editValues.cagrOvr === "" ? null : Number(editValues.cagrOvr) / 100,
    });
    setEditingTicker(null);
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-2xl border border-border bg-bg-2">
        <table className="min-w-[1320px] w-full text-sm">
          <thead className="bg-bg-3 text-xs uppercase text-textDim">
            <tr>
              {[
                "Ticker",
                "Company",
                "Sparkline",
                "Shares",
                "Avg Cost",
                "Price",
                "Value",
                "Gain/Loss",
                "Yield",
                "Source",
                "Health",
                "CAGR",
                "Edit",
                "Sync",
                "Delete",
              ].map((heading) => (
                <th key={heading} className="px-3 py-2 text-left">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const sourceBadge = row.src === "live" ? "● LIVE" : "DB";
              const sourceColor = row.src === "live" ? "text-teal-light" : "text-gold-light";
              const rawRow = raw.find((holding) => holding.ticker.toUpperCase() === row.ticker.toUpperCase());
              const basisValue = (rawRow?.avgCost ?? row.price) * (rawRow?.shares ?? row.shares);
              const gainLoss = row.value - basisValue;
              const gainLossPct = basisValue > 0 ? (gainLoss / basisValue) * 100 : 0;
              const isEditing = editingTicker === row.ticker;
              const previewShares = Number(editValues.shares) || 0;
              const previewBasis = Number(editValues.avgCost) || 0;
              const previewValue = previewShares * row.price;
              const previewCost = previewShares * previewBasis;
              const previewGain = previewValue - previewCost;
              const previewGainPct = previewCost > 0 ? (previewGain / previewCost) * 100 : 0;
              const previewAnnualIncome = previewValue * row.yld;

              return (
                <Fragment key={row.ticker}>
                  <tr className="border-t border-border">
                    <td className="px-3 py-2 font-semibold text-textBright">{row.ticker}</td>
                    <td className="px-3 py-2 text-textDim">{row.name}</td>
                    <td className="px-3 py-2">
                      <SparklineCell data={row.sparkline} />
                    </td>
                    <td className="px-3 py-2 text-textBright">{row.shares.toLocaleString()}</td>
                    <td className="px-3 py-2 text-textBright">${(rawRow?.avgCost ?? 0).toFixed(2)}</td>
                    <td className="px-3 py-2 text-textBright">${row.price.toFixed(2)}</td>
                    <td className="px-3 py-2 text-textBright">
                      ${row.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </td>
                    <td className={`px-3 py-2 font-semibold ${gainLoss >= 0 ? "text-teal-light" : "text-danger"}`}>
                      {gainLoss >= 0 ? "+" : ""}${gainLoss.toFixed(2)} ({gainLossPct.toFixed(1)}%)
                    </td>
                    <td className="px-3 py-2 text-textBright">{(row.yld * 100).toFixed(2)}%</td>
                    <td className={`px-3 py-2 text-xs ${sourceColor}`}>{sourceBadge}</td>
                    <td className="px-3 py-2">
                      <HealthBadge health={row.health} />
                    </td>
                    <td className="px-3 py-2 text-teal-light">{((row.cagr ?? 0) * 100).toFixed(1)}%</td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => rawRow && handleStartEdit(rawRow)}
                        className="rounded border border-border px-2 py-1 text-textDim"
                      >
                        ✏
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        disabled={loading === row.ticker || keyStatus === "validating"}
                        onClick={() => syncOne(row.ticker)}
                        className="rounded border border-border px-2 py-1 disabled:opacity-40"
                      >
                        {loading === row.ticker ? "..." : "sync"}
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => onDelete(row.ticker)}
                        className="rounded border border-danger/40 px-2 py-1 text-danger"
                      >
                        x
                      </button>
                    </td>
                  </tr>

                  {isEditing ? (
                    <tr data-testid={`holding-edit-row-${row.ticker}`}>
                      <td colSpan={15} className="px-3 py-3">
                        <div className="rounded-xl border border-sky-500/40 bg-sky-500/10 p-4">
                          <div className="flex flex-wrap items-end gap-4">
                            <div className="flex flex-col gap-1">
                              <label className="text-xs font-medium text-textDim">Shares</label>
                              <input
                                data-testid={`edit-shares-${row.ticker}`}
                                type="number"
                                min={0}
                                step="0.0001"
                                value={editValues.shares}
                                onChange={(e) =>
                                  setEditValues((current) => ({ ...current, shares: e.target.value }))
                                }
                                className="w-28 rounded-lg border border-border bg-bg-1 px-2 py-1 text-sm text-textBright"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-xs font-medium text-textDim">Avg Cost ($)</label>
                              <input
                                data-testid={`edit-avgcost-${row.ticker}`}
                                type="number"
                                min={0}
                                step="0.01"
                                value={editValues.avgCost}
                                onChange={(e) =>
                                  setEditValues((current) => ({ ...current, avgCost: e.target.value }))
                                }
                                className="w-28 rounded-lg border border-border bg-bg-1 px-2 py-1 text-sm text-textBright"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-xs font-medium text-textDim">CAGR Override (%)</label>
                              <input
                                data-testid={`edit-cagr-${row.ticker}`}
                                type="number"
                                step="0.1"
                                placeholder="Use ETF default"
                                value={editValues.cagrOvr}
                                onChange={(e) =>
                                  setEditValues((current) => ({ ...current, cagrOvr: e.target.value }))
                                }
                                className="w-36 rounded-lg border border-border bg-bg-1 px-2 py-1 text-sm text-textBright"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                data-testid={`save-edit-${row.ticker}`}
                                type="button"
                                onClick={() => handleSaveEdit(row.ticker)}
                                className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white"
                              >
                                Save
                              </button>
                              <button
                                data-testid={`cancel-edit-${row.ticker}`}
                                type="button"
                                onClick={() => setEditingTicker(null)}
                                className="rounded-lg border border-border px-3 py-2 text-sm text-textDim"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-6 text-xs text-textDim">
                            <span>
                              New Value: <strong className="text-textBright">${previewValue.toFixed(2)}</strong>
                            </span>
                            <span>
                              Gain/Loss:{" "}
                              <strong className={previewGain >= 0 ? "text-teal-light" : "text-danger"}>
                                {previewGain >= 0 ? "+" : ""}
                                {previewGain.toFixed(2)} ({previewGainPct.toFixed(1)}%)
                              </strong>
                            </span>
                            <span>
                              Est. Annual Income:{" "}
                              <strong className="text-gold-light">${previewAnnualIncome.toFixed(2)}</strong>
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        <div className="rounded-xl border border-border bg-bg-2 p-3">
          <div className="text-xs text-textDim">Portfolio Value</div>
          <div className="mt-1 font-semibold text-textBright">${summary.totalValue.toFixed(2)}</div>
        </div>
        <div className="rounded-xl border border-border bg-bg-2 p-3">
          <div className="text-xs text-textDim">Est. Annual Income</div>
          <div className="mt-1 font-semibold text-gold-light">${summary.annualIncome.toFixed(2)}</div>
        </div>
        <div className="rounded-xl border border-border bg-bg-2 p-3">
          <div className="text-xs text-textDim">Blended Yield</div>
          <div className="mt-1 font-semibold text-teal-light">{(summary.blendedYield * 100).toFixed(2)}%</div>
        </div>
        <div className="rounded-xl border border-border bg-bg-2 p-3">
          <div className="text-xs text-textDim">Blended CAGR</div>
          <div className="mt-1 font-semibold text-textBright">{(summary.blendedCagr * 100).toFixed(2)}%</div>
        </div>
        <div className="rounded-xl border border-border bg-bg-2 p-3">
          <div className="text-xs text-textDim">Holdings</div>
          <div className="mt-1 font-semibold text-textBright">{rows.length}</div>
        </div>
      </div>
    </div>
  );
}
