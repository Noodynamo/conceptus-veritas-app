/**
 * Winston logger configuration for Conceptus Veritas application
 * 
 * This module configures a Winston logger with appropriate transports and formatting
 * for different environments (development, testing, production).
 * 
 * Usage:
 * ```
 * import logger from '@utils/logger';
 * 
 * logger.info('This is an informational message');
 * logger.error('This is an error message', { error: new Error('Something went wrong') });
 * ```
 */

import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Ensure logs directory exists
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Define console format (more readable for development)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
  })
);

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? 'debug' : 'info';
};

// Create transports
const transports = [
  // Console transport (all environments)
  new winston.transports.Console({
    format: consoleFormat,
  }),
  
  // Error log file (all environments)
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
  }),
  
  // Combined log file (all environments)
  new winston.transports.File({
    filename: path.join(logDir, 'combined.log'),
  }),
];

// Create logger instance
const logger = winston.createLogger({
  level: level(),
  levels,
  format: logFormat,
  transports,
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log'),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log'),
    }),
  ],
});

// Create a stream object for morgan HTTP request logger
const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

export { logger, stream };
export default logger; 