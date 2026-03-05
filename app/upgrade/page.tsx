"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

async function startCheckout(tier: "pro" | "pro_plus") {
  const res = await fetch("/api/payments/create-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tier }),
  });

  if (!res.ok) {
    throw new Error("Failed to create checkout session");
  }

  const data = (await res.json()) as { checkoutUrl: string };
  return data.checkoutUrl;
}

export default function UpgradePage() {
  const router = useRouter();
  const [loading, setLoading] = useState<"pro" | "pro_plus" | null>(null);

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6" data-testid="upgrade-page">
      <h1 className="text-3xl font-semibold text-textBright">Upgrade your plan</h1>
      <p className="text-textDim">Choose the tier that unlocks the features you need.</p>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-border bg-bg-2 p-5">
          <h2 className="text-xl font-semibold text-textBright">Pro</h2>
          <p className="mt-1 text-sm text-textDim">CSV import, DRIP simulator, and cloud sync.</p>
          <button
            type="button"
            data-testid="upgrade-pro"
            className="mt-4 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-bg"
            disabled={Boolean(loading)}
            onClick={async () => {
              try {
                setLoading("pro");
                const checkoutUrl = await startCheckout("pro");
                router.push(checkoutUrl);
              } finally {
                setLoading(null);
              }
            }}
          >
            Upgrade to Pro
          </button>
        </section>

        <section className="rounded-2xl border border-border bg-bg-2 p-5">
          <h2 className="text-xl font-semibold text-textBright">Pro+</h2>
          <p className="mt-1 text-sm text-textDim">Everything in Pro plus AI insights.</p>
          <button
            type="button"
            data-testid="upgrade-pro-plus"
            className="mt-4 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-bg"
            disabled={Boolean(loading)}
            onClick={async () => {
              try {
                setLoading("pro_plus");
                const checkoutUrl = await startCheckout("pro_plus");
                router.push(checkoutUrl);
              } finally {
                setLoading(null);
              }
            }}
          >
            Upgrade to Pro+
          </button>
        </section>
      </div>
    </main>
  );
}
