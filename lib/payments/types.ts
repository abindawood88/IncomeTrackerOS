import type { Tier } from "@/lib/subscription-config";

export type PaymentStatus = "active" | "canceled" | "past_due" | "trialing" | "unknown";

export type CheckoutSession = {
  checkoutUrl: string;
};

export type WebhookResult = { ok: boolean };

export interface PaymentProvider {
  createCheckoutSession(args: {
    userId: string;
    tier: Tier;
    successUrl: string;
    cancelUrl: string;
  }): Promise<CheckoutSession>;
  parseWebhook(
    request: Request
  ): Promise<{ eventType: string; userId: string | null; tier: Tier | null; status: PaymentStatus }>;
}
