import React, { useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import { PostHogProvider } from 'posthog-react-native';
import DeviceInfo from 'react-native-device-info';
import { initializePostHog } from '../services/analytics';
import { FeatureFlag } from '../types/analytics';

interface AnalyticsProviderProps {
  children: ReactNode;
}

/**
 * PostHog analytics provider component
 * Initializes PostHog with the provided API key and configuration
 */
export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  // PostHog configuration options
  const posthogOptions = {
    host: 'https://us.i.posthog.com',
    debug: __DEV__, // Enable debug mode in development only
    capture_pageview: false, // Disable automatic pageview capture (we'll use custom screen events)
    autocapture: true, // Enable automatic event capture for baseline interactions
    session_recording: true, // Enable session recording for UX analysis
    mask_all_text_inputs: true, // Mask text inputs for privacy
    in_memory_queueing: true, // Use in-memory queueing to prevent UI thread blocking
    opt_out_by_default: false, // Analytics will be opt-in by default
  };

  // Get device information for enhanced analytics
  useEffect(() => {
    async function getDeviceInfo() {
      try {
        const deviceType = Platform.OS;
        const appVersion = await DeviceInfo.getVersion();
        const deviceId = await DeviceInfo.getUniqueId();

        // Set these in your analytics context for later use
        console.log('Device info loaded', { deviceType, appVersion, deviceId });
      } catch (error) {
        console.error('Error getting device info:', error);
      }
    }

    getDeviceInfo();
  }, []);

  return (
    <PostHogProvider
      apiKey="phc_XIewAQ3YbJqhQkLJeZcEQHVgEkpsaao9q3CKevFOJdV"
      options={posthogOptions}
      autocapture={{
        // Capture only essential interactions, avoiding unnecessary noise
        dom: false, // Not applicable for React Native
        captureTouches: true, // Capture touch events
        captureTextChanges: false, // Don't capture text changes for privacy
        capturePagination: true, // Capture pagination events
        captureScrolling: false, // Don't capture scrolling events to reduce noise
      }}
      featureFlags={{
        // Set up feature flags for testing and rollouts
        [FeatureFlag.AI_ROUTER_PHASE_2]: false, // Default to Phase 1 router
        [FeatureFlag.EXPLORE_VISUALIZATION_MODE]: 'concept-map', // Default visualization
        [FeatureFlag.QUEST_SKILL_TREE_LAYOUT]: 'spatial', // Default layout
        [FeatureFlag.ORGANIC_DISCOVERY_SYSTEM]: false, // Disabled by default
        [FeatureFlag.PATH_CREATOR_ACCESS]: false, // Restricted by default
      }}
      onPostHogInitialized={client => {
        // Store the client for later use in the analytics service
        initializePostHog(client);
        console.log('PostHog initialized successfully');
      }}
    >
      {children}
    </PostHogProvider>
  );
};
