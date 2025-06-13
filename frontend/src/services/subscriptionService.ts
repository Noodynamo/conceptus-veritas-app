import axios from 'axios';
import { API_BASE_URL } from '../constants/api';
import {
  SubscriptionSummary,
  FeatureAccessResponse,
  UsageLimitResponse,
  AvailableFeaturesResponse,
} from '../types/subscription';

/**
 * Service for handling subscription-related API calls
 */
class SubscriptionService {
  /**
   * Get the user's subscription summary
   */
  async getSubscriptionSummary(): Promise<SubscriptionSummary> {
    const response = await axios.get<SubscriptionSummary>(`${API_BASE_URL}/subscriptions/summary`);
    return response.data;
  }

  /**
   * Check if the user has access to a specific feature
   */
  async checkFeatureAccess(featureName: string): Promise<FeatureAccessResponse> {
    const response = await axios.get<FeatureAccessResponse>(
      `${API_BASE_URL}/subscriptions/feature-access/${featureName}`,
    );
    return response.data;
  }

  /**
   * Check if the user has remaining usage for a specific feature
   */
  async checkUsageLimit(featureName: string): Promise<UsageLimitResponse> {
    const response = await axios.get<UsageLimitResponse>(
      `${API_BASE_URL}/subscriptions/usage-limits/${featureName}`,
    );
    return response.data;
  }

  /**
   * Get a list of features available to the user
   */
  async getAvailableFeatures(): Promise<AvailableFeaturesResponse> {
    const response = await axios.get<AvailableFeaturesResponse>(
      `${API_BASE_URL}/subscriptions/features`,
    );
    return response.data;
  }

  /**
   * Upgrade the user's subscription to a higher tier
   */
  async upgradeSubscription(tier: string): Promise<void> {
    await axios.post(`${API_BASE_URL}/subscriptions/upgrade`, null, {
      params: { tier },
    });
  }

  /**
   * Cancel the user's subscription
   */
  async cancelSubscription(immediate: boolean = false): Promise<void> {
    await axios.post(`${API_BASE_URL}/subscriptions/cancel`, null, {
      params: { immediate },
    });
  }

  /**
   * Initiate a payment flow for subscription upgrade
   * In a real implementation, this would integrate with a payment processor like Stripe
   */
  async initiatePaymentFlow(
    tier: string,
  ): Promise<{ clientSecret: string; subscriptionId: string }> {
    const response = await axios.post<{ clientSecret: string; subscriptionId: string }>(
      `${API_BASE_URL}/subscriptions/initiate-payment`,
      { tier },
    );
    return response.data;
  }

  /**
   * Confirm a payment and finalize subscription upgrade
   */
  async confirmPayment(subscriptionId: string, paymentIntentId: string): Promise<void> {
    await axios.post(`${API_BASE_URL}/subscriptions/confirm-payment`, {
      subscription_id: subscriptionId,
      payment_intent_id: paymentIntentId,
    });
  }
}

export const subscriptionService = new SubscriptionService();
