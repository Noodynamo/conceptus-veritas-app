import { ErrorMonitoringService } from './index';

// Create a singleton instance of the error monitoring service
export const errorMonitoringService = new ErrorMonitoringService();

// Export convenience functions
export const captureException = (
  error: Error, 
  context?: Record<string, any>
): string | null => {
  return errorMonitoringService.captureException(error, context);
};

export const captureMessage = (
  message: string,
  level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug',
  context?: Record<string, any>
): string | null => {
  return errorMonitoringService.captureMessage(
    message, 
    level,
    context
  );
};

export const setUser = (
  userId: string | null, 
  data?: Record<string, any>
): void => {
  errorMonitoringService.setUser(userId, data);
}; 