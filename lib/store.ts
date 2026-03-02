"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  ExpenseGoal,
  LiveData,
  OnboardingState,
  OnboardingStep,
  RawHolding,
  UserGoal,
  } from "./types";
import { STORAGE_KEYS, clamp, normalizeTicker } from "./utils";

export interface DFPStore {
  goal: UserGoal;
  setGoal: (patch: Partial<UserGoal>) => void;

  fmpKey: string;
  keyStatus: "idle" | "validating" | "ok" | "error";
  setFmpKey: (key: string) => void;
  setKeyStatus: (status: DFPStore["keyStatus"]) => void;

  holdings: RawHolding[];
  addHolding: (h: Omit<RawHolding, "fetchStatus" | "live">) => void;
  removeHolding: (ticker: string) => void;
  updateHolding: (ticker: string, patch: Partial<RawHolding>) => void;
  applyLiveData: (ticker: string, data: LiveData) => void;
  resetPortfolio: () => void;

  allocs: { ticker: string; w: number }[];
  setAllocs: (allocs: DFPStore["allocs"]) => void;

  crash: number;
  pause: number;
  actualDividends: number[];
  expenseGoals: ExpenseGoal[];
  onboarding: OnboardingState;
  setCrash: (value: number) => void;
  setPause: (value: number) => void;
  setActualDividend: (monthIndex: number, amount: number) => void;
  addExpenseGoal: (label: string, amount: number) => void;
  updateExpenseGoal: (
    id: string,
    patch: Partial<Pick<ExpenseGoal, "label" | "amount">>,
  ) => void;
  removeExpenseGoal: (id: string) => void;
  reorderExpenseGoals: (orderedIds: string[]) => void;
  setOnboardingStep: (step: OnboardingStep) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

const initialGoal: UserGoal = {
  targetIncome: 5000,
  capital: 0,
  hasSetCapital: false,
  monthly: 2000,
  drip: true,
  years: 30,
  strategy: "income",
  riskTolerance: "medium",
  targetPeriod: "monthly",
  taxEnabled: true,
  taxRate: 30,
  preferredTypes: [],
  selectedArchetype: null,
};

const initialOnboarding: OnboardingState = {
  currentStep: "strategy",
  completedAt: null,
};

function makeExpenseGoalId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function sanitizeGoalPatch(patch: Partial<UserGoal>): Partial<UserGoal> {
  const out: Partial<UserGoal> = { ...patch };

  if ("targetIncome" in out) out.targetIncome = clamp(Number(out.targetIncome) || 0, 0, 1_000_000);
  if ("capital" in out) out.capital = clamp(Number(out.capital) || 0, 0, 100_000_000);
  if ("monthly" in out) out.monthly = clamp(Number(out.monthly) || 0, 0, 100_000);
  if ("years" in out) out.years = clamp(Math.round(Number(out.years) || 1), 1, 50, 1);
  if ("taxRate" in out) out.taxRate = clamp(Number(out.taxRate) || 0, 0, 100);
  if ("preferredTypes" in out && Array.isArray(out.preferredTypes)) {
    out.preferredTypes = out.preferredTypes.slice(0, 4);
  }

  return out;
}

export const useDFPStore = create<DFPStore>()(
  persist(
    (set) => ({
      goal: initialGoal,
      setGoal: (patch) =>
        set((state) => ({
          goal: { ...state.goal, ...sanitizeGoalPatch(patch) },
        })),

      fmpKey: "",
      keyStatus: "idle",
      setFmpKey: (key) => set({ fmpKey: key.trim() }),
      setKeyStatus: (status) => set({ keyStatus: status }),

      holdings: [],
      addHolding: (h) =>
        set((state) => {
          const ticker = normalizeTicker(h.ticker);
          const shares = clamp(Number(h.shares) || 0, 0, 1_000_000);
          const avgCost = clamp(Number(h.avgCost) || 0, 0, 100_000);
          const cagrOvr = h.cagrOvr !== null ? clamp(Number(h.cagrOvr) || 0, -1, 10) : null;
          const next: RawHolding = {
            ticker,
            shares,
            avgCost,
            cagrOvr,
            fetchStatus: "idle",
            live: null,
          };

          const idx = state.holdings.findIndex((x) => normalizeTicker(x.ticker) === ticker);
          if (idx >= 0) {
            const updated = [...state.holdings];
            updated[idx] = { ...updated[idx], ...next };
            return { holdings: updated };
          }
          return { holdings: [...state.holdings, next] };
        }),
      removeHolding: (ticker) =>
        set((state) => ({
          holdings: state.holdings.filter(
            (h) => normalizeTicker(h.ticker) !== normalizeTicker(ticker),
          ),
          allocs: state.allocs.filter(
            (a) => normalizeTicker(a.ticker) !== normalizeTicker(ticker),
          ),
        })),
      updateHolding: (ticker, patch) =>
        set((state) => ({
          holdings: state.holdings.map((h) =>
            normalizeTicker(h.ticker) === normalizeTicker(ticker)
              ? {
                  ...h,
                  ...patch,
                  ticker: normalizeTicker(h.ticker),
                  shares:
                    patch.shares !== undefined
                      ? clamp(Number(patch.shares) || 0, 0, 1_000_000)
                      : h.shares,
                  avgCost:
                    patch.avgCost !== undefined
                      ? clamp(Number(patch.avgCost) || 0, 0, 100_000)
                      : h.avgCost,
                  cagrOvr:
                    patch.cagrOvr !== undefined
                      ? patch.cagrOvr === null
                        ? null
                        : clamp(Number(patch.cagrOvr), -1, 10)
                      : h.cagrOvr,
                }
              : h,
          ),
        })),
      applyLiveData: (ticker, data) =>
        set((state) => ({
          holdings: state.holdings.map((h) =>
            normalizeTicker(h.ticker) === normalizeTicker(ticker)
              ? {
                  ...h,
                  live: data,
                  fetchStatus: data.source === "error" ? "error" : "ok",
                }
              : h,
          ),
        })),
      resetPortfolio: () => set({ holdings: [], allocs: [] }),

      allocs: [],
      setAllocs: (allocs) =>
        set({
          allocs: allocs.map((a) => ({ ticker: normalizeTicker(a.ticker), w: a.w })),
        }),

      crash: 0,
      pause: 0,
      actualDividends: new Array(12).fill(0),
      expenseGoals: [],
      onboarding: initialOnboarding,
      setCrash: (value) =>
        set({
          crash: clamp(value, 0, 100),
        }),
      setPause: (value) =>
        set({
          pause: Math.max(0, Math.floor(clamp(value, 0, Number.MAX_SAFE_INTEGER))),
        }),
      setActualDividend: (monthIndex, amount) =>
        set((state) => {
          if (monthIndex < 0 || monthIndex > 11) return state;
          const next = [...state.actualDividends];
          next[monthIndex] = clamp(amount, 0, Number.MAX_SAFE_INTEGER);
          return { actualDividends: next };
        }),
      addExpenseGoal: (label, amount) =>
        set((state) => ({
          expenseGoals:
            state.expenseGoals.length >= 20
              ? state.expenseGoals
              : [
                  ...state.expenseGoals,
                  {
                    id: makeExpenseGoalId(),
                    label: String(label).trim().slice(0, 60),
                    amount: clamp(Number(amount) || 0, 0, 100_000),
                    createdAt: Date.now(),
                  },
                ],
        })),
      updateExpenseGoal: (id, patch) =>
        set((state) => ({
          expenseGoals: state.expenseGoals.map((goal) =>
            goal.id === id
              ? {
                  ...goal,
                  label: "label" in patch ? String(patch.label ?? "").slice(0, 60) : goal.label,
                  amount:
                    "amount" in patch
                      ? clamp(Number(patch.amount) || 0, 0, 100_000)
                      : goal.amount,
                }
              : goal,
          ),
        })),
      removeExpenseGoal: (id) =>
        set((state) => ({
          expenseGoals: state.expenseGoals.filter((goal) => goal.id !== id),
        })),
      reorderExpenseGoals: (orderedIds) =>
        set((state) => {
          const map = new Map(state.expenseGoals.map((goal) => [goal.id, goal]));
          const reordered = orderedIds
            .map((id) => map.get(id))
            .filter((goal): goal is ExpenseGoal => Boolean(goal));
          const remaining = state.expenseGoals.filter((goal) => !orderedIds.includes(goal.id));
          return { expenseGoals: [...reordered, ...remaining] };
        }),
      setOnboardingStep: (step) =>
        set((state) => ({
          onboarding: { ...state.onboarding, currentStep: step },
        })),
      completeOnboarding: () =>
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            currentStep: "complete",
            completedAt: state.onboarding.completedAt ?? Date.now(),
          },
        })),
      resetOnboarding: () =>
        set({
          onboarding: {
            currentStep: "strategy",
            completedAt: null,
          },
        }),
    }),
    {
      name: STORAGE_KEYS.STORE,
      storage: createJSONStorage(() => localStorage),
      merge: (persisted, current) => {
        const incoming = (persisted as Partial<DFPStore>) ?? {};
        return {
          ...current,
          ...incoming,
          goal: {
            ...current.goal,
            ...(incoming.goal ?? {}),
            },
            onboarding: {
              ...initialOnboarding,
              ...(incoming.onboarding ?? {}),
            },
          };
        },
      partialize: (state) => ({
        goal: state.goal,
        fmpKey: state.fmpKey,
        keyStatus: state.keyStatus,
        holdings: state.holdings,
        allocs: state.allocs,
        crash: state.crash,
        pause: state.pause,
        actualDividends: state.actualDividends,
        expenseGoals: state.expenseGoals,
        onboarding: state.onboarding,
      }),
    },
  ),
);
