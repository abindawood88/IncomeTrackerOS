"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { supabaseClient } from "@/lib/db";
import { useDFPStore } from "@/lib/store";
import { SUBSCRIPTION_CONFIG } from "@/lib/subscription-config";
import type { DFPStore } from "@/lib/store";
import { canTierAccessFeature } from "@/lib/use-subscription";

const DEBOUNCE_MS = 1500;

type SyncedState = {
  goalPayload: { goal: DFPStore["goal"]; actualDividends: DFPStore["actualDividends"] };
  holdings: Map<string, { user_id: string; ticker: string; shares: number; avg_cost: number; cagr_ovr: number | null }>;
  allocs: Map<string, { user_id: string; ticker: string; weight: number }>;
  expenseGoals: Map<string, {
    user_id: string;
    id: string;
    name: string;
    amount_monthly: number;
    enabled_for_goal: boolean;
    created_at: number;
  }>;
};

function snapshotState(userId: string, state: DFPStore): SyncedState {
  return {
    goalPayload: {
      goal: state.goal,
      actualDividends: state.actualDividends,
    },
    holdings: new Map(
      state.holdings.map((h) => [
        h.ticker,
        {
          user_id: userId,
          ticker: h.ticker,
          shares: h.shares,
          avg_cost: h.avgCost,
          cagr_ovr: h.cagrOvr,
        },
      ]),
    ),
    allocs: new Map(
      state.allocs.map((a) => [
        a.ticker,
        {
          user_id: userId,
          ticker: a.ticker,
          weight: a.w,
        },
      ]),
    ),
    expenseGoals: new Map(
      state.expenseGoals.map((goal) => [
        goal.id,
        {
          user_id: userId,
          id: goal.id,
          name: goal.name,
          amount_monthly: goal.amountMonthly,
          enabled_for_goal: goal.enabledForGoal,
          created_at: goal.createdAt,
        },
      ]),
    ),
  };
}

function hasRowChanges<T>(previous: T | undefined, next: T): boolean {
  if (!previous) return true;
  return JSON.stringify(previous) !== JSON.stringify(next);
}

export async function loadFromSupabase(userId: string): Promise<void> {
  if (!userId || !supabaseClient) return;
  const client = supabaseClient;
  const [goalRes, holdingsRes, allocsRes, expenseRes] = await Promise.all([
    client.from("user_goals").select("payload").eq("user_id", userId).maybeSingle(),
    client.from("holdings").select("ticker,shares,avg_cost,cagr_ovr").eq("user_id", userId),
    client.from("allocations").select("ticker,weight").eq("user_id", userId),
    client.from("expense_goals").select("id,name,amount_monthly,enabled_for_goal,created_at").eq("user_id", userId),
  ]);

  if (goalRes.data?.payload) {
    const payload = goalRes.data.payload as { goal?: DFPStore["goal"]; actualDividends?: number[] };
    if (payload.goal) {
      useDFPStore.getState().setGoal(payload.goal);
    } else {
      useDFPStore.getState().setGoal(goalRes.data.payload as DFPStore["goal"]);
    }
    if (Array.isArray(payload.actualDividends) && payload.actualDividends.length === 12) {
      useDFPStore.setState({ actualDividends: payload.actualDividends.map((v) => Number(v) || 0) });
    }
  }
  if (holdingsRes.data) {
    useDFPStore.setState({
      holdings: holdingsRes.data.map((row) => ({
        ticker: row.ticker,
        shares: Number(row.shares ?? 0),
        avgCost: Number(row.avg_cost ?? 0),
        cagrOvr: row.cagr_ovr === null ? null : Number(row.cagr_ovr),
        fetchStatus: "idle",
        live: null,
      })),
    });
  }
  if (allocsRes.data) {
    useDFPStore.setState({
      allocs: allocsRes.data.map((row) => ({
        ticker: row.ticker,
        w: Number(row.weight ?? 0),
      })),
    });
  }
  if (expenseRes.data) {
    useDFPStore.setState({
      expenseGoals: expenseRes.data.map((row) => ({
        id: row.id,
        name: row.name,
        amountMonthly: Number(row.amount_monthly ?? 0),
        enabledForGoal: Boolean(row.enabled_for_goal ?? true),
        createdAt: Number(row.created_at ?? Date.now()),
      })),
    });
  }
}

