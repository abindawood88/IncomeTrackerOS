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
  const { can } = useSubscription();
  const allowed = can(feature);

  return (
    <div className="relative">
      <div className={allowed ? "" : "pointer-events-none select-none blur-sm"}>{children}</div>
      {!allowed ? (
        <div
          data-testid="feature-gate-overlay"
          className="absolute inset-0 flex items-center justify-center rounded-xl border border-border bg-bg/75"
        >
          <div className="rounded-xl border border-border bg-bg-2 p-4 text-center">
            <p className="text-sm text-textBright">{title} is a premium feature.</p>
            <Link href="/upgrade" className="mt-2 inline-block rounded-lg bg-gold px-3 py-2 text-xs font-semibold text-bg">
              Upgrade now
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
