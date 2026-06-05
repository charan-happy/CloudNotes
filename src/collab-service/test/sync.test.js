'use strict'

// Integration test for collab-service.
// Self-contained: seeds its own fixtures, spawns the real server as a child
// process, then proves the full multiplayer path over the wire:
//   1. two Yjs clients connect + sync
//   2. edits propagate A↔B and the documents converge (CRDT)
//   3. state persists to Postgres (a fresh client loads it after both leave)
//   4. a valid JWT for a non-owner is rejected — cross-user isolation enforced
//
// Requires a reachable Postgres. Configure via env (same as the service):
//   DATABASE_URL  default postgresql://cloudnotes:cloudnotes@localhost:5432/cloudnotes
//   JWT_SECRET    default a 32+ char dev secret
//
//   npm test

const assert = require('node:assert')
const { spawn } = require('node:child_process')
const path = require('node:path')
const Y = require('yjs')
const { HocuspocusProvider } = require('@hocuspocus/provider')
const jwt = require('jsonwebtoken')
const WebSocket = require('ws')
const { Pool } = require('pg')

const PORT = parseInt(process.env.TEST_PORT || '8099', 10)
const URL = `ws://127.0.0.1:${PORT}`
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://cloudnotes:cloudnotes@localhost:5432/cloudnotes'
const JWT_SECRET = process.env.JWT_SECRET || 'cloudnotes-local-dev-secret-please-32plus-chars'

// Deterministic, test-only fixtures (won't collide with real data).
const USER_ID = '00000000-0000-0000-0000-0000000000aa'
const NOTE_ID = '00000000-0000-0000-0000-0000000000bb'

const pool = new Pool({ connectionString: DATABASE_URL })

const waitFor = (cond, ms = 5000, what = 'condition') =>
  new Promise((resolve, reject) => {
    const start = Date.now()
    const t = setInterval(() => {
      if (cond()) { clearInterval(t); resolve() }
      else if (Date.now() - start > ms) { clearInterval(t); reject(new Error(`timeout waiting for ${what}`)) }
    }, 50)
  })

async function seed() {
  await pool.query(
    `INSERT INTO users (id, username, email, password_hash)
     VALUES ($1, 'collab-test', 'collab-test@local', 'x')
     ON CONFLICT (id) DO NOTHING`,
    [USER_ID],
  )
  await pool.query(
    `INSERT INTO notes (id, user_id, title)
     VALUES ($1, $2, 'Collab integration test')
     ON CONFLICT (id) DO NOTHING`,
    [NOTE_ID, USER_ID],
  )
  // Start each run from a clean CRDT state so persistence assertions are exact.
  await pool.query('DELETE FROM note_collab WHERE note_id = $1', [NOTE_ID])
}

async function cleanup() {
  await pool.query('DELETE FROM note_collab WHERE note_id = $1', [NOTE_ID])
  await pool.query('DELETE FROM notes WHERE id = $1', [NOTE_ID])
  await pool.query('DELETE FROM users WHERE id = $1', [USER_ID])
}

function startServer() {
  const child = spawn('node', [path.join(__dirname, '..', 'index.js')], {
    env: { ...process.env, PORT: String(PORT), DATABASE_URL, JWT_SECRET },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  const ready = new Promise((resolve, reject) => {
    const onData = d => { if (d.toString().includes('listening')) resolve() }
    child.stdout.on('data', onData)
    child.stderr.on('data', onData)
    child.on('exit', code => reject(new Error(`server exited early (code ${code})`)))
    setTimeout(() => reject(new Error('server did not become ready in time')), 8000)
  })
  return { child, ready }
}

function mkClient(token, onAuthenticationFailed) {
  const doc = new Y.Doc()
  const provider = new HocuspocusProvider({
    url: URL, name: NOTE_ID, document: doc, token,
    WebSocketPolyfill: WebSocket,
    onAuthenticationFailed,
  })
  return { doc, provider, text: doc.getText('content') }
}

async function main() {
  await seed()
  const { child, ready } = startServer()
  await ready

  try {
    const token = jwt.sign({ sub: USER_ID, username: 'collab-test' }, JWT_SECRET, { expiresIn: '1h' })

    // 1) connect + sync
    const a = mkClient(token)
    const b = mkClient(token)
    await waitFor(() => a.provider.isSynced && b.provider.isSynced, 5000, 'both clients synced')

    // 2) bidirectional propagation + convergence
    a.text.insert(0, 'Hello from A. ')
    await waitFor(() => b.text.toString().includes('Hello from A.'), 5000, 'A→B propagation')
    b.text.insert(b.text.length, 'And B replies.')
    await waitFor(() => a.text.toString().includes('And B replies.'), 5000, 'B→A propagation')
    assert.strictEqual(a.text.toString(), b.text.toString(), 'documents must converge')
    const converged = a.text.toString()

    a.provider.destroy(); b.provider.destroy()

    // 3) persistence — give the server its debounce window, then reconnect fresh
    await new Promise(r => setTimeout(r, 1500))
    const c = mkClient(token)
    await waitFor(() => c.provider.isSynced, 5000, 'reconnecting client synced')
    await waitFor(() => c.text.toString() === converged, 5000, 'persisted state loaded')
    c.provider.destroy()

    // 4) auth is enforced — a valid JWT for a user who neither owns nor was
    //    shared the note must be rejected (cross-user isolation).
    let denied = false
    const intruderToken = jwt.sign(
      { sub: '99999999-9999-9999-9999-999999999999', username: 'intruder' },
      JWT_SECRET, { expiresIn: '1h' },
    )
    const intruder = mkClient(intruderToken, () => { denied = true })
    await waitFor(() => denied, 5000, 'unauthorized (non-owner) client rejected')
    intruder.provider.destroy()

    console.log('PASS: connect+sync, A↔B convergence, Postgres persistence, auth enforced')
  } finally {
    child.kill('SIGTERM')
    await cleanup()
    await pool.end()
  }
}

main().then(() => process.exit(0)).catch(err => {
  console.error('FAIL:', err.message)
  process.exit(1)
})
