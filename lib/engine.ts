import type {
  BlendedMetrics,
  CacheEntry,
  EnrichedHolding,
  HealthStatus,
  MilestoneResult,
  PaydayWeek,
  ProjectionParams,
  ProjectionRow,
} from "./types";

export type {
  AppState,
  BlendedMetrics,
  CacheEntry,
  DataSource,
  EnrichedHolding,
  ETFRecord,
  FetchStatus,
  HealthStatus,
  LiveData,
  MilestoneResult,
  MilestoneTier,
  PayFrequency,
  ProjectionParams,
  ProjectionRow,
  RawHolding,
  Strategy,
  StrategyConfig,
  UserGoal,
} from "./types";

import * as _engine from "../src/engine.js";

const REQUIRED_ENGINE_EXPORTS = [
  "getHealth",
  "project",
  "blendedMetrics",
  "riskScore",
  "findFreedomYear",
  "buildPaydayCalendar",
  "sparklineTrend",
  "milestonesProgress",
  "isCacheValid",
  "makeCacheEntry",
] as const;

for (const fn of REQUIRED_ENGINE_EXPORTS) {
  if (typeof (_engine as Record<string, unknown>)[fn] !== "function") {
    throw new Error(
      `[engine.ts] engine.js is missing expected export: "${fn}". Check the build output at ../src/engine.js.`,
    );
  }
}

export const getHealth = _engine.getHealth as (
  yld: number,
  cagr: number | null,
) => HealthStatus;

export const project = _engine.project as (
  params: ProjectionParams,
) => ProjectionRow[];

export const blendedMetrics = _engine.blendedMetrics as (
  holdings: EnrichedHolding[],
) => BlendedMetrics;

export const riskScore = _engine.riskScore as (
  holdings: EnrichedHolding[],
) => number;

export const findFreedomYear = _engine.findFreedomYear as (
  rows: ProjectionRow[],
  target: number,
) => number | null;

export const buildPaydayCalendar = _engine.buildPaydayCalendar as (
  holdings: EnrichedHolding[],
) => PaydayWeek[];

export const sparklineTrend = _engine.sparklineTrend as (
  prices: number[],
) => "up" | "down" | "flat";

export const milestonesProgress = _engine.milestonesProgress as (
  income: number,
  target: number,
) => MilestoneResult[];

export const isCacheValid = _engine.isCacheValid as (
  entry: CacheEntry | null,
  now?: number,
) => boolean;

export const makeCacheEntry = _engine.makeCacheEntry as <T>(
  data: T,
  now?: number,
) => CacheEntry<T>;
