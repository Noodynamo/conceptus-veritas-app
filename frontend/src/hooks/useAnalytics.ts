import { useCallback } from 'react';
import {
  trackEvent,
  identifyUser,
  setUserProperties,
  resetUser,
  getPostHogClient,
} from '../services/analytics';
import { AnalyticsEvent, UserProperties, FeatureFlag } from '../types/analytics';

/**
 * Hook for using analytics tracking functionality
 */
export const useAnalytics = () => {
  /**
   * Track a screen view
   * @param screenName The name of the screen
   * @param properties Additional properties to track with the screen view
   */
  const trackScreen = useCallback((screenName: string, properties?: Record<string, any>) => {
    trackEvent(AnalyticsEvent.SCREEN_VIEW, {
      screen_name: screenName,
      ...properties,
    });
  }, []);

  /**
   * Identify a user in analytics
   * @param userId User ID
   * @param properties User properties
   */
  const identify = useCallback((userId: string, properties?: UserProperties) => {
    identifyUser(userId, properties);
  }, []);

  /**
   * Update user properties in analytics
   * @param properties User properties to update
   */
  const updateUserProperties = useCallback((properties: UserProperties) => {
    setUserProperties(properties);
  }, []);

  /**
   * Reset user identification (used for logout)
   */
  const reset = useCallback(() => {
    resetUser();
  }, []);

  /**
   * Get the value of a feature flag
   * @param flag The feature flag to check
   * @returns The value of the feature flag or undefined if not found
   */
  const getFeatureFlag = useCallback(<T>(flag: FeatureFlag): T | undefined => {
    const client = getPostHogClient();
    if (!client) {
      console.warn('PostHog client not initialized');
      return undefined;
    }

    return client.getFeatureFlag(flag) as T;
  }, []);

  /**
   * Check if a boolean feature flag is enabled
   * @param flag The feature flag to check
   * @returns True if the feature flag is enabled, false otherwise
   */
  const isFeatureEnabled = useCallback((flag: FeatureFlag): boolean => {
    const client = getPostHogClient();
    if (!client) {
      console.warn('PostHog client not initialized');
      return false;
    }

    return Boolean(client.getFeatureFlag(flag));
  }, []);

  return {
    // Track events
    trackEvent,
    trackScreen,

    // User identification
    identify,
    updateUserProperties,
    reset,

    // Feature flags
    getFeatureFlag,
    isFeatureEnabled,
  };
};
