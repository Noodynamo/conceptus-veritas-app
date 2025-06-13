import { PostHog } from 'posthog-react-native';

// Singleton to access PostHog client
let posthogInstance: PostHog | null = null;

/**
 * Initialize the PostHog client
 * @param client - The PostHog client instance
 */
export const initializePostHog = (client: PostHog): void => {
  posthogInstance = client;
};

/**
 * Get the PostHog client instance
 * @returns The PostHog client instance or null if not initialized
 */
export const getPostHogClient = (): PostHog | null => {
  return posthogInstance;
};

/**
 * Track an event with PostHog
 *
 * @param eventName - The name of the event (should start with ph_)
 * @param properties - Event properties
 * @returns boolean indicating if the event was tracked
 */
export const trackEvent = (eventName: string, properties?: Record<string, any>): boolean => {
  if (!posthogInstance) {
    console.warn('PostHog not initialized. Event not tracked:', eventName);
    return false;
  }

  // Validate event name format
  if (!eventName.startsWith('ph_')) {
    console.warn(`Event name does not follow ph_ prefix convention: ${eventName}`);
  }

  try {
    // Add standard properties
    const enrichedProperties = {
      ...properties,
      app_version: process.env.EXPO_PUBLIC_APP_VERSION || '0.1.0',
      timestamp: new Date().toISOString(),
    };

    // Track the event
    posthogInstance.capture(eventName, enrichedProperties);
    return true;
  } catch (error) {
    console.error(`Failed to track event ${eventName}:`, error);
    return false;
  }
};

/**
 * Identify a user in PostHog
 *
 * @param userId - The user's unique identifier
 * @param userProperties - Additional user properties
 * @returns boolean indicating if the user was identified
 */
export const identifyUser = (userId: string, userProperties?: Record<string, any>): boolean => {
  if (!posthogInstance) {
    console.warn('PostHog not initialized. User not identified:', userId);
    return false;
  }

  try {
    posthogInstance.identify(userId, userProperties);
    return true;
  } catch (error) {
    console.error(`Failed to identify user ${userId}:`, error);
    return false;
  }
};

/**
 * Set user properties in PostHog
 *
 * @param properties - User properties to set
 * @returns boolean indicating if the properties were set
 */
export const setUserProperties = (properties: Record<string, any>): boolean => {
  if (!posthogInstance) {
    console.warn('PostHog not initialized. User properties not set');
    return false;
  }

  try {
    posthogInstance.people.set(properties);
    return true;
  } catch (error) {
    console.error('Failed to set user properties:', error);
    return false;
  }
};

/**
 * Reset the user identifier (for logout)
 *
 * @returns boolean indicating if the identifier was reset
 */
export const resetUser = (): boolean => {
  if (!posthogInstance) {
    console.warn('PostHog not initialized. User not reset');
    return false;
  }

  try {
    posthogInstance.reset();
    return true;
  } catch (error) {
    console.error('Failed to reset user:', error);
    return false;
  }
};
