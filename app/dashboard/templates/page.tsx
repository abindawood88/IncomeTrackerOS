"use client";

import { useState } from "react";
import { PORTFOLIO_TEMPLATES, ETF_DB, type PortfolioTemplate } from "@/lib/etf-db";
import { useDFPStore } from "@/lib/store";
import GlassCard from "@/components/ui/GlassCard";

const CATEGORY_LABELS: Record<string, string> = {
  income: "Income",
  growth: "Growth",
  highyield: "High Yield",
  hybrid: "Hybrid",
};

const CATEGORY_FILTERS = ["All", "income", "growth", "highyield", "hybrid"];

export default function PortfolioTemplatesPage() {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<PortfolioTemplate | null>(null);
  const addHolding = useDFPStore((s) => s.addHolding);
  const resetPortfolio = useDFPStore((s) => s.resetPortfolio);
  const setAllocs = useDFPStore((s) => s.setAllocs);
  const setGoal = useDFPStore((s) => s.setGoal);
  const holdingsCount = useDFPStore((s) => s.holdings.length);

  const filtered = PORTFOLIO_TEMPLATES.filter(
    (t) => filter === "All" || t.category === filter
  );

  function applyTemplate(tpl: PortfolioTemplate) {
    if (holdingsCount > 0) {
      const ok = window.confirm(
        "Applying a template from scratch will erase current holdings and allocation. Continue?",
      );
      if (!ok) return;
    }
    resetPortfolio();
    // Load holdings for template
    tpl.holdings.forEach((h) => {
      const db = ETF_DB[h.ticker];
      if (db) {
        addHolding({
          ticker: h.ticker,
          shares: 10,
          avgCost: db.price,
          cagrOvr: null,
        });
      }
    });
    // Set allocation weights
    setAllocs(tpl.holdings.map((h) => ({ ticker: h.ticker, w: h.weight * 100 })));
    // Update goal strategy
    const strat = tpl.category === "growth" ? "growth" : tpl.category === "highyield" ? "hyper" : "income";
    setGoal({ strategy: strat });
    alert(`Template "${tpl.name}" applied. Previous holdings/allocation were replaced.`);
  }

  const categoryBg: Record<string, string> = {
    income: "border-teal/50 bg-teal/5",
    growth: "border-purple-500/50 bg-purple-500/5",
    highyield: "border-gold/50 bg-gold/5",
    hybrid: "border-orange-500/50 bg-orange-500/5",
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-textBright">Portfolio Templates</h2>
        <p className="text-xs text-textDim mt-1">
          Pre-built portfolios you can load instantly. Apply a template to populate your holdings with suggested ETFs.
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORY_FILTERS.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
              filter === cat
                ? "bg-gold text-bg"
                : "border border-border text-textDim hover:text-textBright"
            }`}
          >
            {cat === "All" ? "All" : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Template cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((tpl) => {
          const monthlyIncome1k = (1000 * tpl.targetYield) / 12;
          return (
            <div
              key={tpl.id}
              className={`rounded-2xl border p-4 cursor-pointer transition hover:shadow-lg ${
                selected?.id === tpl.id ? "ring-2 ring-gold" : categoryBg[tpl.category] || "border-border bg-bg-2"
              }`}
              onClick={() => setSelected(selected?.id === tpl.id ? null : tpl)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span
                    className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold mb-1"
                    style={{ background: tpl.color + "22", color: tpl.color }}
                  >
                    {CATEGORY_LABELS[tpl.category]}
                  </span>
                  <h3 className="font-bold text-textBright">{tpl.name}</h3>
                </div>
                <div className="text-right">
                  <div className="text-teal-light font-bold text-lg">{(tpl.targetYield * 100).toFixed(1)}%</div>
                  <div className="text-[10px] text-textDim">yield</div>
                </div>
              </div>

              <p className="text-xs text-textDim mb-3 leading-relaxed">{tpl.description}</p>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="rounded-lg bg-bg-3 p-2 text-center">
                  <div className="text-xs text-textDim">CAGR</div>
                  <div className="font-semibold text-gold-light text-sm">{(tpl.targetCagr * 100).toFixed(1)}%</div>
                </div>
                <div className="rounded-lg bg-bg-3 p-2 text-center">
                  <div className="text-xs text-textDim">Holdings</div>
                  <div className="font-semibold text-textBright text-sm">{tpl.holdings.length}</div>
                </div>
                <div className="rounded-lg bg-bg-3 p-2 text-center">
                  <div className="text-xs text-textDim">per $1k/mo</div>
                  <div className="font-semibold text-teal-light text-sm">${Math.round(monthlyIncome1k).toLocaleString()}</div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {tpl.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-border px-2 py-0.5 text-[10px] text-textDim">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Expanded detail */}
              {selected?.id === tpl.id && (
                <div className="mt-3 border-t border-border pt-3 space-y-2">
                  <div className="text-xs font-semibold text-textBright mb-2">Holdings & Weights</div>
                  {tpl.holdings.map((h) => {
                    const db = ETF_DB[h.ticker];
                    return (
                      <div key={h.ticker} className="flex items-center gap-2 text-xs">
                        <div className="w-16 font-semibold text-textBright">{h.ticker}</div>
                        <div className="flex-1 rounded-full bg-bg-3 h-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${h.weight * 100}%`, background: tpl.color }}
                          />
                        </div>
                        <div className="w-10 text-right text-textDim">{Math.round(h.weight * 100)}%</div>
                        <div className="w-16 text-right text-teal-light">{db ? (db.yield * 100).toFixed(1) + "%" : "—"}</div>
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    onClick={(ev) => { ev.stopPropagation(); applyTemplate(tpl); }}
                    className="mt-3 w-full rounded-lg py-2 text-sm font-semibold transition"
                    style={{ background: tpl.color, color: "#0a0f0d" }}
                  >
                    Apply Template →
                  </button>
                </div>
              )}

              {selected?.id !== tpl.id && (
                <div className="text-xs text-textDim text-center mt-1">Click to expand</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-bg-2 p-4 text-xs text-textDim">
        <strong className="text-textBright">How templates work:</strong> Clicking &quot;Apply Template&quot; will add each ETF with 10 shares to your portfolio and set the allocation weights. You can then adjust share counts and sync live prices in the Portfolio tab.
      </div>
    </div>
  );
}
