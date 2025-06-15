import { SubscriptionTier } from '../../../domain/entities/subscription/SubscriptionTier';
import { SubscriptionRepository } from '../../../domain/repositories/subscription/SubscriptionRepository';
import { ApiClient } from '../../../infrastructure/api/ApiClient';
import { SubscriptionDto, UserSubscriptionDto } from '../../models/subscription/SubscriptionDto';
import { SubscriptionMapper } from '../../models/subscription/SubscriptionMapper';

/**
 * Implementation of the SubscriptionRepository interface
 * This class connects the domain layer to the data sources
 */
export class SubscriptionRepositoryImpl implements SubscriptionRepository {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Get user's current subscription
   */
  async getUserSubscription(userId: string): Promise<SubscriptionTier> {
    try {
      // Get user subscription data
      const userSubData = await this.apiClient.get<UserSubscriptionDto>(
        `/users/${userId}/subscription`
      );

      // Get subscription tier details
      const subscriptionData = await this.apiClient.get<SubscriptionDto>(
        `/subscriptions/${userSubData.subscription_id}`
      );

      // Map to domain entity
      return SubscriptionMapper.toDomain(subscriptionData);
    } catch (error) {
      throw new Error(
        `Failed to get user subscription: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get all available subscription tiers
   */
  async getAllTiers(): Promise<SubscriptionTier[]> {
    try {
      // Get all subscription tiers
      const tiersData = await this.apiClient.get<SubscriptionDto[]>('/subscriptions');

      // Map to domain entities
      return tiersData.map(tier => SubscriptionMapper.toDomain(tier));
    } catch (error) {
      throw new Error(
        `Failed to get subscription tiers: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Upgrade user to a new subscription tier
   */
  async upgradeTier(userId: string, tierId: string): Promise<boolean> {
    try {
      await this.apiClient.post(`/users/${userId}/subscription/upgrade`, { tier_id: tierId });
      return true;
    } catch (error) {
      throw new Error(
        `Failed to upgrade subscription: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Downgrade user to a new subscription tier
   */
  async downgradeTier(userId: string, tierId: string): Promise<boolean> {
    try {
      await this.apiClient.post(`/users/${userId}/subscription/downgrade`, { tier_id: tierId });
      return true;
    } catch (error) {
      throw new Error(
        `Failed to downgrade subscription: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Check if a user has access to a specific feature
   */
  async hasFeatureAccess(userId: string, featureId: string): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription(userId);
      const feature = subscription.features.find(f => f.id === featureId);
      return feature ? feature.isEnabled : false;
    } catch (error) {
      throw new Error(
        `Failed to check feature access: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get the usage limit for a specific feature for a user
   */
  async getFeatureUsageLimit(userId: string, featureId: string): Promise<number | undefined> {
    try {
      const subscription = await this.getUserSubscription(userId);
      const feature = subscription.features.find(f => f.id === featureId);
      return feature ? feature.usageLimit : undefined;
    } catch (error) {
      throw new Error(
        `Failed to get feature usage limit: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get the current usage of a specific feature for a user
   */
  async getFeatureCurrentUsage(userId: string, featureId: string): Promise<number> {
    try {
      const userSubData = await this.apiClient.get<UserSubscriptionDto>(
        `/users/${userId}/subscription`
      );

      const featureUsage = userSubData.feature_usage.find(f => f.feature_id === featureId);
      return featureUsage ? featureUsage.current_usage : 0;
    } catch (error) {
      throw new Error(
        `Failed to get feature current usage: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Increment the usage counter for a specific feature for a user
   */
  async incrementFeatureUsage(userId: string, featureId: string, amount = 1): Promise<number> {
    try {
      const response = await this.apiClient.post<{ current_usage: number }>(
        `/users/${userId}/features/${featureId}/increment`,
        { amount }
      );

      return response.current_usage;
    } catch (error) {
      throw new Error(
        `Failed to increment feature usage: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
