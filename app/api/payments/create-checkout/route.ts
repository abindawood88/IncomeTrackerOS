import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments/adapter";
import type { Tier } from "@/lib/payments/types";

const validTiers: Tier[] = ["pro", "pro_plus"];

export async function POST(req: Request) {
  const { userId } = await auth();
  const body = (await req.json().catch(() => ({}))) as { tier?: Tier };

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!body.tier || !validTiers.includes(body.tier)) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }

  const provider = getPaymentProvider();
  const origin = new URL(req.url).origin;
  const session = await provider.createCheckoutSession({
    userId,
    tier: body.tier,
    successUrl: `${origin}/upgrade/success`,
    cancelUrl: `${origin}/upgrade/cancel`,
  });

  return NextResponse.json(session);
}
