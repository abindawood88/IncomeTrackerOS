import { mockPaymentProvider } from "@/lib/payments/providers/mockProvider";
import type { CheckoutSession, Tier } from "@/lib/payments/types";

export type WebhookPayload = {
  eventType: string;
  userId: string | null;
  tier: Tier | null;
  status: "active" | "canceled" | "past_due" | "trialing" | "unknown";
};

export interface PaymentProvider {
  createCheckoutSession(args: {
    userId: string;
    tier: Tier;
    successUrl: string;
    cancelUrl: string;
  }): Promise<CheckoutSession>;
  parseWebhook(request: Request): Promise<WebhookPayload>;
}

export function getPaymentProvider(): PaymentProvider {
  return mockPaymentProvider;
}
