import React, { useEffect, ReactNode } from 'react';
import { initializeErrorMonitoring } from '../services/error';

interface ErrorMonitoringProviderProps {
  children: ReactNode;
}

/**
 * Error Monitoring Provider component
 * Initializes Sentry with the configured DSN
 * Wrap your app with this component to enable error monitoring
 */
export const ErrorMonitoringProvider: React.FC<ErrorMonitoringProviderProps> = ({ children }) => {
  useEffect(() => {
    const initSentry = async () => {
      await initializeErrorMonitoring();
    };

    initSentry();
  }, []);

  return <>{children}</>;
};
