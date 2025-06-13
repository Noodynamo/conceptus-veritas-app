import { useState, useEffect, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { SubscriptionTier } from '../types/subscription';

/**
 * Hook for checking feature access based on subscription tier
 * and handling feature gating in the app
 */
export const useSubscriptionFeatures = () => {
  const navigation = useNavigation();
  const { tier, featureUsage, checkFeatureAccess, checkUsageLimit, isLoading, fetchSubscription } =
    useSubscriptionStore();

  const [isCheckingAccess, setIsCheckingAccess] = useState(false);

  // Fetch subscription data if not already loaded
  useEffect(() => {
    if (!featureUsage || Object.keys(featureUsage).length === 0) {
      fetchSubscription();
    }
  }, [featureUsage, fetchSubscription]);

  /**
   * Check if a feature is accessible based on the user's subscription tier
   * @param featureName The name of the feature to check
   * @param showPaywall Whether to show the paywall if feature is not accessible
   * @returns Whether the feature is accessible
   */
  const canAccessFeature = useCallback(
    async (featureName: string, showPaywall: boolean = true): Promise<boolean> => {
      setIsCheckingAccess(true);

      try {
        const hasAccess = await checkFeatureAccess(featureName);

        if (!hasAccess && showPaywall) {
          // Navigate to paywall screen
          navigation.navigate(
            'Paywall' as never,
            {
              source: 'feature_access',
              featureName,
              // We would need to know which tier is required for this feature
              // This would come from the API response in a real implementation
              requiredTier:
                tier === SubscriptionTier.FREE ? SubscriptionTier.PREMIUM : SubscriptionTier.PRO,
            } as never,
          );
        }

        return hasAccess;
      } catch (error) {
        console.error('Error checking feature access:', error);
        return false;
      } finally {
        setIsCheckingAccess(false);
      }
    },
    [checkFeatureAccess, navigation, tier],
  );

  /**
   * Check if the user has remaining usage for a feature
   * @param featureName The name of the feature to check
   * @param showPaywall Whether to show the paywall if limit is reached
   * @returns Remaining usage count, or -1 if error
   */
  const getRemainingUsage = useCallback(
    async (featureName: string, showPaywall: boolean = true): Promise<number> => {
      setIsCheckingAccess(true);

      try {
        const remaining = await checkUsageLimit(featureName);

        if (remaining <= 0 && showPaywall) {
          // Navigate to paywall screen
          navigation.navigate(
            'Paywall' as never,
            {
              source: 'usage_limit',
              featureName,
              // Determine required tier based on current tier
              requiredTier:
                tier === SubscriptionTier.FREE ? SubscriptionTier.PREMIUM : SubscriptionTier.PRO,
            } as never,
          );
        }

        return remaining;
      } catch (error) {
        console.error('Error checking usage limit:', error);
        return -1;
      } finally {
        setIsCheckingAccess(false);
      }
    },
    [checkUsageLimit, navigation, tier],
  );

  /**
   * Get feature limit for a specific feature based on current tier
   * @param featureName The name of the feature to check
   * @returns The daily limit for the feature, or Infinity if unlimited
   */
  const getFeatureLimit = useCallback(
    (featureName: string): number => {
      const feature = featureUsage[featureName];
      if (!feature) return 0;

      return feature.daily_limit >= 99999 ? Infinity : feature.daily_limit;
    },
    [featureUsage],
  );

  /**
   * Check if a user is on a premium tier (Premium or Pro)
   * @returns Whether the user is on a premium tier
   */
  const isPremiumTier = useCallback((): boolean => {
    return tier === SubscriptionTier.PREMIUM || tier === SubscriptionTier.PRO;
  }, [tier]);

  /**
   * Check if a user is on the Pro tier
   * @returns Whether the user is on the Pro tier
   */
  const isProTier = useCallback((): boolean => {
    return tier === SubscriptionTier.PRO;
  }, [tier]);

  return {
    tier,
    isLoading: isLoading || isCheckingAccess,
    canAccessFeature,
    getRemainingUsage,
    getFeatureLimit,
    isPremiumTier,
    isProTier,
    featureUsage,
  };
};

export default useSubscriptionFeatures;
