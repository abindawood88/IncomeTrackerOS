"use client";

import { useMemo, useState } from "react";
import { useDFPStore } from "@/lib/store";
import { useDerivedMetrics } from "@/lib/use-derived-metrics";
import { rebalanceToTemplate } from "@/lib/rebalance";
import { formatDollars } from "@/lib/utils";
import { BASE_TEMPLATES } from "@/lib/etf-db";

export default function RebalancePage() {
  const allocs = useDFPStore((s) => s.allocs);
  const { enriched } = useDerivedMetrics();
  const [additionalCapital, setAdditionalCapital] = useState(0);
  const [fractional, setFractional] = useState(false);
  const [targetKey, setTargetKey] = useState("current");

  const target = useMemo(
    () =>
      targetKey === "current"
        ? allocs.map((alloc) => ({
            ticker: alloc.ticker,
            weight: alloc.w > 1 ? alloc.w / 100 : alloc.w,
          }))
        : (BASE_TEMPLATES.find((template) => template.id === targetKey)?.holdings ?? []),
    [allocs, targetKey],
  );

  const plan = useMemo(
    () => rebalanceToTemplate(enriched, target, additionalCapital, fractional),
    [enriched, target, additionalCapital, fractional],
  );

  const actionableCount = plan.actions.filter((action) => action.action !== "hold").length;
  const allHold = plan.actions.length > 0 && actionableCount === 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-bg-2 p-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-textBright">Rebalance Portfolio</h2>
          <p className="text-sm text-textDim">
            Compare current holdings against your target allocation and see buy/sell steps.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm text-textDim">
            Additional Capital
            <input
              data-testid="rebalance-additional-capital"
              type="number"
              min={0}
              value={additionalCapital}
              onChange={(e) => setAdditionalCapital(Math.max(0, Number(e.target.value) || 0))}
              className="mt-1 w-full rounded-lg border border-border bg-bg-1 px-3 py-2 text-textBright"
            />
          </label>
          <label className="text-sm text-textDim">
            Target Template
            <select
              data-testid="rebalance-target-selector"
              value={targetKey}
              onChange={(e) => setTargetKey(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-bg-1 px-3 py-2 text-textBright"
            >
              <option value="current">Current Allocation</option>
              {BASE_TEMPLATES.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-border bg-bg-1 px-3 py-2 text-sm text-textDim">
            <input
              data-testid="rebalance-fractional-toggle"
              type="checkbox"
              checked={fractional}
              onChange={(e) => setFractional(e.target.checked)}
              className="h-4 w-4"
            />
            Fractional Shares
          </label>
        </div>
      </div>

      {plan.unresolvable.length > 0 ? (
        <div className="rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-gold-light">
          The following tickers could not be resolved and were excluded from the plan:{" "}
          {plan.unresolvable.join(", ")}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-border bg-bg-2 p-4">
          <div className="text-xs text-textDim">Total Buy Cost</div>
          <div className="mt-1 text-xl font-semibold text-teal-light">
            {formatDollars(plan.totalBuyCost)}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-bg-2 p-4">
          <div className="text-xs text-textDim">Total Sell Proceeds</div>
          <div className="mt-1 text-xl font-semibold text-textBright">
            {formatDollars(plan.totalSellProceeds)}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-bg-2 p-4">
          <div className="text-xs text-textDim">Net Cash Required</div>
          <div
            className={`mt-1 text-xl font-semibold ${
              plan.netCashRequired > 0
                ? "text-danger"
                : plan.netCashRequired < 0
                  ? "text-teal-light"
                  : "text-textBright"
            }`}
          >
            {formatDollars(plan.netCashRequired)}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-bg-2 p-4">
          <div className="text-xs text-textDim">Holdings Affected</div>
          <div className="mt-1 text-xl font-semibold text-textBright">{actionableCount}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-bg-2 p-4">
        <div className="mb-3 text-sm font-semibold text-textBright">Rebalance Actions</div>
        {allHold ? (
          <div className="rounded-xl border border-border bg-bg-1 px-4 py-3 text-sm text-textDim">
            Your portfolio matches the target allocation.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="text-left text-textDim">
                <tr className="border-b border-border">
                  <th className="px-3 py-2">Action</th>
                  <th className="px-3 py-2">Ticker</th>
                  <th className="px-3 py-2 text-right">Shares</th>
                  <th className="px-3 py-2 text-right">Est. Value</th>
                  <th className="px-3 py-2">Reason</th>
                </tr>
              </thead>
              <tbody>
                {plan.actions.map((action) => {
                  const rowTone =
                    action.action === "buy"
                      ? "border-l-4 border-l-teal"
                      : action.action === "sell"
                        ? "border-l-4 border-l-danger"
                        : "border-l-4 border-l-border";
                  const badgeTone =
                    action.action === "buy"
                      ? "bg-teal/10 text-teal-light"
                      : action.action === "sell"
                        ? "bg-danger/10 text-danger"
                        : "bg-bg-1 text-textDim";
                  const estValue =
                    action.action === "buy"
                      ? action.estimatedCost
                      : action.action === "sell"
                        ? action.estimatedProceeds
                        : 0;
                  return (
                    <tr key={`${action.action}-${action.ticker}`} className={`border-b border-border/60 ${rowTone}`}>
                      <td className="px-3 py-3">
                        <span className={`rounded-full px-2 py-1 text-[11px] font-semibold uppercase ${badgeTone}`}>
                          {action.action}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-semibold text-textBright">{action.ticker}</td>
                      <td className="px-3 py-3 text-right text-textBright">
                        {"shares" in action ? action.shares.toLocaleString() : "—"}
                      </td>
                      <td className="px-3 py-3 text-right text-textBright">
                        {action.action === "hold" ? "—" : formatDollars(estValue)}
                      </td>
                      <td className="px-3 py-3 text-textDim">
                        {action.action === "hold"
                          ? `Current ${(action.currentWeight * 100).toFixed(1)}% vs target ${(action.targetWeight * 100).toFixed(1)}%`
                          : action.reason}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
