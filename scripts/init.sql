-- CloudNotes database schema
-- Runs automatically on first PostgreSQL container start (docker-entrypoint-initdb.d).
-- Idempotent: safe to re-run. Each service also verifies/creates its tables on boot.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()

-- ── users (owned by auth-service & user-service) ────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username      VARCHAR(30)  NOT NULL UNIQUE,
    email         VARCHAR(255) NOT NULL UNIQUE,
    display_name  VARCHAR(100),
    password_hash TEXT         NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users (LOWER(username));
CREATE INDEX IF NOT EXISTS idx_users_email    ON users (LOWER(email));

-- ── notes (owned by note-service) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notes (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID         NOT NULL,
    title      TEXT         NOT NULL DEFAULT '',
    content    JSONB        NOT NULL DEFAULT '{}'::jsonb,
    tags       TEXT[]       NOT NULL DEFAULT '{}',
    icon       VARCHAR(16)  NOT NULL DEFAULT '📝',
    color      VARCHAR(20)  NOT NULL DEFAULT 'indigo',
    cover      TEXT,
    note_theme VARCHAR(10)  NOT NULL DEFAULT 'inherit',
    pinned     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Composite index: the hot query is "all notes for a user, newest first".
CREATE INDEX IF NOT EXISTS idx_notes_user_updated ON notes (user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_user_pinned  ON notes (user_id, pinned);

-- ── note_shares (owned by note-service; consumed by collab-service) ──────────
-- One row per share link. shared_with_user_id NULL = public link.
CREATE TABLE IF NOT EXISTS note_shares (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id             UUID         NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    owner_id            UUID         NOT NULL,
    token               TEXT         NOT NULL UNIQUE,
    permission          VARCHAR(8)   NOT NULL DEFAULT 'view',
    shared_with_user_id UUID,
    password_hash       TEXT,
    expires_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shares_token ON note_shares (token);
CREATE INDEX IF NOT EXISTS idx_shares_note  ON note_shares (note_id);
CREATE INDEX IF NOT EXISTS idx_shares_with  ON note_shares (shared_with_user_id);

-- ── note_collab (owned by collab-service) ───────────────────────────────────
-- Persisted Yjs CRDT state per note, so edits survive restarts and late joiners
-- get full history. collab-service also creates this on boot (safety net).
CREATE TABLE IF NOT EXISTS note_collab (
    note_id    UUID PRIMARY KEY REFERENCES notes(id) ON DELETE CASCADE,
    state      BYTEA       NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── analytics_events (owned by analytics-service) ───────────────────────────
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
