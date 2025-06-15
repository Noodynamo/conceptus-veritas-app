/**
 * Subscription Hook
 *
 * This hook provides access to subscription-related functionality in React components.
 */

import { useState, useEffect, useCallback, useContext } from 'react';
import {
  TierType,
  PlatformType,
  BillingCycle,
  SubscriptionTier,
  getTierById,
} from '../models/subscription/tiers';
import { Feature } from '../models/subscription/features';
import { UserSubscription } from '../services/subscription/subscription-service';
import { AuthContext } from '../contexts/AuthContext'; // Assuming you have an auth context

/**
 * Interface for the subscription hook return value
 */
interface UseSubscriptionReturn {
  // Current subscription state
  currentTier: SubscriptionTier;
  isLoading: boolean;
  error: Error | null;

  // Feature access methods
  canUseFeature: (featureId: string) => boolean;
  getFeatureLimit: (featureId: string) => number | 'unlimited';
  getFeatureUsage: (featureId: string) => number;
  hasReachedLimit: (featureId: string) => boolean;

  // Upgrade/downgrade methods
  getUpgradeSuggestions: (featureId: string) => SubscriptionTier[];
  upgradeTier: (newTierId: TierType) => Promise<boolean>;
  downgradeTier: (newTierId: TierType) => Promise<boolean>;

  // Trial/subscription methods
  startTrial: (tierId: TierType) => Promise<boolean>;
  cancelSubscription: () => Promise<boolean>;

  // Pricing methods
  getPrice: (tierId: TierType, platform: PlatformType, billingCycle: BillingCycle) => number;
}

/**
 * Hook for accessing subscription functionality
 */
