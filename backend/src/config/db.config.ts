/**
 * Database Configuration
 * 
 * This file provides the configuration for the database connection.
 * Values are read from environment variables with sensible defaults.
 */

// Database configuration interface
export interface DbConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  schema: string;
  ssl: boolean;
  logging: boolean | 'all' | string[];
}

// Load and validate environment variables
function getEnvOrDefault(key: string, defaultValue: string): string {
  const value = process.env[key];
  return value !== undefined ? value : defaultValue;
}

// Database configuration
export const config: DbConfig = {
  host: getEnvOrDefault('DB_HOST', 'localhost'),
  port: parseInt(getEnvOrDefault('DB_PORT', '5432'), 10),
  username: getEnvOrDefault('DB_USERNAME', 'postgres'),
  password: getEnvOrDefault('DB_PASSWORD', 'postgres'),
  database: getEnvOrDefault('DB_NAME', 'conceptus_veritas'),
  schema: getEnvOrDefault('DB_SCHEMA', 'public'),
  ssl: getEnvOrDefault('DB_SSL', 'false').toLowerCase() === 'true',
  logging: getEnvOrDefault('DB_LOGGING', 'false').toLowerCase() === 'true',
};

// Function to get a connection string (useful for some tools)
export function getConnectionString(): string {
  const { host, port, username, password, database } = config;
  const ssl = config.ssl ? '?sslmode=require' : '';
  return `postgresql://${username}:${password}@${host}:${port}/${database}${ssl}`;
}

// Validate the configuration
function validateConfig(config: DbConfig): void {
  if (!config.host) {
    throw new Error('Database host is required');
  }
  
  if (isNaN(config.port) || config.port <= 0) {
    throw new Error('Database port must be a positive number');
  }
  
  if (!config.database) {
    throw new Error('Database name is required');
  }
}

// Run validation
validateConfig(config);

// For debugging (never log credentials in production)
if (process.env.NODE_ENV === 'development') {
  console.log('Database configuration loaded (credentials masked):');
  console.log({
    ...config,
    password: '******',
  });
} 