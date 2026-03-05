import type { PaymentProvider } from "@/lib/payments/types";
import type { Tier } from "@/lib/subscription-config";

function parseTier(value: unknown): Tier | null {
  if (value === "pro" || value === "pro_plus" || value === "free") return value;
  return null;
}

export const mockProvider: PaymentProvider = {
  async createCheckoutSession({ tier, successUrl }) {
    const url = new URL(successUrl);
    url.searchParams.set("tier", tier);
    return { checkoutUrl: url.toString() };
  },

  async parseWebhook(request) {
    const body = (await request.json().catch(() => ({}))) as {
      eventType?: string;
      userId?: string;
      tier?: string;
      status?: "active" | "canceled" | "past_due" | "trialing" | "unknown";
    };

    return {
      eventType: body.eventType ?? "mock.subscription.updated",
      userId: body.userId ?? null,
      tier: parseTier(body.tier ?? null),
      status: body.status ?? "unknown",
    };
  },
};
