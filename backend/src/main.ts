import app from './api/app';
import { logger } from './utils/logger';
import { errorMonitoringService } from './services/error/error-service';
import { getEnvOrDefault } from './utils/env';

// Get port from environment or default to 3000
const PORT = parseInt(getEnvOrDefault('PORT', '3000'), 10);

// Start the server
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Handle graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}, shutting down gracefully...`);

  // Close the HTTP server
  server.close(async () => {
    logger.info('HTTP server closed');
    
    try {
      // Close Sentry client to flush events
      await errorMonitoringService.close();
      logger.info('Error monitoring service closed');
      
      // Close any other services/connections here
      // e.g., database connections

      logger.info('Shutdown complete');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  errorMonitoringService.captureException(error, { context: 'uncaughtException' });
  // Allow time for Sentry to send the error before exiting
  setTimeout(() => process.exit(1), 1000);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection:', reason);
  errorMonitoringService.captureException(
    reason instanceof Error ? reason : new Error(String(reason)),
    { context: 'unhandledRejection' }
  );
}); 