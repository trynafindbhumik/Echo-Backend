import dns from 'dns';
import pg from 'pg';
import logger from '../utils/logger.js';

// Prefer IPv4 over IPv6 to prevent ENETUNREACH network errors on Render
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const { Pool } = pg;

const connectionString =
  process.env.DATABASE_URL ||
  `postgres://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'echo_safety'}`;

const isCloudEnv = Boolean(process.env.DATABASE_URL || process.env.RENDER || process.env.NODE_ENV === 'production');

const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: isCloudEnv && process.env.DB_SSL !== 'false' ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
  logger.info('PostgreSQL spatial database pool connected.');
});

pool.on('error', (err) => {
  logger.error('Unexpected PostgreSQL pool error:', err);
});

/**
 * Executes a SQL query against the PostgreSQL pool.
 * @param {string} text - SQL query string
 * @param {Array<any>} [params] - Parametrized query values
 */
export const query = (text, params) => pool.query(text, params);
export default pool;


