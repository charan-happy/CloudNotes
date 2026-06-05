'use strict'

// Structured JSON logger — one object per line for ELK / Loki / CloudWatch.
const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 }
const MIN = LEVELS[process.env.LOG_LEVEL || 'info'] || LEVELS.info

function emit(level, msg, fields = {}) {
  if (LEVELS[level] < MIN) return
  process.stdout.write(JSON.stringify({ ts: new Date().toISOString(), level, service: 'collab-service', msg, ...fields }) + '\n')
}

module.exports = {
  debug: (m, f) => emit('debug', m, f),
  info: (m, f) => emit('info', m, f),
  warn: (m, f) => emit('warn', m, f),
  error: (m, f) => emit('error', m, f),
}
