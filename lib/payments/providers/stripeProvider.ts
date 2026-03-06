import type { PaymentProvider, PaymentStatus } from "@/lib/payments/types";
import type { Tier } from "@/lib/subscription-config";

type StripeLike = {
  checkout: {
    sessions: {
      create: (input: Record<string, unknown>) => Promise<{ url?: string | null }>;
    };
  };
  webhooks: {
    constructEvent: (body: string, signature: string, secret: string) => StripeEvent;
  };
};

type StripeEvent = {
  type: string;
  data: {
    object: {
      items?: { data?: Array<{ price?: { id?: string | null } | null }> };
      metadata?: { userId?: string };
      status?: string;
    };
  };
};

function getStripe(): StripeLike {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");

  const nodeRequire = eval("require") as (id: string) => unknown;
  const StripeCtor = nodeRequire("stripe") as new (
    apiKey: string,
    options: { apiVersion: string }
  ) => StripeLike;

  return new StripeCtor(key, { apiVersion: "2024-06-20" });
}

function parseTier(priceId: string | null | undefined): Tier | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return "pro";
  if (priceId === process.env.STRIPE_PRO_PLUS_PRICE_ID) return "pro_plus";
  return null;
}

function parseStatus(status: string | undefined): PaymentStatus {
  if (!status) return "unknown";
  const map: Record<string, PaymentStatus> = {
    active: "active",
    canceled: "canceled",
    past_due: "past_due",
    trialing: "trialing",
    incomplete: "unknown",
    incomplete_expired: "unknown",
    paused: "unknown",
    unpaid: "past_due",
  };
  return map[status] ?? "unknown";
}

export const stripeProvider: PaymentProvider = {
  async createCheckoutSession({ userId, tier, successUrl, cancelUrl }) {
    const stripe = getStripe();
    const priceId =
      tier === "pro"
        ? process.env.STRIPE_PRO_PRICE_ID
        : process.env.STRIPE_PRO_PLUS_PRICE_ID;

    if (!priceId) throw new Error(`Price ID not configured for tier: ${tier}`);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { userId, tier },
      client_reference_id: userId,
    });

    if (!session.url) throw new Error("Stripe did not return a checkout URL");
    return { checkoutUrl: session.url };
  },

  async parseWebhook(request) {
    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");

    const body = await request.text();
    const sig = request.headers.get("stripe-signature") ?? "";

    let event: StripeEvent;
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch {
      throw new Error("Invalid Stripe webhook signature");
    }

    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.deleted"
    ) {
      const sub = event.data.object;
      const priceId = sub.items?.data?.[0]?.price?.id ?? null;
      const userId = (sub.metadata?.userId as string | undefined) ?? null;
      return {
        eventType: event.type,
        userId,
        tier: parseTier(priceId),
        status: parseStatus(sub.status),
      };
    }

    return { eventType: event.type, userId: null, tier: null, status: "unknown" };
  },
};
