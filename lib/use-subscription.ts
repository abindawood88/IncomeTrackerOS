"use client";

import { useMemo } from "react";
import { useDFPStore } from "@/lib/store";
import { SUBSCRIPTION_CONFIG, type FeatureKey } from "@/lib/subscription-config";

export function useSubscription() {
  const tier = useDFPStore((s) => s.subscriptionTier);

  return useMemo(() => {
    const config = SUBSCRIPTION_CONFIG[tier];
    return {
      tier,
      limits: {
        holdingsMax: config.holdingsMax,
      },
      can: (feature: FeatureKey) => config.features[feature],
    };
  }, [tier]);
}
