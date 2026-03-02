import type { OnboardingState, OnboardingStep, UserGoal } from "./types";

// Shared utilities - import from here, never redefine elsewhere

export const STORAGE_KEYS = {
  CACHE: "dfp_cache_v3",
  STORE: "dfp_store_v1",
} as const;

export function normalizeTicker(ticker: string): string {
  return ticker.trim().toUpperCase();
}

export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function clamp(value: number, min: number, max: number, fallback = 0): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, value));
}

export function formatYieldPct(yld: number, decimals = 1): string {
  return `${(yld * 100).toFixed(decimals)}%`;
}

export function formatDollars(amount: number, showCents = false): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(amount);
}

export function isEtfDataStale(lastUpdated: string, staleDays = 30): boolean {
  const updated = new Date(lastUpdated).getTime();
  const now = Date.now();
  return now - updated > staleDays * 24 * 60 * 60 * 1000;
}

export function isOnboardingComplete(state: OnboardingState): boolean {
  return state.completedAt !== null;
}

export function resolveOnboardingStep(goal: UserGoal): OnboardingStep {
  if (!goal.strategy) return "strategy";
  if (!goal.riskTolerance) return "risk";
  if (!goal.targetIncome) return "target";
  if (!goal.hasSetCapital) return "capital";
  if (!goal.preferredTypes.length) return "types";
  return "recommendations";
}
