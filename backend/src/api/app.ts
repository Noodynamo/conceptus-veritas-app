import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorMonitoringService } from '../services/error/error-service';
import { logger } from '../utils/logger';

// Create Express app
const app = express();

// Initialize Sentry request handler (must be first)
errorMonitoringService.setupExpressHandlers(app);

// Standard middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// API routes
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Import and use route handlers
// import v1Routes from './v1';
// app.use('/api/v1', v1Routes);

// Example endpoint that triggers an error for testing Sentry
app.get('/api/test-error', (_req: Request, _res: Response) => {
  throw new Error('Test error for Sentry');
});

// Initialize Sentry error handler (must be after all controllers)
errorMonitoringService.setupErrorHandler(app);

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error:', err);
  
  res.status(500).json({
    error: {
      message: 'An unexpected error occurred',
      id: res.sentry // Sentry error ID, added by Sentry error handler
    }
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: {
      message: 'Not Found'
    }
  });
});

export default app; 