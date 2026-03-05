"use client";

import Link from "next/link";
import { useSubscription } from "@/lib/use-subscription";
import type { FeatureKey } from "@/lib/subscription-config";

export default function FeatureGate({
  feature,
  title,
  children,
}: {
  feature: FeatureKey;
  title: string;
  children: React.ReactNode;
}) {
  const { can, tier } = useSubscription();
  const allowed = can(feature);

  return (
    <div className="relative" data-testid={`feature-gate-${feature}`}>
      <div className={allowed ? "" : "pointer-events-none select-none blur-[2px]"}>{children}</div>
      {allowed ? null : (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl border border-border bg-bg/70 p-4 text-center backdrop-blur-sm">
          <div>
            <p className="text-sm font-semibold text-textBright">{title} is locked on {tier.toUpperCase()}</p>
            <Link href="/upgrade" className="mt-2 inline-block rounded-lg bg-gold px-3 py-2 text-xs font-semibold text-bg">
              Upgrade to continue
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