export function useSync(): void {
  const { userId } = useAuth();
  const tier = useDFPStore((s) => s.tier);
  const loadedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncedRef = useRef<SyncedState | null>(null);
  const syncChainRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    const tier = useDFPStore.getState().subscriptionTier;
    if (!SUBSCRIPTION_CONFIG[tier].features.supabase_sync) return;
    if (!userId || !supabaseClient || loadedRef.current) return;
    if (!canTierAccessFeature(tier, "supabase_sync")) {
      useDFPStore.getState().setSyncStatus("idle");
      return;
    }
    const client = supabaseClient;

    const hydrate = async () => {
      useDFPStore.getState().setSyncStatus("syncing");
      await loadFromSupabase(userId);
      syncedRef.current = snapshotState(userId, useDFPStore.getState());
      loadedRef.current = true;
      useDFPStore.getState().setSyncStatus("synced");
    };

    void hydrate().catch(() => {
      useDFPStore.getState().setSyncStatus("error");
    });
  }, [tier, userId]);

  useEffect(() => {
    const tier = useDFPStore.getState().subscriptionTier;
    if (!SUBSCRIPTION_CONFIG[tier].features.supabase_sync) return;
    if (!userId || !supabaseClient) return;
    if (!canTierAccessFeature(tier, "supabase_sync")) return;
    const client = supabaseClient;

    const persist = async (state: DFPStore) => {
      const previous = syncedRef.current;
      const next = snapshotState(userId, state);

      const operations: PromiseLike<unknown>[] = [];

      if (!previous || hasRowChanges(previous.goalPayload, next.goalPayload)) {
        operations.push(client.from("user_goals").upsert({ user_id: userId, payload: next.goalPayload }));
      }

      const holdingsToUpsert = [...next.holdings.values()].filter((row) =>
        hasRowChanges(previous?.holdings.get(row.ticker), row),
      );
      const holdingsToDelete = previous
        ? [...previous.holdings.keys()].filter((ticker) => !next.holdings.has(ticker))
        : [];

      if (holdingsToUpsert.length > 0) {
        operations.push(client.from("holdings").upsert(holdingsToUpsert));
      }
      if (holdingsToDelete.length > 0) {
        operations.push(client.from("holdings").delete().eq("user_id", userId).in("ticker", holdingsToDelete));
      }

      const allocsToUpsert = [...next.allocs.values()].filter((row) =>
        hasRowChanges(previous?.allocs.get(row.ticker), row),
      );
      const allocsToDelete = previous
        ? [...previous.allocs.keys()].filter((ticker) => !next.allocs.has(ticker))
        : [];

      if (allocsToUpsert.length > 0) {
        operations.push(client.from("allocations").upsert(allocsToUpsert));
      }
      if (allocsToDelete.length > 0) {
        operations.push(client.from("allocations").delete().eq("user_id", userId).in("ticker", allocsToDelete));
      }

      const expenseGoalsToUpsert = [...next.expenseGoals.values()].filter((row) =>
        hasRowChanges(previous?.expenseGoals.get(row.id), row),
      );
      const expenseGoalsToDelete = previous
        ? [...previous.expenseGoals.keys()].filter((id) => !next.expenseGoals.has(id))
        : [];

      if (expenseGoalsToUpsert.length > 0) {
        operations.push(client.from("expense_goals").upsert(expenseGoalsToUpsert));
      }
      if (expenseGoalsToDelete.length > 0) {
        operations.push(client.from("expense_goals").delete().eq("user_id", userId).in("id", expenseGoalsToDelete));
      }

      if (operations.length === 0) return;

      await Promise.all(operations);
      syncedRef.current = next;
      useDFPStore.getState().setSyncStatus("synced");
    };

    const unsub = useDFPStore.subscribe((state) => {
      if (!loadedRef.current) return;
      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        useDFPStore.getState().setSyncStatus("syncing");
        syncChainRef.current = syncChainRef.current
          .then(async () => {
            await persist(state);
            useDFPStore.getState().setSyncStatus("synced");
          })
          .catch(() => {
            useDFPStore.getState().setSyncStatus("error");
          });
      }, DEBOUNCE_MS);
    });

    return () => {
      unsub();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [tier, userId]);
}
