import type { PaymentProvider, WebhookPayload } from "@/lib/payments/adapter";

export const mockPaymentProvider: PaymentProvider = {
  async createCheckoutSession({ tier, successUrl }): Promise<{ checkoutUrl: string }> {
    return { checkoutUrl: `${successUrl}?tier=${tier}` };
  },

  async parseWebhook(request: Request): Promise<WebhookPayload> {
    const body = (await request.json().catch(() => ({}))) as {
      eventType?: string;
      userId?: string;
      tier?: "free" | "pro" | "pro_plus";
      status?: "active" | "canceled" | "past_due" | "trialing" | "unknown";
    };

    return {
      eventType: body.eventType ?? "unknown",
      userId: body.userId ?? null,
      tier: body.tier ?? null,
      status: body.status ?? "unknown",
    };
  },
};
