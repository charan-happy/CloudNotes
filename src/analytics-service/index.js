'use strict'

const express = require('express')
const cors = require('cors')
const client = require('prom-client')

const { pool, connectWithRetry, ping } = require('./db')
const log = require('./logger')

const app = express()
const START_TIME = Date.now()
const PORT = process.env.PORT || 8003

app.use(cors({ origin: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',') }))
app.use(express.json({ limit: '256kb' }))

// ── Prometheus metrics ──────────────────────────────────────────────────────
const register = new client.Registry()
client.collectDefaultMetrics({ register })

const httpRequests = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests by method, route and status.',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
})
const httpDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request latency in seconds.',
  labelNames: ['method', 'route'],
  registers: [register],
})

// Metrics + structured access log middleware.
app.use((req, res, next) => {
  const end = httpDuration.startTimer()
  res.on('finish', () => {
    const route = req.route ? req.baseUrl + req.route.path : req.path
    end({ method: req.method, route })
    httpRequests.inc({ method: req.method, route, status: res.statusCode })
    log.info('request', {
      method: req.method,
      route,
      status: res.statusCode,
    })
  })
  next()
})

// ── Routes ──────────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({ status: 'Analytics Service is running!' })
})

app.get('/v1/health-status', async (_req, res) => {
  const dbOk = await ping()
  let eventCount = 0
  let activeUsers = 0
  if (dbOk) {
    try {
      const counts = await pool.query(`
        SELECT
          (SELECT COUNT(*) FROM analytics_events)                                        AS events,
          (SELECT COUNT(DISTINCT user_id) FROM analytics_events
             WHERE created_at > NOW() - INTERVAL '5 minutes' AND user_id IS NOT NULL)    AS active
      `)
      eventCount = parseInt(counts.rows[0].events, 10)
      activeUsers = parseInt(counts.rows[0].active, 10)
    } catch (err) {
      log.error('health query failed', { error: err.message })
    }
  }
  res.status(dbOk ? 200 : 503).json({
    service: 'analytics-service',
    version: '1.0.0',
    status: dbOk ? 'healthy' : 'degraded',
    language: 'Node.js',
    framework: 'Express',
    database: dbOk ? 'connected' : 'unreachable',
    uptime_seconds: Math.round((Date.now() - START_TIME) / 1000),
    event_count: eventCount,
    active_users: activeUsers,
    endpoints: [
      { method: 'POST', path: '/v1/events', description: 'Track an event' },
      { method: 'GET', path: '/v1/events', description: 'List events (filterable)' },
      { method: 'GET', path: '/v1/stats', description: 'Aggregated stats' },
      { method: 'GET', path: '/v1/stats/top-events', description: 'Top event types' },
      { method: 'GET', path: '/metrics', description: 'Prometheus metrics' },
    ],
  })
})

app.post('/v1/events', async (req, res) => {
  const { event_type, user_id, payload } = req.body || {}
  if (!event_type || typeof event_type !== 'string') {
    return res.status(400).json({ error: 'event_type is required' })
  }
  try {
    const result = await pool.query(
      `INSERT INTO analytics_events (event_type, user_id, payload)
       VALUES ($1, $2, $3)
       RETURNING id, event_type, user_id, payload, created_at`,
      [event_type, user_id || null, payload || {}]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    log.error('insert event failed', { error: err.message })
    res.status(500).json({ error: 'failed to record event' })
  }
})

app.get('/v1/events', async (req, res) => {
  const { event_type, user_id } = req.query
  const limit = Math.min(parseInt(req.query.limit || '100', 10) || 100, 1000)

  const where = []
  const params = []
  if (event_type) { params.push(event_type); where.push(`event_type = $${params.length}`) }
  if (user_id) { params.push(user_id); where.push(`user_id = $${params.length}`) }
  params.push(limit)

  const sql = `
    SELECT id, event_type, user_id, payload, created_at
    FROM analytics_events
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY created_at DESC
    LIMIT $${params.length}`

  try {
    const result = await pool.query(sql, params)
    res.json({ events: result.rows, count: result.rowCount })
  } catch (err) {
    log.error('list events failed', { error: err.message })
    res.status(500).json({ error: 'failed to list events' })
  }
})

app.get('/v1/stats', async (_req, res) => {
  try {
    const [totals, byType] = await Promise.all([
      pool.query(`
        SELECT
          (SELECT COUNT(*) FROM analytics_events)                                       AS total_events,
          (SELECT COUNT(DISTINCT user_id) FROM analytics_events WHERE user_id IS NOT NULL) AS unique_users,
          (SELECT COUNT(*) FROM analytics_events WHERE created_at > NOW() - INTERVAL '24 hours') AS events_last_24h,
          (SELECT COUNT(DISTINCT user_id) FROM analytics_events
             WHERE created_at > NOW() - INTERVAL '5 minutes' AND user_id IS NOT NULL)    AS active_users
      `),
      pool.query(`SELECT event_type, COUNT(*)::int AS count FROM analytics_events GROUP BY event_type`),
    ])
    const t = totals.rows[0]
    const by_event_type = {}
    byType.rows.forEach((r) => { by_event_type[r.event_type] = r.count })
    res.json({
      total_events: parseInt(t.total_events, 10),
      unique_users: parseInt(t.unique_users, 10),
      events_last_24h: parseInt(t.events_last_24h, 10),
      active_users: parseInt(t.active_users, 10),
      by_event_type,
    })
  } catch (err) {
    log.error('stats failed', { error: err.message })
    res.status(500).json({ error: 'failed to compute stats' })
  }
})

app.get('/v1/stats/top-events', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT event_type, COUNT(*)::int AS count
      FROM analytics_events
      GROUP BY event_type
      ORDER BY count DESC
      LIMIT 10`)
    res.json({ top_events: result.rows })
  } catch (err) {
    log.error('top-events failed', { error: err.message })
    res.status(500).json({ error: 'failed to compute top events' })
  }
})

app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType)
  res.end(await register.metrics())
})

// ── Startup + graceful shutdown ──────────────────────────────────────────────
let server
async function start() {
  await connectWithRetry()
  server = app.listen(PORT, () => log.info('analytics-service listening', { port: PORT }))
}

async function shutdown(signal) {
  log.info('shutdown signal received', { signal })
  if (server) {
    await new Promise((resolve) => server.close(resolve))
  }
  await pool.end()
  log.info('stopped cleanly')
  process.exit(0)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

start().catch((err) => {
  log.error('startup failed', { error: err.message })
  process.exit(1)
})
