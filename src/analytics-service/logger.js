'use strict'

// Structured JSON logger — one JSON object per line, ready for ELK / Loki / CloudWatch.
// No dependency; keeps the image small.

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 }
const MIN_LEVEL = LEVELS[process.env.LOG_LEVEL || 'info'] || LEVELS.info

function emit(level, msg, fields = {}) {
  if (LEVELS[level] < MIN_LEVEL) return
  const line = {
    ts: new Date().toISOString(),
    level,
    service: 'analytics-service',
    msg,
    ...fields,
  }
  process.stdout.write(JSON.stringify(line) + '\n')
}

module.exports = {
  debug: (msg, f) => emit('debug', msg, f),
  info: (msg, f) => emit('info', msg, f),
  warn: (msg, f) => emit('warn', msg, f),
  error: (msg, f) => emit('error', msg, f),
}
