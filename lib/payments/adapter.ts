import { stripeProvider } from "@/lib/payments/providers/stripeProvider";
import { mockProvider } from "@/lib/payments/providers/mockProvider";
import type { PaymentProvider } from "@/lib/payments/types";

export function getPaymentProvider(): PaymentProvider {
  const hasStripe = Boolean(process.env.STRIPE_SECRET_KEY);
  return hasStripe ? stripeProvider : mockProvider;
}
