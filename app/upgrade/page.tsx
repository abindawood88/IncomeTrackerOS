"use client";

import { useState } from "react";

export default function UpgradePage() {
  const [loading, setLoading] = useState<"pro" | "pro_plus" | null>(null);

  async function startCheckout(tier: "pro" | "pro_plus") {
    setLoading(tier);
    const res = await fetch("/api/payments/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier }),
    });
    const data = (await res.json()) as { checkoutUrl?: string };
    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
    }
    setLoading(null);
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <h1 className="text-3xl font-semibold">Upgrade</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border p-4">FREE</div>
        <div className="rounded-xl border border-border p-4">
          <h2 className="font-semibold">PRO $10/month</h2>
          <button data-testid="upgrade-pro" onClick={() => void startCheckout("pro")} className="mt-3 rounded-lg bg-gold px-3 py-2 text-bg">
            {loading === "pro" ? "Loading..." : "Upgrade to Pro"}
          </button>
        </div>
        <div className="rounded-xl border border-border p-4">
          <h2 className="font-semibold">PRO+ $20/month</h2>
          <button data-testid="upgrade-pro-plus" onClick={() => void startCheckout("pro_plus")} className="mt-3 rounded-lg bg-teal px-3 py-2 text-bg">
            {loading === "pro_plus" ? "Loading..." : "Upgrade to Pro+"}
          </button>
        </div>
      </div>
    </main>
  );
}
