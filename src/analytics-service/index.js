'use strict'

const express = require('express')
const cors    = require('cors')
const client  = require('prom-client')

const app = express()
const START_TIME = Date.now()

app.use(cors())
app.use(express.json())

// ── Prometheus metrics ──────────────────────────────────────────────────────
const register = new client.Registry()
client.collectDefaultMetrics({ register })

const eventCounter = new client.Counter({
  name:       'analytics_events_total',
  help:       'Total analytics events received',
  labelNames: ['event_type'],
  registers:  [register],
})

const activeUsersGauge = new client.Gauge({
  name:      'analytics_active_users',
  help:      'Approximated number of active users (last 5 min)',
  registers: [register],
})

// ── In-memory event store ───────────────────────────────────────────────────
const events = []    // { id, event_type, user_id, payload, timestamp }
const sessions = {}  // user_id → last_seen timestamp

function genId () {
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

function refreshActiveUsers () {
  const cutoff = Date.now() - 5 * 60 * 1000
  const active = Object.values(sessions).filter(t => t > cutoff).length
  activeUsersGauge.set(active)
}

// ── Routes ──────────────────────────────────────────────────────────────────

app.get('/', (_req, res) => {
  res.json({ status: 'Analytics Service is running!' })
})

app.get('/v1/health-status', (_req, res) => {
  refreshActiveUsers()
  res.json({
    service:       'analytics-service',
    version:       '1.0.0',
    status:        'healthy',
    language:      'Node.js',
    framework:     'Express',
    event_count:   events.length,
    active_users:  Object.values(sessions).filter(t => t > Date.now() - 300_000).length,
    uptime_seconds: Math.round((Date.now() - START_TIME) / 1000),
    endpoints: [
      { method: 'POST', path: '/v1/events',         description: 'Track an event' },
      { method: 'GET',  path: '/v1/events',          description: 'List events (with filter)' },
      { method: 'GET',  path: '/v1/stats',           description: 'Aggregated stats' },
      { method: 'GET',  path: '/v1/stats/top-events',description: 'Top event types' },
      { method: 'GET',  path: '/metrics',            description: 'Prometheus metrics' },
    ],
  })
})

// Track an event
app.post('/v1/events', (req, res) => {
  const { event_type, user_id, payload } = req.body
  if (!event_type) return res.status(400).json({ error: 'event_type is required' })

  const evt = { id: genId(), event_type, user_id: user_id || 'anonymous', payload: payload || {}, timestamp: new Date().toISOString() }
  events.push(evt)
  eventCounter.inc({ event_type })

  if (user_id) sessions[user_id] = Date.now()

  res.status(201).json(evt)
})

// List events with optional filter
app.get('/v1/events', (req, res) => {
  const { event_type, user_id, limit = 100 } = req.query
  let result = [...events]
  if (event_type) result = result.filter(e => e.event_type === event_type)
  if (user_id)    result = result.filter(e => e.user_id    === user_id)
  result = result.slice(-Number(limit)).reverse()
  res.json({ events: result, count: result.length })
})

// Aggregated stats
app.get('/v1/stats', (req, res) => {
  refreshActiveUsers()
  const byType = {}
  events.forEach(e => { byType[e.event_type] = (byType[e.event_type] || 0) + 1 })

  const uniqueUsers = new Set(events.map(e => e.user_id)).size
  const last24h = events.filter(e => Date.parse(e.timestamp) > Date.now() - 86_400_000).length

  res.json({
    total_events:  events.length,
    unique_users:  uniqueUsers,
    events_last_24h: last24h,
    active_users:  Object.values(sessions).filter(t => t > Date.now() - 300_000).length,
    by_event_type: byType,
  })
})

// Top event types ranked
app.get('/v1/stats/top-events', (_req, res) => {
  const counts = {}
  events.forEach(e => { counts[e.event_type] = (counts[e.event_type] || 0) + 1 })
  const ranked = Object.entries(counts)
    .map(([type, count]) => ({ event_type: type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
  res.json({ top_events: ranked })
})

// Prometheus scrape endpoint
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType)
  res.end(await register.metrics())
})

// ── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8003
app.listen(PORT, () => console.log(`Analytics service running on :${PORT}`))
