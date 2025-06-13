/**
 * Subscription related type definitions
 */

/**
 * Feature usage summary showing daily limits and usage
 */
export interface FeatureUsageSummary {
  feature_name: string;
  used_today: number;
  daily_limit: number;
  remaining: number;
  reset_time?: string;
}

/**
 * Complete subscription summary including tier and feature usage
 */
export interface SubscriptionSummary {
  tier: string;
  status: string;
  is_active: boolean;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  feature_usage: Record<string, FeatureUsageSummary>;
}

/**
 * Feature access response from the API
 */
export interface FeatureAccessResponse {
  feature_name: string;
  has_access: boolean;
  current_tier: string;
  required_tier: string;
}

/**
 * Usage limit response from the API
 */
export interface UsageLimitResponse {
  feature_name: string;
  has_limit: boolean;
  allowed: boolean;
  remaining: number;
  current_tier: string;
  daily_limit: number;
  reset_time?: string;
}

/**
 * Available features response from the API
 */
export interface AvailableFeaturesResponse {
  current_tier: string;
  available_features: string[];
  next_tier: string | null;
  next_tier_features: string[];
}

/**
 * Subscription tiers
 */
export enum SubscriptionTier {
  FREE = 'free',
  PREMIUM = 'premium',
  PRO = 'pro',
}

/**
 * Subscription status
 */
export enum SubscriptionStatus {
  NONE = 'none',
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  UNPAID = 'unpaid',
}

/**
 * Feature names mapping
 */
export const FEATURE_NAMES: Record<string, string> = {
  ask_questions: 'Ask AI Questions',
  journal_entries: 'Journal Entries',
  quest_daily: 'Daily Quests',
  forum_threads: 'Forum Threads',
  forum_comments: 'Forum Comments',
  forum_votes: 'Forum Votes',
  insight_expansion: 'Insight Expansions',
  save_to_journal: 'Save to Journal',
  concept_tagging: 'Concept Tagging',
  media_attachments: 'Media Attachments',
};

/**
 * Tier names for display
 */
export const TIER_NAMES: Record<string, string> = {
  free: 'Free',
  premium: 'Premium',
  pro: 'Pro',
};
