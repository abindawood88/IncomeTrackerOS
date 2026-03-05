"use client";

import { SUBSCRIPTION_CONFIG, type FeatureKey, type Tier } from "@/lib/subscription-config";
import { useDFPStore } from "@/lib/store";

export function useSubscription() {
  const tier = useDFPStore((s) => s.tier);

  const can = (feature: FeatureKey): boolean => {
    return SUBSCRIPTION_CONFIG[tier].features[feature];
  };

  return {
    tier,
    limits: SUBSCRIPTION_CONFIG[tier],
    can,
  };
}

export function canTierAccessFeature(tier: Tier, feature: FeatureKey): boolean {
  return SUBSCRIPTION_CONFIG[tier].features[feature];
}
