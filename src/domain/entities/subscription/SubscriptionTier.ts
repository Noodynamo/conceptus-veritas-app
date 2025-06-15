/**
 * Represents the subscription tier types available in the application.
 */
export enum TierType {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
  PRO = 'PRO',
}

/**
 * Represents a feature within a subscription tier.
 */
export interface SubscriptionFeature {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  usageLimit?: number;
}

/**
 * Represents a subscription tier with its features and pricing.
 */
export interface SubscriptionTier {
  id: string;
  type: TierType;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  features: SubscriptionFeature[];
}
