import { DataSource } from 'typeorm';
import { config } from '../config/db.config';
import path from 'path';

/**
 * TypeORM Data Source Configuration
 * 
 * This file defines the database connection configuration for TypeORM.
 * It's used for both application runtime and migrations.
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.host,
  port: config.port,
  username: config.username,
  password: config.password,
  database: config.database,
  schema: config.schema,
  ssl: config.ssl,
  entities: [path.join(__dirname, '..', 'models', '**', '*.entity.{js,ts}')],
  migrations: [path.join(__dirname, 'migrations', '*.{js,ts}')],
  synchronize: false, // Never set to true in production
  logging: config.logging,
  applicationName: 'conceptus-veritas-backend',
  migrationsTableName: '_migrations',
});

// This is used when the file is executed directly (for CLI commands)
if (require.main === module) {
  AppDataSource.initialize()
    .then(() => {
      console.log('Data Source has been initialized');
    })
    .catch((err) => {
      console.error('Error during Data Source initialization', err);
    });
} 