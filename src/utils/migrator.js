import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';
import logger from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATIONS_DIR = path.resolve(__dirname, '../../migrations');

/**
 * Ensures the migration tracking table exists and runs any unapplied .sql migrations.
 */
export const runMigrations = async () => {
  logger.info('📦 Checking database migrations...');

  let client;
  try {
    client = await pool.connect();

    // 1. Create tracking table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Fetch list of already executed migrations
    const { rows } = await client.query('SELECT name FROM schema_migrations;');
    const executedMigrations = new Set(rows.map((row) => row.name));

    // 3. Read migration files from directory
    let files = [];
    try {
      files = await fs.readdir(MIGRATIONS_DIR);
    } catch (err) {
      if (err.code === 'ENOENT') {
        logger.warn(`Migrations directory not found at ${MIGRATIONS_DIR}`);
        return;
      }
      throw err;
    }

    const sqlFiles = files
      .filter((file) => file.endsWith('.sql'))
      .sort((a, b) => a.localeCompare(b));

    const pendingMigrations = sqlFiles.filter((file) => !executedMigrations.has(file));

    if (pendingMigrations.length === 0) {
      logger.info('✅ Database schema is up to date. No pending migrations.');
      return;
    }

    logger.info(`🚀 Found ${pendingMigrations.length} pending migration(s): ${pendingMigrations.join(', ')}`);

    // 4. Run each pending migration in a transaction
    for (const file of pendingMigrations) {
      const filePath = path.join(MIGRATIONS_DIR, file);
      const sqlContent = await fs.readFile(filePath, 'utf-8');

      logger.info(`⏳ Executing migration: ${file}...`);
      try {
        await client.query('BEGIN');
        await client.query(sqlContent);
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        logger.info(`✅ Successfully applied migration: ${file}`);
      } catch (migrationErr) {
        await client.query('ROLLBACK');
        logger.error(`❌ Migration failed (${file}): ${migrationErr.message}`);
        throw migrationErr;
      }
    }

    logger.info('🎉 All database migrations executed successfully.');
  } catch (error) {
    logger.error(`🚨 Migration process failed: ${error.message}`);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
};

// Allow direct CLI execution (e.g., node src/utils/migrator.js or npm run migrate)
const isDirectExecution = process.argv[1] && path.resolve(process.argv[1]) === __filename;
if (isDirectExecution) {
  runMigrations()
    .then(() => {
      logger.info('Migration runner CLI finished successfully.');
      process.exit(0);
    })
    .catch((err) => {
      logger.error('Migration runner CLI failed:', err);
      process.exit(1);
    });
}
