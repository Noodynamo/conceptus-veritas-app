import { useCallback } from 'react';
import {
  captureException,
  captureMessage,
  setUserContext,
  setTags,
  addBreadcrumb,
  startTransaction,
  isSentryInitialized,
} from '../services/error';

/**
 * Hook for using error monitoring functionality
 */
export const useErrorMonitoring = () => {
  /**
   * Capture an exception
   * @param error Error object
   * @param context Additional context information
   */
  const logError = useCallback((error: Error, context?: Record<string, any>) => {
    captureException(error, context);
  }, []);

  /**
   * Capture a message
   * @param message Message to capture
   * @param level Severity level
   * @param context Additional context information
   */
  const logMessage = useCallback(
    (
      message: string,
      level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info',
      context?: Record<string, any>,
    ) => {
      captureMessage(message, level, context);
    },
    [],
  );

  /**
   * Set user information for error context
   * @param userId User ID or null to clear
   * @param userData Additional user data
   */
  const setUser = useCallback(
    (
      userId: string | null,
      userData?: {
        email?: string;
        username?: string;
        subscription?: string;
      },
    ) => {
      setUserContext(userId, userData);
    },
    [],
  );

  /**
   * Add tags to the current scope
   * @param tags Tags to add
   */
  const addTags = useCallback((tags: Record<string, string>) => {
    setTags(tags);
  }, []);

  /**
   * Add a breadcrumb to track user actions
   * @param breadcrumb Breadcrumb information
   */
  const trackBreadcrumb = useCallback(
    (breadcrumb: {
      type?: string;
      category?: string;
      message: string;
      data?: Record<string, any>;
      level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
    }) => {
      addBreadcrumb(breadcrumb);
    },
    [],
  );

  /**
   * Start a performance transaction
   * @param name Transaction name
   * @param operation Operation type
   */
  const trackPerformance = useCallback((name: string, operation: string) => {
    return startTransaction(name, operation);
  }, []);

  /**
   * Check if error monitoring is available
   */
  const isAvailable = useCallback(() => {
    return isSentryInitialized();
  }, []);

  return {
    logError,
    logMessage,
    setUser,
    addTags,
    trackBreadcrumb,
    trackPerformance,
    isAvailable,
  };
};
