"use client";

import { supabaseClient } from "@/lib/db";
import { useDFPStore } from "@/lib/store";
import type { SubscriptionTier } from "@/lib/subscription-config";

export async function loadTier(userId: string): Promise<void> {
  if (!supabaseClient) return;
  const { data } = await supabaseClient
    .from("user_subscriptions")
    .select("tier,status")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) return;

  const tier = (data.tier as SubscriptionTier | null) ?? "free";
  useDFPStore.getState().setSubscriptionTier(tier);
  useDFPStore.getState().setSubscriptionStatus(
    (data.status as "active" | "canceled" | "past_due" | "trialing" | "unknown" | null) ?? "unknown",
  );
}
