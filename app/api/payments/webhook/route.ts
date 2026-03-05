import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getPaymentProvider } from "@/lib/payments/adapter";

export async function POST(req: Request) {
  const provider = getPaymentProvider();
  let parsed: Awaited<ReturnType<typeof provider.parseWebhook>>;
  try {
    parsed = await provider.parseWebhook(req);
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Invalid webhook payload" },
      { status: 400 },
    );
  }

  if (!parsed.userId) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ ok: false, error: "Missing Supabase server env" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const { error } = await supabase.from("user_subscriptions").upsert(
    {
      user_id: parsed.userId,
      tier: parsed.tier ?? "free",
      status: parsed.status,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
