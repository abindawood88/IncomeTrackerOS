import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments/adapter";
import type { Tier } from "@/lib/subscription-config";

function parseTier(value: unknown): Tier | null {
  return value === "pro" || value === "pro_plus" ? value : null;
}

async function getAuthenticatedUserIdIfAvailable(): Promise<string | null> {
  const hasClerk = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
  );
  if (!hasClerk) return null;

  try {
    const { userId } = await auth();
    return userId ?? null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const userId = await getAuthenticatedUserIdIfAvailable();
  const body = (await req.json().catch(() => ({}))) as { tier?: string; userId?: string };
  const tier = parseTier(body.tier);

  if (!tier) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }

  const effectiveUserId = userId ?? body.userId ?? null;
  if (!effectiveUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://127.0.0.1:3000";
  const provider = getPaymentProvider();
  const session = await provider.createCheckoutSession({
    userId: effectiveUserId,
    tier,
    successUrl: `${baseUrl}/upgrade/success`,
    cancelUrl: `${baseUrl}/upgrade/cancel`,
  });

  return NextResponse.json(session);
}
