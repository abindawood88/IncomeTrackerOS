"use client";

import { useMemo } from "react";
import {
  blendedMetrics,
  buildPaydayCalendar,
  findFreedomYear,
  getHealth,
  milestonesProgress,
  project,
  riskScore,
} from "./engine";
import { useLiveCache } from "./cache";
import { ETF_DB } from "./etf-db";
import { useDFPStore } from "./store";
import type { DataSource, EnrichedHolding, LiveData, RawHolding } from "./types";
import { clamp, normalizeTicker } from "./utils";

export function enrichHoldings(
  holdings: RawHolding[],
  getLiveData?: (ticker: string) => LiveData | null,
): EnrichedHolding[] {
  return holdings.map((holding) => {
    const ticker = normalizeTicker(holding.ticker);
    const db = ETF_DB[ticker];
    const live = getLiveData?.(ticker) ?? (holding.live?.source === "live" ? holding.live : null);

    const price = live?.price ?? db?.price ?? holding.avgCost ?? 0;
    const yld = live?.yield ?? db?.yield ?? 0;
    const cagr = holding.cagrOvr ?? live?.cagr ?? db?.cagr ?? null;
    const payFreq = live?.payFreq ?? db?.payFreq ?? "quarterly";
    const sparkline = db?.sparkline ?? [];
    const leveraged = db?.leveraged ?? false;
    const name = live?.name ?? db?.name ?? ticker;
    const src: DataSource = live ? "live" : db ? (db.source === "stub" ? "local" : db.source) : "manual";
    const value = holding.shares * price;
    const health = getHealth(yld, cagr);

    return {
      ticker,
      shares: holding.shares,
      avgCost: holding.avgCost,
      price,
      value,
      yld,
      cagr,
      src,
      payFreq,
      sparkline,
      health,
      leveraged,
      name,
    };
  });
}

export function useDerivedMetrics() {
  const targetIncome = useDFPStore((state) => state.goal.targetIncome);
  const capital = useDFPStore((state) => state.goal.capital);
  const monthly = useDFPStore((state) => state.goal.monthly);
  const drip = useDFPStore((state) => state.goal.drip);
  const years = useDFPStore((state) => state.goal.years);
  const taxEnabled = useDFPStore((state) => state.goal.taxEnabled);
  const taxRate = useDFPStore((state) => state.goal.taxRate);
  const holdings = useDFPStore((state) => state.holdings);
  const crash = useDFPStore((state) => state.crash);
  const pause = useDFPStore((state) => state.pause);
  const { get: getLiveData } = useLiveCache();

  return useMemo(() => {
    const taxRatePct = clamp(taxRate ?? 0, 0, 100);
    const taxMultiplier = taxEnabled ? 1 - taxRatePct / 100 : 1;
    const enriched = enrichHoldings(holdings, getLiveData);
    const grossMetrics = blendedMetrics(enriched);
    const netYield = grossMetrics.bYield * taxMultiplier;
    const netMonthlyIncome = Math.round(grossMetrics.monthlyIncome * taxMultiplier);
    const score = riskScore(enriched);
    const projData = project({
      capital: grossMetrics.totalVal || capital,
      monthly,
      cagr: grossMetrics.bCagr,
      yld: netYield,
      drip,
      years,
      crash,
      pause,
    });
    const freedomYr = findFreedomYear(projData, targetIncome);
    const coverageBase = targetIncome > 0 ? netMonthlyIncome / targetIncome : 0;
    const coverage = Math.min(Math.round(coverageBase * 100), 100);
    const paydayData = buildPaydayCalendar(enriched).map((w) => ({
      ...w,
      amount: Math.round(w.amount * taxMultiplier),
    }));
    const milestones = milestonesProgress(netMonthlyIncome, targetIncome);

    return {
      enriched,
      ...grossMetrics,
      bYield: netYield,
      monthlyIncome: netMonthlyIncome,
      monthlyIncomeGross: grossMetrics.monthlyIncome,
      bYieldGross: grossMetrics.bYield,
      taxRatePct,
      taxEnabled,
      score,
      projData,
      freedomYr,
      coverage,
      paydayData,
      milestones,
    };
  }, [
    targetIncome,
    capital,
    monthly,
    drip,
    years,
    taxEnabled,
    taxRate,
    holdings,
    crash,
    pause,
    getLiveData,
  ]);
}
