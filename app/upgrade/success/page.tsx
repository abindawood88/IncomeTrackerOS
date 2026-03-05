"use client";

import { useAuth } from "@clerk/nextjs";
import { loadTier } from "@/lib/subscription/loadTier";

export default function UpgradeSuccessPage() {
  const { userId } = useAuth();

  async function refreshTier() {
    if (!userId) return;
    await loadTier(userId);
  }

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-6 text-center">
      <h1 className="text-3xl font-semibold">Payment successful</h1>
      <p className="text-textDim">Your plan is being activated.</p>
      <button data-testid="refresh-tier" onClick={() => void refreshTier()} className="rounded-lg border border-border px-3 py-2">
        Refresh tier
      </button>
    </main>
  );
}
