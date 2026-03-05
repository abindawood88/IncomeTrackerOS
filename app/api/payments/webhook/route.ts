import { NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments/adapter";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  const provider = getPaymentProvider();
  const parsed = await provider.parseWebhook(req);

  if (!parsed.userId || !parsed.tier) {
    return NextResponse.json({ ok: true });
  }

  const admin = getSupabaseAdmin();
  if (admin) {
    await admin.from("user_subscriptions").upsert({
      user_id: parsed.userId,
      tier: parsed.tier,
      status: parsed.status,
      updated_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({ ok: true });
}
