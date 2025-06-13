# Monitoring and Analytics Setup

This document provides an overview of the monitoring and analytics setup for the Conceptus Veritas app.

## Table of Contents

- [Analytics with PostHog](#analytics-with-posthog)
- [Error Monitoring with Sentry](#error-monitoring-with-sentry)
- [Configuration](#configuration)
- [Best Practices](#best-practices)

## Analytics with PostHog

PostHog is used to track user interactions, feature usage, engagement metrics, retention, and conversion funnels.

### Frontend Implementation

The frontend implementation includes:

1. **Analytics Service Layer**
   - Located at `frontend/src/services/analytics/index.ts`
   - Provides functions for tracking events, identifying users, and managing feature flags
   - Uses a singleton pattern to ensure consistent PostHog client access

2. **Context Provider**
   - Located at `frontend/src/context/AnalyticsProvider.tsx`
   - Wraps the application to provide PostHog functionality
   - Configures PostHog with privacy-focused settings

3. **Analytics Hooks**
   - Located at `frontend/src/hooks/useAnalytics.ts`
   - Provides a simple interface for using analytics throughout the app
   - Includes functions for tracking events, screens, identifying users, and feature flags

4. **Screen Tracking**
   - Located at `frontend/src/components/common/ScreenTracker.tsx`
   - Automatically tracks screen views when navigation changes

### Backend Implementation

The backend implementation includes:

1. **Analytics Service**
   - Located at `backend/src/services/analytics/analytics.service.ts`
   - Provides a centralized interface for sending events to PostHog
   - Validates events against schemas before sending

2. **Schema Registry**
   - Ensures consistency in event tracking
   - Validates event properties before sending

### Usage

To track an event in the frontend:

```typescript
import { useAnalytics } from '../../hooks/useAnalytics';

// Inside your component
const { trackEvent } = useAnalytics();

// Track an event
trackEvent(AnalyticsEvent.USER_SIGNED_UP, {
  method: 'email',
  referrer: 'homepage'
});
```

To track an event in the backend:

```typescript
import { analyticsService } from '../../services/analytics';

// Track an event
analyticsService.track(
  'ph_user_signed_up',
  { method: 'email', referrer: 'api' },
  'user-123' // distinctId
);
```

## Error Monitoring with Sentry

Sentry is used for error monitoring, crash reporting, and performance monitoring.

### Frontend Implementation

The frontend implementation includes:

1. **Error Monitoring Service**
   - Located at `frontend/src/services/error/index.ts`
   - Provides functions for capturing exceptions, messages, and setting user context
   - Includes performance monitoring with transactions
   - Pre-configured with official Sentry DSN and optimal settings
   - Includes session replay functionality to capture errors in context

2. **Context Provider**
   - Located at `frontend/src/context/ErrorMonitoringProvider.tsx`
   - Initializes Sentry with the pre-configured settings
   - Wraps the entire application to enable error monitoring

3. **Error Monitoring Hooks**
   - Located at `frontend/src/hooks/useErrorMonitoring.ts`
   - Provides a simple interface for using error monitoring throughout the app
   - Includes functions for logging errors, messages, and tracking performance

4. **Error Boundary Component**
   - Located at `frontend/src/components/common/ErrorBoundary.tsx`
   - Catches JavaScript errors in the component tree
   - Displays a fallback UI when errors occur

5. **App Wrapping**
   - The main App component is wrapped with `Sentry.wrap(App)` in `frontend/src/App.tsx`
   - This ensures all unhandled errors are captured and reported to Sentry
   - Provides additional context to error reports, such as component stack traces

### Backend Implementation

The backend implementation includes:

1. **Error Monitoring Service**
   - Located at `backend/src/services/error/index.ts`
   - Provides functions for capturing exceptions, messages, and setting user context
   - Includes performance monitoring with transactions

2. **Express Middleware Integration**
   - Captures request data for better error context
   - Automatically tracks performance metrics

3. **Graceful Shutdown**
   - Ensures all errors are sent before the application exits
   - Prevents loss of error reports during deployment

### Usage

To capture an error in the frontend:

```typescript
import { useErrorMonitoring } from '../../hooks/useErrorMonitoring';

// Inside your component
const { logError } = useErrorMonitoring();

// Capture an exception
try {
  // Some code that might throw
} catch (error) {
  logError(error, { component: 'MyComponent' });
}
```

To capture an error in the backend:

```typescript
import { captureException } from '../../services/error/error-service';

// Capture an exception
try {
  // Some code that might throw
} catch (error) {
  captureException(error, { context: 'api' });
}
```

## Configuration

### Environment Variables

#### PostHog (Frontend)

- `EXPO_PUBLIC_POSTHOG_API_KEY`: PostHog API key
- `EXPO_PUBLIC_POSTHOG_HOST`: PostHog host URL (default: https://us.i.posthog.com)

#### PostHog (Backend)

- `POSTHOG_API_KEY`: PostHog API key
- `POSTHOG_HOST`: PostHog host URL (default: https://app.posthog.com)

#### Sentry (Backend)

- `SENTRY_DSN`: Sentry DSN

### Sentry Configuration

The frontend Sentry implementation uses the following configuration:

```typescript
Sentry.init({
  dsn: "https://926e50f71d34f3a0b944384bf5647ce9@o4509474690826240.ingest.us.sentry.io/4509474740699136",
  enableInExpoDevelopment: false,
  debug: __DEV__,
  environment: __DEV__ ? 'development' : 'production',
  // Adds more context data to events
  sendDefaultPii: true,
  // Performance monitoring
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  // Session replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    new Sentry.Native.ReactNativeTracing({
      routingInstrumentation: new Sentry.Native.ReactNavigationInstrumentation(),
    }),
    Sentry.Native.mobileReplayIntegration(),
  ],
});
```

In addition, the main App component is wrapped with Sentry for comprehensive error tracking:

```typescript
// In App.tsx
import * as Sentry from '@sentry/react-native';

const App = () => {
  // Component implementation
};

export default Sentry.wrap(App);
```

## Best Practices

### Analytics

1. **Use Consistent Event Names**
   - All events should use the `ph_` prefix
   - Use the defined event names from `AnalyticsEvent` enum

2. **Privacy First**
   - Never include PII (Personally Identifiable Information) in events
   - Use the masking features provided by PostHog

3. **Selective Tracking**
   - Track only what's needed for analysis, not everything
   - Focus on key user actions and engagement metrics

### Error Monitoring

1. **Context Matters**
   - Always include relevant context when capturing errors
   - Add breadcrumbs for important user actions

2. **Session Replay Benefits**
   - Sentry session replay is configured to capture 10% of all sessions
   - 100% of error sessions are captured for full context

3. **Performance Monitoring**
   - Use transactions to track performance of critical paths
   - All transactions are monitored (100% sample rate)

4. **Error Boundaries**
   - Use error boundaries to prevent entire app crashes
   - Provide useful fallback UIs 