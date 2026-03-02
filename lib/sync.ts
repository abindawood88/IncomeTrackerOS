"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { supabaseClient } from "@/lib/db";
import { useDFPStore } from "@/lib/store";

const DEBOUNCE_MS = 1500;

export function useSync(): void {
  const { userId } = useAuth();
  const loadedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!userId || !supabaseClient || loadedRef.current) return;
    const client = supabaseClient;

    const hydrate = async () => {
      const [goalRes, holdingsRes, allocsRes, expenseRes] = await Promise.all([
        client.from("user_goals").select("payload").eq("user_id", userId).maybeSingle(),
        client.from("holdings").select("ticker,shares,avg_cost,cagr_ovr").eq("user_id", userId),
        client.from("allocations").select("ticker,weight").eq("user_id", userId),
        client.from("expense_goals").select("id,name,amount_monthly,enabled_for_goal,created_at").eq("user_id", userId),
      ]);

      if (goalRes.data?.payload) {
        useDFPStore.getState().setGoal(goalRes.data.payload);
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

      loadedRef.current = true;
    };

    void hydrate();
  }, [userId]);

  useEffect(() => {
    if (!userId || !supabaseClient) return;
    const client = supabaseClient;

    const unsub = useDFPStore.subscribe((state) => {
      if (!loadedRef.current) return;
      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(async () => {
        await Promise.all([
          client.from("user_goals").upsert({ user_id: userId, payload: state.goal }),
          client.from("holdings").delete().eq("user_id", userId),
          client.from("allocations").delete().eq("user_id", userId),
          client.from("expense_goals").delete().eq("user_id", userId),
        ]);

        await Promise.all([
          state.holdings.length
            ? client.from("holdings").upsert(
                state.holdings.map((h) => ({
                  user_id: userId,
                  ticker: h.ticker,
                  shares: h.shares,
                  avg_cost: h.avgCost,
                  cagr_ovr: h.cagrOvr,
                })),
              )
            : Promise.resolve(),
          state.allocs.length
            ? client.from("allocations").upsert(
                state.allocs.map((a) => ({
                  user_id: userId,
                  ticker: a.ticker,
                  weight: a.w,
                })),
              )
            : Promise.resolve(),
          state.expenseGoals.length
            ? client.from("expense_goals").upsert(
                state.expenseGoals.map((goal) => ({
                  user_id: userId,
                  id: goal.id,
                  name: goal.name,
                  amount_monthly: goal.amountMonthly,
                  enabled_for_goal: goal.enabledForGoal,
                  created_at: goal.createdAt,
                })),
              )
            : Promise.resolve(),
        ]);
      }, DEBOUNCE_MS);
    });

    return () => {
      unsub();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [userId]);
}
