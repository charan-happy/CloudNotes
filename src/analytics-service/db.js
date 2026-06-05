'use strict'

const { Pool } = require('pg')
const log = require('./logger')

// Cloud-agnostic: DATABASE_URL targets any PostgreSQL (RDS / Cloud SQL / Azure / OCI).
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://cloudnotes:cloudnotes@localhost:5432/cloudnotes',
  max: parseInt(process.env.DB_POOL_MAX || '20', 10),
  min: parseInt(process.env.DB_POOL_MIN || '2', 10),
  idleTimeoutMillis: 300000,
  connectionTimeoutMillis: 10000,
  // Recycle connections so a managed-DB failover doesn't strand dead sockets.
  maxLifetimeSeconds: 1800,
})

pool.on('error', (err) => {
  log.error('idle client error', { error: err.message })
})

const SCHEMA = `
CREATE TABLE IF NOT EXISTS analytics_events (
    id         BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    user_id    VARCHAR(255),
    payload    JSONB        NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_analytics_type_time ON analytics_events (event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_user      ON analytics_events (user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created   ON analytics_events (created_at DESC);
`

async function connectWithRetry() {
  const retries = parseInt(process.env.DB_CONNECT_RETRIES || '10', 10)
  const backoffMs = parseInt(process.env.DB_CONNECT_BACKOFF_SECONDS || '2', 10) * 1000
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const client = await pool.connect()
      try {
        await client.query(SCHEMA)
      } finally {
        client.release()
      }
      log.info('connected to PostgreSQL', { attempt })
      return
    } catch (err) {
      log.warn('DB connect failed', { attempt, retries, error: err.message })
      await new Promise((r) => setTimeout(r, backoffMs))
    }
  }
  throw new Error('could not connect to PostgreSQL after retries')
}

async function ping() {
  try {
    await pool.query('SELECT 1')
    return true
  } catch {
    return false
  }
}

module.exports = { pool, connectWithRetry, ping }
