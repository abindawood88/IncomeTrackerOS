export type SubscriptionTier = "free" | "pro" | "pro_plus";

export type FeatureKey = "csv_import" | "drip_simulator" | "ai_insights" | "supabase_sync";

type TierConfig = {
  holdingsMax: number | null;
  features: Record<FeatureKey, boolean>;
};

export const SUBSCRIPTION_CONFIG: Record<SubscriptionTier, TierConfig> = {
  free: {
    holdingsMax: 3,
    features: {
      csv_import: false,
      drip_simulator: false,
      ai_insights: false,
      supabase_sync: false,
    },
  },
  pro: {
    holdingsMax: null,
    features: {
      csv_import: true,
      drip_simulator: true,
      ai_insights: false,
      supabase_sync: true,
    },
  },
  pro_plus: {
    holdingsMax: null,
    features: {
      csv_import: true,
      drip_simulator: true,
      ai_insights: true,
      supabase_sync: true,
    },
  },
};
