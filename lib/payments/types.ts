export type Tier = "free" | "pro" | "pro_plus";

export type CheckoutSession = {
  checkoutUrl: string;
};

export type WebhookResult = {
  ok: boolean;
};
