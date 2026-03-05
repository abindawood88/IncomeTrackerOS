"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { loadTier } from "@/lib/subscription/loadTier";
import { useDFPStore } from "@/lib/store";
import type { Tier } from "@/lib/subscription-config";

function parseTier(value: string | null): Tier {
  if (value === "pro" || value === "pro_plus" || value === "free") return value;
  return "free";
}

export default function UpgradeSuccessPage() {
  const { userId } = useAuth();
  const setTier = useDFPStore((s) => s.setTier);

  useEffect(() => {
    const tier = parseTier(new URLSearchParams(window.location.search).get("tier"));
    setTier(tier);
  }, [setTier]);

  return (
    <main className="mx-auto max-w-xl space-y-3 p-6" data-testid="upgrade-success">
      <h1 className="text-2xl font-semibold text-textBright">Upgrade successful</h1>
      <p className="text-textDim">Your plan has been updated. Refresh dashboard data if needed.</p>
      <button
        type="button"
        className="rounded-lg border border-border px-3 py-2 text-sm text-textBright"
        onClick={async () => {
          if (!userId) return;
          const tier = await loadTier(userId);
          setTier(tier);
        }}
      >
        Refresh Tier
      </button>
    </main>
  );
}