export function useSubscription(): UseSubscriptionReturn {
  // Get current user from auth context
  const { currentUser } = useContext(AuthContext);

  // State for subscription data
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>(getTierById(TierType.FREE)!);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [featureUsage, setFeatureUsage] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Load subscription data
  useEffect(() => {
    if (!currentUser) {
      // If no user is logged in, use FREE tier
      setCurrentTier(getTierById(TierType.FREE)!);
      setIsLoading(false);
      return;
    }

    async function loadSubscriptionData() {
      try {
        setIsLoading(true);

        // TODO: Replace with actual API calls
        // Mock API call to get user subscription
        const userSubscription: UserSubscription = {
          userId: currentUser.id,
          tierId: TierType.FREE, // Default to free tier
          platform: PlatformType.MOBILE,
          billingCycle: BillingCycle.MONTHLY,
          startDate: new Date(),
          endDate: null,
          autoRenew: true,
          isInTrial: false,
        };

        // Get tier details
        const tier = getTierById(userSubscription.tierId);
        if (tier) {
          setCurrentTier(tier);
        }

        setSubscription(userSubscription);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load subscription data'));
        setIsLoading(false);
      }
    }

    loadSubscriptionData();
  }, [currentUser]);

  // Load feature usage data
  useEffect(() => {
    if (!currentUser) {
      return;
    }

    async function loadFeatureUsageData() {
      try {
        // TODO: Replace with actual API call
        // Mock API call to get feature usage
        const mockFeatureUsage: Record<string, number> = {
          // Example usage data
          dailyQuestions: 3,
          saveToJournal: 1,
          journalEntries: 2,
        };

        setFeatureUsage(mockFeatureUsage);
      } catch (err) {
        console.error('Failed to load feature usage data', err);
      }
    }

    loadFeatureUsageData();
  }, [currentUser]);

  /**
   * Check if the user can use a specific feature
   */
  const canUseFeature = useCallback(
    (featureId: string): boolean => {
      if (!currentTier) {
        return false;
      }

      const feature = currentTier.features[featureId];
      if (feature === undefined) {
        return false;
      }

      // If feature is a boolean, return it directly
      if (typeof feature === 'boolean') {
        return feature;
      }

      // If feature has a limit, check if user has reached it
      if (typeof feature === 'object' && 'limit' in feature) {
        // If limit is 0 or period is unlimited, user has unlimited access
        if (feature.limit === 0 || feature.period === 'unlimited') {
          return true;
        }

        // Check if user has reached their limit
        const usage = featureUsage[featureId] || 0;
        return usage < feature.limit;
      }

      // For string values (like 'basic', 'advanced', etc.), user has access
      return true;
    },
    [currentTier, featureUsage]
  );

  /**
   * Get the limit for a specific feature
   */
  const getFeatureLimit = useCallback(
    (featureId: string): number | 'unlimited' => {
      if (!currentTier) {
        return 0;
      }

      const feature = currentTier.features[featureId];
      if (feature === undefined) {
        return 0;
      }

      // If feature is a boolean or string, no limit applies
      if (typeof feature !== 'object' || !('limit' in feature)) {
        return 'unlimited';
      }

      // If limit is 0 or period is unlimited, user has unlimited access
      if (feature.limit === 0 || feature.period === 'unlimited') {
        return 'unlimited';
      }

      return feature.limit;
    },
    [currentTier]
  );

  /**
   * Get the current usage for a specific feature
   */
  const getFeatureUsage = useCallback(
    (featureId: string): number => {
      return featureUsage[featureId] || 0;
    },
    [featureUsage]
  );

  /**
   * Check if the user has reached the limit for a specific feature
   */
  const hasReachedLimit = useCallback(
    (featureId: string): boolean => {
      const limit = getFeatureLimit(featureId);
      if (limit === 'unlimited') {
        return false;
      }

      const usage = getFeatureUsage(featureId);
      return usage >= limit;
    },
    [getFeatureLimit, getFeatureUsage]
  );

  /**
   * Get upgrade suggestions for a specific feature
   */
  const getUpgradeSuggestions = useCallback(
    (featureId: string): SubscriptionTier[] => {
      // TODO: Replace with actual API call
      // For now, just suggest the next tier up
      if (currentTier.id === TierType.FREE) {
        return [getTierById(TierType.PREMIUM)!];
      } else if (currentTier.id === TierType.PREMIUM) {
        return [getTierById(TierType.PRO)!];
      }

      return [];
    },
    [currentTier]
  );

  /**
   * Upgrade to a new tier
   */
  const upgradeTier = useCallback(
    async (newTierId: TierType): Promise<boolean> => {
      if (!currentUser) {
        return false;
      }

      try {
        // TODO: Replace with actual API call
        console.log(`Upgrading from ${currentTier.id} to ${newTierId}`);

        // Mock successful upgrade
        const newTier = getTierById(newTierId);
        if (newTier) {
          setCurrentTier(newTier);
        }

        return true;
      } catch (err) {
        console.error('Failed to upgrade tier', err);
        return false;
      }
    },
    [currentUser, currentTier]
  );

  /**
   * Downgrade to a new tier
   */
  const downgradeTier = useCallback(
    async (newTierId: TierType): Promise<boolean> => {
      if (!currentUser) {
        return false;
      }

      try {
        // TODO: Replace with actual API call
        console.log(`Downgrading from ${currentTier.id} to ${newTierId}`);

        // Mock successful downgrade
        const newTier = getTierById(newTierId);
        if (newTier) {
          setCurrentTier(newTier);
        }

        return true;
      } catch (err) {
        console.error('Failed to downgrade tier', err);
        return false;
      }
    },
    [currentUser, currentTier]
  );

  /**
   * Start a trial for a specific tier
   */
  const startTrial = useCallback(
    async (tierId: TierType): Promise<boolean> => {
      if (!currentUser) {
        return false;
      }

      try {
        // TODO: Replace with actual API call
        console.log(`Starting trial for ${tierId}`);

        // Mock successful trial start
        const trialTier = getTierById(tierId);
        if (trialTier) {
          setCurrentTier(trialTier);

          // Update subscription with trial info
          if (subscription) {
            const trialEndDate = new Date();
            trialEndDate.setDate(trialEndDate.getDate() + 14); // 14-day trial

            setSubscription({
              ...subscription,
              tierId,
              isInTrial: true,
              trialEndDate,
            });
          }
        }

        return true;
      } catch (err) {
        console.error('Failed to start trial', err);
        return false;
      }
    },
    [currentUser, subscription]
  );

  /**
   * Cancel the current subscription
   */
  const cancelSubscription = useCallback(async (): Promise<boolean> => {
    if (!currentUser || !subscription) {
      return false;
    }

    try {
      // TODO: Replace with actual API call
      console.log('Cancelling subscription');

      // Mock successful cancellation
      setSubscription({
        ...subscription,
        autoRenew: false,
      });

      return true;
    } catch (err) {
      console.error('Failed to cancel subscription', err);
      return false;
    }
  }, [currentUser, subscription]);

  /**
   * Get the price for a specific tier, platform, and billing cycle
   */
  const getPrice = useCallback(
    (tierId: TierType, platform: PlatformType, billingCycle: BillingCycle): number => {
      const tier = getTierById(tierId);
      if (!tier) {
        return 0;
      }

      return tier.pricing[platform][billingCycle];
    },
    []
  );

  return {
    currentTier,
    isLoading,
    error,
    canUseFeature,
    getFeatureLimit,
    getFeatureUsage,
    hasReachedLimit,
    getUpgradeSuggestions,
    upgradeTier,
    downgradeTier,
    startTrial,
    cancelSubscription,
    getPrice,
  };
}
