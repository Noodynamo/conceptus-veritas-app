import { useState, useEffect, useCallback } from 'react';
import { SubscriptionTier } from '../../../domain/entities/subscription/SubscriptionTier';
import { GetUserSubscriptionUseCase } from '../../../domain/usecases/subscription/GetUserSubscriptionUseCase';

/**
 * Interface for the subscription view model state
 */
interface SubscriptionState {
  userSubscription: SubscriptionTier | null;
  availableTiers: SubscriptionTier[];
  loading: boolean;
  error: Error | null;
}

/**
 * Interface for the subscription view model
 */
export interface SubscriptionViewModelType {
  state: SubscriptionState;
  upgradeTier: (tierId: string) => Promise<boolean>;
  downgradeTier: (tierId: string) => Promise<boolean>;
  refreshSubscription: () => Promise<void>;
}

/**
 * ViewModel for subscription management following MVVM pattern
 * Handles the business logic for the subscription view
 */
export const useSubscriptionViewModel = (
  getUserSubscriptionUseCase: GetUserSubscriptionUseCase,
  getAllTiersUseCase: any,
  upgradeTierUseCase: any,
  downgradeTierUseCase: any,
  userId: string
): SubscriptionViewModelType => {
  // State management
  const [state, setState] = useState<SubscriptionState>({
    userSubscription: null,
    availableTiers: [],
    loading: true,
    error: null,
  });

  /**
   * Fetches user subscription and available tiers
   */
  const refreshSubscription = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Execute use cases in parallel for better performance
      const [userSubscription, allTiers] = await Promise.all([
        getUserSubscriptionUseCase.execute(userId),
        getAllTiersUseCase.execute(),
      ]);

      setState({
        userSubscription,
        availableTiers: allTiers,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error('An unknown error occurred'),
      }));
    }
  }, [getUserSubscriptionUseCase, getAllTiersUseCase, userId]);

  /**
   * Upgrades user to a new tier
   */
  const upgradeTier = useCallback(
    async (tierId: string): Promise<boolean> => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        await upgradeTierUseCase.execute(userId, tierId);
        await refreshSubscription();
        return true;
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error : new Error('Failed to upgrade subscription'),
        }));
        return false;
      }
    },
    [upgradeTierUseCase, userId, refreshSubscription]
  );

  /**
   * Downgrades user to a new tier
   */
  const downgradeTier = useCallback(
    async (tierId: string): Promise<boolean> => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        await downgradeTierUseCase.execute(userId, tierId);
        await refreshSubscription();
        return true;
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error : new Error('Failed to downgrade subscription'),
        }));
        return false;
      }
    },
    [downgradeTierUseCase, userId, refreshSubscription]
  );

  // Load data on component mount
  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  return {
    state,
    upgradeTier,
    downgradeTier,
    refreshSubscription,
  };
};
