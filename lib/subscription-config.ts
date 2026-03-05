export type Tier = "free" | "pro" | "pro_plus";

export type FeatureKey =
  | "csv_import"
  | "drip_simulator"
  | "ai_insights"
  | "supabase_sync";

export interface TierConfig {
  holdingsMax: number;
  features: Record<FeatureKey, boolean>;
}

export const SUBSCRIPTION_CONFIG: Record<Tier, TierConfig> = {
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
    holdingsMax: Number.POSITIVE_INFINITY,
    features: {
      csv_import: true,
      drip_simulator: true,
      ai_insights: false,
      supabase_sync: true,
    },
  },
  pro_plus: {
    holdingsMax: Number.POSITIVE_INFINITY,
    features: {
      csv_import: true,
      drip_simulator: true,
      ai_insights: true,
      supabase_sync: true,
    },
  },
};
