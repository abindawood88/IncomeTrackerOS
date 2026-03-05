import { mockProvider } from "@/lib/payments/providers/mockProvider";
import type { PaymentProvider } from "@/lib/payments/types";

export function getPaymentProvider(): PaymentProvider {
  return mockProvider;
}
