import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { getEnvOrDefault } from '../../utils/env';
import { logger } from '../../utils/logger';

/**
 * Error Monitoring Service
 * 
 * Provides a centralized interface for error monitoring and reporting 
 * using Sentry with profiling integration for performance monitoring.
 */
export class ErrorMonitoringService {
  private enabled: boolean;
  private environment: string;
  private applicationName: string;
  
  constructor() {
    const dsn = getEnvOrDefault('SENTRY_DSN', '');
    this.environment = getEnvOrDefault('NODE_ENV', 'development');
    this.applicationName = getEnvOrDefault('APP_NAME', 'conceptus-veritas-backend');
    this.enabled = dsn.length > 0 && this.environment !== 'test';
    
    if (this.enabled) {
      this.initializeSentry(dsn);
    } else {
      logger.warn('Error monitoring service disabled: SENTRY_DSN not provided or running in test environment');
    }
  }
  
  /**
   * Initialize Sentry with configuration
   * 
   * @param dsn Sentry DSN
   */
  private initializeSentry(dsn: string): void {
    try {
      Sentry.init({
        dsn: dsn,
        environment: this.environment,
        release: `${this.applicationName}@${process.env.npm_package_version || '0.1.0'}`,
        integrations: [
          // Enable profiling to track performance
          new ProfilingIntegration(),
          // Add Express.js integration
          new Sentry.Integrations.Express({ app: undefined }), // Will be set later
          // Add automatic instrumentation for HTTP requests
          new Sentry.Integrations.Http({ tracing: true }),
        ],
        // Performance tracing options
        tracesSampleRate: this.environment === 'production' ? 0.1 : 1.0, // Sample 10% in production, all in development
        // Profiling options
        profilesSampleRate: this.environment === 'production' ? 0.1 : 1.0, // Sample 10% in production
        // Set max breadcrumbs to capture
        maxBreadcrumbs: 50,
        // Don't send personally identifiable information
        sendDefaultPii: false,
        // Enable debug in development
        debug: this.environment === 'development',
        // Automatically capture uncaught exceptions
        autoSessionTracking: true,
        // Before sending an event to Sentry
        beforeSend: (event) => {
          // Don't send PII or sensitive data
          this.sanitizeEvent(event);
          return event;
        },
      });
      
      logger.info('Error monitoring service initialized with Sentry');
    } catch (error) {
      logger.error('Failed to initialize Sentry:', error);
      this.enabled = false;
    }
  }
  
  /**
   * Sanitize an event to remove sensitive data
   * 
   * @param event Sentry event
   */
  private sanitizeEvent(event: Sentry.Event): void {
    // Example: Sanitize user email from stack trace
    if (event.exception && event.exception.values) {
      for (const exception of event.exception.values) {
        if (exception.stacktrace && exception.stacktrace.frames) {
          for (const frame of exception.stacktrace.frames) {
            // Sanitize variables in stack frames
            if (frame.vars) {
              this.sanitizeVars(frame.vars);
            }
          }
        }
      }
    }
    
    // Sanitize request data if present
    if (event.request && event.request.data) {
      this.sanitizeVars(event.request.data);
    }
  }
  
  /**
   * Sanitize variables to remove sensitive data
   * 
   * @param vars Variables object
   */
  private sanitizeVars(vars: Record<string, unknown>): void {
    const sensitiveKeys = ['password', 'token', 'auth', 'secret', 'email', 'phone'];
    
    for (const key in vars) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
        vars[key] = '[REDACTED]';
      } else if (typeof vars[key] === 'object' && vars[key] !== null) {
        // Recursively sanitize nested objects
        this.sanitizeVars(vars[key] as Record<string, unknown>);
      }
    }
  }
  
  /**
   * Set up Express.js request handler and error handler
   * Should be called after Express app is created
   * 
   * @param app Express application instance
   */
  public setupExpressHandlers(app: any): void {
    if (!this.enabled) {
      return;
    }
    
    // The request handler must be the first middleware on the app
    app.use(Sentry.Handlers.requestHandler());
    
    // TracingHandler creates a trace for every incoming request
    app.use(Sentry.Handlers.tracingHandler());
  }
  
  /**
   * Set up Express.js error handler
   * Should be called after all controllers but before any error handling middleware
   * 
   * @param app Express application instance
   */
  public setupErrorHandler(app: any): void {
    if (!this.enabled) {
      return;
    }
    
    // The error handler must be before any other error middleware and after all controllers
    app.use(Sentry.Handlers.errorHandler());
  }
  
  /**
   * Capture an exception
   * 
   * @param error Error object
   * @param context Additional context information
   */
  public captureException(error: Error, context?: Record<string, any>): string | null {
    if (!this.enabled) {
      logger.error('Error (not sent to Sentry):', error);
      return null;
    }
    
    return Sentry.captureException(error, { extra: context });
  }
  
  /**
   * Capture a message
   * 
   * @param message Message to capture
   * @param level Severity level
   * @param context Additional context information
   */
  public captureMessage(
    message: string, 
    level: Sentry.SeverityLevel = 'info',
    context?: Record<string, any>
  ): string | null {
    if (!this.enabled) {
      logger.log(level === 'info' ? 'info' : 'error', `Message (not sent to Sentry): ${message}`);
      return null;
    }
    
    return Sentry.captureMessage(message, {
      level,
      extra: context
    });
  }
  
  /**
   * Set user context for error reporting
   * 
   * @param userId User ID or null to clear user context
   * @param data Additional user data
   */
  public setUser(userId: string | null, data?: Record<string, any>): void {
    if (!this.enabled) {
      return;
    }
    
    if (userId) {
      Sentry.setUser({
        id: userId,
        ...data
      });
    } else {
      Sentry.setUser(null);
    }
  }
  
  /**
   * Add breadcrumb to track events leading up to an error
   * 
   * @param breadcrumb Breadcrumb data
   */
  public addBreadcrumb(breadcrumb: Sentry.Breadcrumb): void {
    if (!this.enabled) {
      return;
    }
    
    Sentry.addBreadcrumb(breadcrumb);
  }
  
  /**
   * Set tags for the current scope
   * 
   * @param tags Key-value pairs for tags
   */
  public setTags(tags: Record<string, string>): void {
    if (!this.enabled) {
      return;
    }
    
    Object.entries(tags).forEach(([key, value]) => {
      Sentry.setTag(key, value);
    });
  }
  
  /**
   * Start a performance transaction
   * 
   * @param name Transaction name
   * @param options Transaction options
   */
  public startTransaction(
    name: string,
    options?: Sentry.TransactionContext
  ): Sentry.Transaction | undefined {
    if (!this.enabled) {
      return undefined;
    }
    
    return Sentry.startTransaction({
      name,
      ...options
    });
  }
  
  /**
   * Close Sentry before application shutdown
   * This ensures all events are sent before the process exits
   */
  public async close(): Promise<boolean> {
    if (!this.enabled) {
      return true;
    }
    
    try {
      await Sentry.close(2000); // Wait 2 seconds for events to send
      return true;
    } catch (error) {
      logger.error('Error closing Sentry client:', error);
      return false;
    }
  }
  
  /**
   * Check if error monitoring is enabled
   */
  public isEnabled(): boolean {
    return this.enabled;
  }
} 