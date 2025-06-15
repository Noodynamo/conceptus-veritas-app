import { SubscriptionTier } from '../../entities/subscription/SubscriptionTier';

/**
 * Repository interface for subscription-related operations.
 * This interface defines the contract for data access related to subscriptions.
 */
export interface SubscriptionRepository {
  /**
   * Gets the subscription tier for a specific user.
   * @param userId The ID of the user
   * @returns A Promise resolving to the user's subscription tier
   */
  getUserSubscription(userId: string): Promise<SubscriptionTier>;

  /**
   * Gets all available subscription tiers.
   * @returns A Promise resolving to an array of all subscription tiers
   */
  getAllTiers(): Promise<SubscriptionTier[]>;

  /**
   * Upgrades a user to a different subscription tier.
   * @param userId The ID of the user
   * @param tierId The ID of the new tier
   * @returns A Promise resolving to a boolean indicating success
   */
  upgradeTier(userId: string, tierId: string): Promise<boolean>;

  /**
   * Downgrades a user to a different subscription tier.
   * @param userId The ID of the user
   * @param tierId The ID of the new tier
   * @returns A Promise resolving to a boolean indicating success
   */
  downgradeTier(userId: string, tierId: string): Promise<boolean>;

  /**
   * Checks if a user has access to a specific feature.
   * @param userId The ID of the user
   * @param featureId The ID of the feature to check
   * @returns A Promise resolving to a boolean indicating if the user has access
   */
  hasFeatureAccess(userId: string, featureId: string): Promise<boolean>;

  /**
   * Gets the usage limit for a specific feature for a user.
   * @param userId The ID of the user
   * @param featureId The ID of the feature
   * @returns A Promise resolving to the usage limit (or undefined if unlimited)
   */
  getFeatureUsageLimit(userId: string, featureId: string): Promise<number | undefined>;

  /**
   * Gets the current usage of a specific feature for a user.
   * @param userId The ID of the user
   * @param featureId The ID of the feature
   * @returns A Promise resolving to the current usage
   */
  getFeatureCurrentUsage(userId: string, featureId: string): Promise<number>;

  /**
   * Increments the usage counter for a specific feature for a user.
   * @param userId The ID of the user
   * @param featureId The ID of the feature
   * @param amount The amount to increment (default: 1)
   * @returns A Promise resolving to the new usage count
   */
  incrementFeatureUsage(userId: string, featureId: string, amount?: number): Promise<number>;
}
