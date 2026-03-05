import { createClient } from "@supabase/supabase-js";
import type { Tier } from "@/lib/subscription-config";

const VALID_TIERS: Tier[] = ["free", "pro", "pro_plus"];

function parseTier(value: string | null): Tier {
  if (!value) return "free";
  return VALID_TIERS.includes(value as Tier) ? (value as Tier) : "free";
}

export async function loadTier(userId: string): Promise<Tier> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return "free";

  const supabase = createClient(url, anon);
  const { data } = await supabase
    .from("user_subscriptions")
    .select("tier")
    .eq("user_id", userId)
    .maybeSingle();

  return parseTier(data?.tier ?? null);
}
