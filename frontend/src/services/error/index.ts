import * as Sentry from 'sentry-expo';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import DeviceInfo from 'react-native-device-info';

// Singleton to access Sentry client
let isInitialized = false;

/**
 * Initialize Sentry error monitoring
 * Should be called once at app startup
 */
export const initializeErrorMonitoring = async (): Promise<void> => {
  if (isInitialized) {
    return;
  }

  try {
    // Get app and device information
    const appVersion = await DeviceInfo.getVersion();
    const deviceId = await DeviceInfo.getUniqueId();
    const deviceType = Platform.OS;
    const release = `${Constants.expoConfig?.name}@${appVersion}`;

    // Initialize Sentry with provided configuration
    Sentry.init({
      dsn: 'https://926e50f71d34f3a0b944384bf5647ce9@o4509474690826240.ingest.us.sentry.io/4509474740699136',
      enableInExpoDevelopment: false, // Disable in Expo development
      debug: __DEV__, // Enable debug in development
      environment: __DEV__ ? 'development' : 'production',
      release: release,
      // Adds more context data to events (IP address, cookies, user, etc.)
      sendDefaultPii: true,
      // Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing
      tracesSampleRate: 1.0,
      // profilesSampleRate is relative to tracesSampleRate
      // Here, we'll capture profiles for 100% of transactions
      profilesSampleRate: 1.0,
      // Record Session Replays for 10% of Sessions and 100% of Errors
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      integrations: [
        new Sentry.Native.ReactNativeTracing({
          routingInstrumentation: new Sentry.Native.ReactNavigationInstrumentation(),
          idleTimeout: 5000, // How long until a transaction auto-completes after inactivity (ms)
        }),
        Sentry.Native.mobileReplayIntegration(),
      ],
    });

    // Set user and device context
    Sentry.Native.setTag('device.type', deviceType);
    Sentry.Native.setTag('device.id', deviceId);
    Sentry.Native.setTag('app.version', appVersion);

    isInitialized = true;
    console.log('Sentry initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Sentry:', error);
  }
};

/**
 * Set user context for Sentry
 * Call this when user signs in or out
 *
 * @param userId User identifier or null to clear user context
 * @param userData Additional user data
 */
export const setUserContext = (
  userId: string | null,
  userData?: {
    email?: string;
    username?: string;
    subscription?: string;
  },
): void => {
  if (!isInitialized) {
    console.warn('Sentry not initialized. Cannot set user context.');
    return;
  }

  if (userId) {
    Sentry.Native.setUser({
      id: userId,
      ...userData,
    });
  } else {
    // Clear user context when logging out
    Sentry.Native.setUser(null);
  }
};

/**
 * Capture an exception with Sentry
 *
 * @param error Error object
 * @param context Additional context information
 */
export const captureException = (error: Error, context?: Record<string, any>): void => {
  if (!isInitialized) {
    console.error('Sentry not initialized. Error not captured:', error);
    return;
  }

  Sentry.Native.captureException(error, {
    extra: context,
  });
};

/**
 * Capture a message with Sentry
 * Use for non-error events that should be tracked
 *
 * @param message Message to capture
 * @param level Severity level
 * @param context Additional context information
 */
export const captureMessage = (
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info',
  context?: Record<string, any>,
): void => {
  if (!isInitialized) {
    console.warn('Sentry not initialized. Message not captured:', message);
    return;
  }

  Sentry.Native.captureMessage(message, {
    level: level as Sentry.Severity,
    extra: context,
  });
};

/**
 * Set tags for the current scope
 * Tags are key-value pairs that can be used to categorize events
 *
 * @param tags Object containing key-value pairs
 */
export const setTags = (tags: Record<string, string>): void => {
  if (!isInitialized) {
    console.warn('Sentry not initialized. Tags not set.');
    return;
  }

  Object.entries(tags).forEach(([key, value]) => {
    Sentry.Native.setTag(key, value);
  });
};

/**
 * Add breadcrumb to the current scope
 * Breadcrumbs are used to track user actions leading up to an error
 *
 * @param breadcrumb Breadcrumb object
 */
export const addBreadcrumb = (breadcrumb: {
  type?: string;
  category?: string;
  message: string;
  data?: Record<string, any>;
  level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
}): void => {
  if (!isInitialized) {
    console.warn('Sentry not initialized. Breadcrumb not added.');
    return;
  }

  Sentry.Native.addBreadcrumb({
    type: breadcrumb.type || 'default',
    category: breadcrumb.category || 'app',
    message: breadcrumb.message,
    data: breadcrumb.data,
    level: (breadcrumb.level || 'info') as Sentry.Severity,
  });
};

/**
 * Create a transaction for performance monitoring
 *
 * @param name Transaction name
 * @param operation Operation type
 */
export const startTransaction = (name: string, operation: string): any => {
  if (!isInitialized) {
    console.warn('Sentry not initialized. Transaction not started.');
    return null;
  }

  return Sentry.Native.startTransaction({
    name,
    op: operation,
  });
};

/**
 * Get Sentry status
 * @returns Whether Sentry is initialized
 */
export const isSentryInitialized = (): boolean => {
  return isInitialized;
};
