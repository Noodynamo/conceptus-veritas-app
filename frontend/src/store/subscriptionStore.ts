import { create } from 'zustand';
import { SubscriptionSummary, FeatureUsageSummary } from '../types/subscription';
import { subscriptionService } from '../services/subscriptionService';

interface SubscriptionState {
  // Subscription data
  tier: string;
  status: string;
  isActive: boolean;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  featureUsage: Record<string, FeatureUsageSummary>;

  // Loading state
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchSubscription: () => Promise<void>;
  upgradeSubscription: (tier: string) => Promise<boolean>;
  cancelSubscription: (immediate: boolean) => Promise<boolean>;
  checkFeatureAccess: (featureName: string) => Promise<boolean>;
  checkUsageLimit: (featureName: string) => Promise<number>;
  resetState: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  // Initial state
  tier: 'free',
  status: 'none',
  isActive: false,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  featureUsage: {},
  isLoading: false,
  error: null,

  // Fetch subscription data
  fetchSubscription: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await subscriptionService.getSubscriptionSummary();

      set({
        tier: data.tier,
        status: data.status,
        isActive: data.is_active,
        currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end) : null,
        cancelAtPeriodEnd: data.cancel_at_period_end,
        featureUsage: data.feature_usage,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch subscription data',
      });
    }
  },

  // Upgrade subscription
  upgradeSubscription: async (tier: string) => {
    try {
      set({ isLoading: true, error: null });
      await subscriptionService.upgradeSubscription(tier);
      await get().fetchSubscription();
      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to upgrade subscription',
      });
      return false;
    }
  },

  // Cancel subscription
  cancelSubscription: async (immediate: boolean) => {
    try {
      set({ isLoading: true, error: null });
      await subscriptionService.cancelSubscription(immediate);
      await get().fetchSubscription();
      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to cancel subscription',
      });
      return false;
    }
  },

  // Check feature access
  checkFeatureAccess: async (featureName: string) => {
    try {
      const response = await subscriptionService.checkFeatureAccess(featureName);
      return response.has_access;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : `Failed to check access for ${featureName}`,
      });
      return false;
    }
  },

  // Check usage limit
  checkUsageLimit: async (featureName: string) => {
    try {
      const response = await subscriptionService.checkUsageLimit(featureName);
      return response.remaining;
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : `Failed to check usage limit for ${featureName}`,
      });
      return 0;
    }
  },

  // Reset state (e.g., on logout)
  resetState: () => {
    set({
      tier: 'free',
      status: 'none',
      isActive: false,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      featureUsage: {},
      isLoading: false,
      error: null,
    });
  },
}));
