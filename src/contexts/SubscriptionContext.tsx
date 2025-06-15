/**
 * Subscription Context
 *
 * This context provides subscription-related data and functionality throughout the app.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  TierType,
  PlatformType,
  BillingCycle,
  SubscriptionTier,
  getTierById,
} from '../models/subscription/tiers';
import {
  subscriptionService,
  UserSubscription,
} from '../services/subscription/subscription-service';
import { useAuth } from '../hooks/useAuth'; // Assuming you have an auth hook

/**
 * Interface for the subscription context value
 */
interface SubscriptionContextValue {
  // Current subscription state
  currentTier: SubscriptionTier;
  subscription: UserSubscription | null;
  isLoading: boolean;
  error: Error | null;

  // Feature access methods
  canUseFeature: (featureId: string) => Promise<boolean>;
  getFeatureLimit: (featureId: string) => Promise<number | 'unlimited'>;
  getFeatureUsage: (featureId: string) => Promise<number>;
  hasReachedLimit: (featureId: string) => Promise<boolean>;
  trackFeatureUsage: (featureId: string) => Promise<number>;

  // Upgrade/downgrade methods
  getUpgradeSuggestions: (featureId: string) => Promise<SubscriptionTier[]>;
  upgradeTier: (newTierId: TierType) => Promise<boolean>;
  downgradeTier: (newTierId: TierType) => Promise<boolean>;

  // Trial/subscription methods
  startTrial: (tierId: TierType, trialDays?: number) => Promise<boolean>;
  startSubscription: (
    tierId: TierType,
    platform: PlatformType,
    billingCycle: BillingCycle,
    paymentMethod: string
  ) => Promise<boolean>;
  cancelSubscription: () => Promise<boolean>;

  // Pricing methods
  calculatePrice: (tierId: TierType, platform: PlatformType, billingCycle: BillingCycle) => number;

  // Refresh methods
  refreshSubscription: () => Promise<void>;
}

// Create the context
export const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

/**
 * Subscription Provider Props
 */
interface SubscriptionProviderProps {
  children: ReactNode;
}

/**
 * Subscription Provider Component
 */
