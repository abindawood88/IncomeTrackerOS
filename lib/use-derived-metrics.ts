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
import type { DashboardKPIs, DataSource, EnrichedHolding, LiveData, RawHolding } from "./types";
import { clamp, normalizeTicker } from "./utils";
import { computeRequiredMonthlyIncomeFromExpenses } from "./expense-coverage";
import { calculateDashboardKPIs } from "./domain/portfolio/kpis";
import type { ExpenseGoal, GoalMode } from "./types";

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


export function effectiveTargetMonthly(args: {
  goalMode: GoalMode;
  manualTargetMonthly: number;
  expenses: ExpenseGoal[];
  coveragePct: number;
  taxEnabled: boolean;
  taxRate: number;
}): number {
  if (args.goalMode !== "expenses") return args.manualTargetMonthly;
  return computeRequiredMonthlyIncomeFromExpenses({
    goals: args.expenses,
    coveragePct: args.coveragePct,
    taxEnabled: args.taxEnabled,
    taxRate: args.taxRate,
  });
}

export function useDerivedMetrics() {
  const targetIncome = useDFPStore((state) => state.goal.targetIncome);
  const goalMode = useDFPStore((state) => state.goal.goalMode);
  const coveragePct = useDFPStore((state) => state.goal.coveragePct);
  const capital = useDFPStore((state) => state.goal.capital);
  const monthly = useDFPStore((state) => state.goal.monthly);
  const drip = useDFPStore((state) => state.goal.drip);
  const years = useDFPStore((state) => state.goal.years);
  const taxEnabled = useDFPStore((state) => state.goal.taxEnabled);
  const taxRate = useDFPStore((state) => state.goal.taxRate);
  const holdings = useDFPStore((state) => state.holdings);
  const crash = useDFPStore((state) => state.crash);
  const expenseGoals = useDFPStore((state) => state.expenseGoals);
  const pause = useDFPStore((state) => state.pause);
  const { get: getLiveData } = useLiveCache();

  return useMemo(() => {
    const taxRatePct = clamp(taxRate ?? 0, 0, 100);
    const taxMultiplier = taxEnabled ? 1 - taxRatePct / 100 : 1;
    const enriched = enrichHoldings(holdings, getLiveData);
    const targetMonthly = effectiveTargetMonthly({
      goalMode,
      manualTargetMonthly: targetIncome,
      expenses: expenseGoals,
      coveragePct,
      taxEnabled,
      taxRate,
    });
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
    const freedomYr = findFreedomYear(projData, targetMonthly);
    const coverageBase = targetMonthly > 0 ? netMonthlyIncome / targetMonthly : 0;
    const coverage = Math.min(Math.round(coverageBase * 100), 100);
    const paydayData = buildPaydayCalendar(enriched).map((w) => ({
      ...w,
      amount: Math.round(w.amount * taxMultiplier),
    }));
    const milestones = milestonesProgress(netMonthlyIncome, targetMonthly);
    const kpis: DashboardKPIs = calculateDashboardKPIs(
      enriched,
      expenseGoals,
      projData.map((row) => row.monthly),
      targetMonthly,
    );

    return {
      enriched,
      kpis,
      ...grossMetrics,
      bYield: netYield,
      monthlyIncome: netMonthlyIncome,
      monthlyIncomeGross: grossMetrics.monthlyIncome,
      bYieldGross: grossMetrics.bYield,
      taxRatePct,
      taxEnabled,
      score,
      targetMonthly,
      projData,
      freedomYr,
      coverage,
      paydayData,
      milestones,
    };
  }, [
    targetIncome,
    goalMode,
    coveragePct,
    capital,
    monthly,
    drip,
    years,
    taxEnabled,
    taxRate,
    holdings,
    crash,
    pause,
    expenseGoals,
    getLiveData,
  ]);
}
