'use strict'

// CloudNotes Collaboration Service
// ─────────────────────────────────
// A Hocuspocus (Yjs) WebSocket server that powers real-time multiplayer editing.
//
//   • Each note is a "room" keyed by the note's UUID (documentName).
//   • onAuthenticate validates a JWT (owner / shared user) OR a share token,
//     and marks view-only connections read-only.
//   • The shared Yjs document is persisted to PostgreSQL (note_collab table) so
//     edits survive restarts and late joiners get the full history.
//
// Cloud-agnostic: DATABASE_URL + JWT_SECRET via env. Same Postgres as note-service.

const { Hocuspocus } = require('@hocuspocus/server')
const { Pool } = require('pg')
const Y = require('yjs')
const jwt = require('jsonwebtoken')
const log = require('./logger')

const PORT = parseInt(process.env.PORT || '8004', 10)
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-prod'
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://cloudnotes:cloudnotes@localhost:5432/cloudnotes',
  max: parseInt(process.env.DB_POOL_MAX || '10', 10),
})

async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS note_collab (
      note_id    UUID PRIMARY KEY,
      state      BYTEA       NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`)
}

// Decide what a connection may do on a given note.
// Returns { userId, name, permission: 'view'|'edit' } or null to reject.
async function resolvePermission(noteId, token) {
  if (!token) return null

  // Distinguish "not a JWT" (expected — try it as a public share token) from a
  // DB error (unexpected — fail closed so a missing table / blip can never be
  // mistaken for "authorized").
  let claims = null
  try {
    claims = jwt.verify(token, JWT_SECRET)
  } catch {
    /* not a JWT — fall through to the public share-token check below */
  }

  try {
    // 1) JWT — owner or a user the note was shared with.
    if (claims) {
      const userId = claims.sub
      const name = claims.username || 'User'

      const owner = await pool.query('SELECT 1 FROM notes WHERE id = $1 AND user_id = $2', [noteId, userId])
      if (owner.rowCount > 0) return { userId, name, permission: 'edit' }

      const shared = await pool.query(
        `SELECT permission FROM note_shares
         WHERE note_id = $1 AND shared_with_user_id = $2
           AND (expires_at IS NULL OR expires_at > NOW())
         ORDER BY (permission = 'edit') DESC LIMIT 1`,
        [noteId, userId],
      )
      if (shared.rowCount > 0) return { userId, name, permission: shared.rows[0].permission }

      // Pending invite addressed to this user's email (they had no account when
      // the note was shared). Match on the JWT email claim, then claim it.
      if (claims.email) {
        const pending = await pool.query(
          `SELECT id, permission FROM note_shares
           WHERE note_id = $1 AND shared_with_user_id IS NULL
             AND LOWER(shared_with_email) = LOWER($2)
             AND (expires_at IS NULL OR expires_at > NOW())
           ORDER BY (permission = 'edit') DESC LIMIT 1`,
          [noteId, claims.email],
        )
        if (pending.rowCount > 0) {
          await pool.query(
            'UPDATE note_shares SET shared_with_user_id = $1 WHERE id = $2 AND shared_with_user_id IS NULL',
            [userId, pending.rows[0].id],
          )
          return { userId, name, permission: pending.rows[0].permission }
        }
      }

      return null // valid token, but no access to this note
    }

    // 2) Public share token.
    const st = await pool.query(
      `SELECT permission, note_id::text FROM note_shares
       WHERE token = $1 AND (expires_at IS NULL OR expires_at > NOW())`,
      [token],
    )
    if (st.rowCount > 0 && st.rows[0].note_id === noteId) {
      return { userId: 'guest-' + Math.random().toString(36).slice(2, 7), name: 'Guest', permission: st.rows[0].permission }
    }

    return null
  } catch (err) {
    // DB unreachable, note_shares missing, etc. — fail closed: deny access.
    log.error('permission check failed; denying', { note: noteId, error: err.message })
    return null
  }
}

const server = new Hocuspocus({
  port: PORT,
  name: 'cloudnotes-collab',

  async onAuthenticate({ documentName, token, connection }) {
    const perm = await resolvePermission(documentName, token)
    if (!perm) {
      throw new Error('Not authorized to open this note')
    }
    // View-only participants can see live edits + cursors but cannot type.
    if (perm.permission === 'view') {
      connection.readOnly = true
    }
    log.info('connection authorized', { note: documentName, user: perm.name, permission: perm.permission })
    return { user: { id: perm.userId, name: perm.name, permission: perm.permission } }
  },

  // Seed the room from the last persisted Yjs state (if any).
  async onLoadDocument({ documentName, document }) {
    const { rows } = await pool.query('SELECT state FROM note_collab WHERE note_id = $1', [documentName])
    if (rows[0] && rows[0].state) {
      Y.applyUpdate(document, new Uint8Array(rows[0].state))
    }
    return document
  },

  // Persist the merged Yjs state (debounced by Hocuspocus).
  async onStoreDocument({ documentName, document }) {
    const state = Buffer.from(Y.encodeStateAsUpdate(document))
    await pool.query(
      `INSERT INTO note_collab (note_id, state, updated_at) VALUES ($1, $2, NOW())
       ON CONFLICT (note_id) DO UPDATE SET state = $2, updated_at = NOW()`,
      [documentName, state],
    )
  },
})

async function main() {
  await ensureSchema()
  await server.listen()
  log.info('collab-service listening', { port: PORT })
}

async function shutdown(signal) {
  log.info('shutdown signal received', { signal })
  try { await server.destroy() } catch { /* ignore */ }
  await pool.end()
  process.exit(0)
}
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

main().catch(err => { log.error('startup failed', { error: err.message }); process.exit(1) })