export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  // Get current user from auth
  const { currentUser } = useAuth();

  // State for subscription data
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>(getTierById(TierType.FREE)!);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Load subscription data when user changes
  useEffect(() => {
    if (!currentUser) {
      // If no user is logged in, use FREE tier
      setCurrentTier(getTierById(TierType.FREE)!);
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    refreshSubscription();
  }, [currentUser]);

  /**
   * Refresh subscription data
   */
  const refreshSubscription = async (): Promise<void> => {
    if (!currentUser) {
      return;
    }

    try {
      setIsLoading(true);

      // Get user subscription
      const userSubscription = await subscriptionService.getUserSubscription(currentUser.id);
      setSubscription(userSubscription);

      // Get tier details
      const tier = await subscriptionService.getUserTier(currentUser.id);
      setCurrentTier(tier);

      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load subscription data'));
      setIsLoading(false);
    }
  };

  /**
   * Check if the user can use a specific feature
   */
  const canUseFeature = async (featureId: string): Promise<boolean> => {
    if (!currentUser) {
      return false;
    }

    return subscriptionService.hasFeatureAccess(currentUser.id, featureId);
  };

  /**
   * Get the limit for a specific feature
   */
  const getFeatureLimit = async (featureId: string): Promise<number | 'unlimited'> => {
    if (!currentUser || !currentTier) {
      return 0;
    }

    const limit = subscriptionService.getFeatureLimit(currentTier.id, featureId);

    if (!limit) {
      return 'unlimited';
    }

    if (limit.period === 'unlimited' || limit.limit === 0) {
      return 'unlimited';
    }

    return limit.limit;
  };

  /**
   * Get the current usage for a specific feature
   */
  const getFeatureUsage = async (featureId: string): Promise<number> => {
    if (!currentUser) {
      return 0;
    }

    return subscriptionService.getFeatureUsage(currentUser.id, featureId);
  };

  /**
   * Check if the user has reached the limit for a specific feature
   */
  const hasReachedLimit = async (featureId: string): Promise<boolean> => {
    if (!currentUser) {
      return false;
    }

    return subscriptionService.hasReachedFeatureLimit(currentUser.id, featureId);
  };

  /**
   * Track usage of a feature
   */
  const trackFeatureUsage = async (featureId: string): Promise<number> => {
    if (!currentUser) {
      return 0;
    }

    return subscriptionService.trackFeatureUsage(currentUser.id, featureId);
  };

  /**
   * Get upgrade suggestions for a specific feature
   */
  const getUpgradeSuggestions = async (featureId: string): Promise<SubscriptionTier[]> => {
    if (!currentUser) {
      return [];
    }

    return subscriptionService.getUpgradeSuggestions(currentUser.id, featureId);
  };

  /**
   * Upgrade to a new tier
   */
  const upgradeTier = async (newTierId: TierType): Promise<boolean> => {
    if (!currentUser) {
      return false;
    }

    try {
      await subscriptionService.upgradeTier(currentUser.id, newTierId);
      await refreshSubscription();
      return true;
    } catch (err) {
      console.error('Failed to upgrade tier', err);
      return false;
    }
  };

  /**
   * Downgrade to a new tier
   */
  const downgradeTier = async (newTierId: TierType): Promise<boolean> => {
    if (!currentUser) {
      return false;
    }

    try {
      await subscriptionService.downgradeTier(currentUser.id, newTierId);
      await refreshSubscription();
      return true;
    } catch (err) {
      console.error('Failed to downgrade tier', err);
      return false;
    }
  };

  /**
   * Start a trial for a specific tier
   */
  const startTrial = async (tierId: TierType, trialDays?: number): Promise<boolean> => {
    if (!currentUser) {
      return false;
    }

    try {
      await subscriptionService.startTrial(currentUser.id, tierId, trialDays);
      await refreshSubscription();
      return true;
    } catch (err) {
      console.error('Failed to start trial', err);
      return false;
    }
  };

  /**
   * Start a subscription
   */
  const startSubscription = async (
    tierId: TierType,
    platform: PlatformType,
    billingCycle: BillingCycle,
    paymentMethod: string
  ): Promise<boolean> => {
    if (!currentUser) {
      return false;
    }

    try {
      await subscriptionService.startSubscription(
        currentUser.id,
        tierId,
        platform,
        billingCycle,
        paymentMethod
      );
      await refreshSubscription();
      return true;
    } catch (err) {
      console.error('Failed to start subscription', err);
      return false;
    }
  };

  /**
   * Cancel the current subscription
   */
  const cancelSubscription = async (): Promise<boolean> => {
    if (!currentUser) {
      return false;
    }

    try {
      await subscriptionService.cancelSubscription(currentUser.id);
      await refreshSubscription();
      return true;
    } catch (err) {
      console.error('Failed to cancel subscription', err);
      return false;
    }
  };

  /**
   * Calculate the price for a specific tier, platform, and billing cycle
   */
  const calculatePrice = (
    tierId: TierType,
    platform: PlatformType,
    billingCycle: BillingCycle
  ): number => {
    return subscriptionService.calculatePrice(tierId, platform, billingCycle);
  };

  // Create context value
  const contextValue: SubscriptionContextValue = {
    currentTier,
    subscription,
    isLoading,
    error,
    canUseFeature,
    getFeatureLimit,
    getFeatureUsage,
    hasReachedLimit,
    trackFeatureUsage,
    getUpgradeSuggestions,
    upgradeTier,
    downgradeTier,
    startTrial,
    startSubscription,
    cancelSubscription,
    calculatePrice,
    refreshSubscription,
  };

  return (
    <SubscriptionContext.Provider value={contextValue}>{children}</SubscriptionContext.Provider>
  );
};

/**
 * Hook for using the subscription context
 */
export function useSubscription(): SubscriptionContextValue {
  const context = useContext(SubscriptionContext);

  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }

  return context;
}
