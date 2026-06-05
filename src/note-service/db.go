package main

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

const schema = `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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
CREATE INDEX IF NOT EXISTS idx_notes_user_updated ON notes (user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_user_pinned  ON notes (user_id, pinned);

-- Sharing: one row per share link. shared_with_user_id NULL = public link.
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
`

// newPool opens a pgx connection pool, retrying until the database is reachable,
// then ensures the schema exists.
func newPool(ctx context.Context, cfg Config) (*pgxpool.Pool, error) {
	poolCfg, err := pgxpool.ParseConfig(cfg.DatabaseURL)
	if err != nil {
		return nil, fmt.Errorf("parse DATABASE_URL: %w", err)
	}
	poolCfg.MaxConns = cfg.PoolMaxConns
	poolCfg.MinConns = cfg.PoolMinConns
	poolCfg.MaxConnIdleTime = 5 * time.Minute
	poolCfg.MaxConnLifetime = 30 * time.Minute // survive managed-DB failovers
	poolCfg.HealthCheckPeriod = 30 * time.Second

	var pool *pgxpool.Pool
	for attempt := 1; attempt <= cfg.ConnectRetries; attempt++ {
		pool, err = pgxpool.NewWithConfig(ctx, poolCfg)
		if err == nil {
			if err = pool.Ping(ctx); err == nil {
				break
			}
			pool.Close()
		}
		slog.Warn("DB connect failed", "attempt", attempt, "retries", cfg.ConnectRetries, "error", err.Error())
		time.Sleep(cfg.ConnectBackoff)
	}
	if err != nil {
		return nil, fmt.Errorf("could not connect to PostgreSQL: %w", err)
	}

	if _, err := pool.Exec(ctx, schema); err != nil {
		pool.Close()
		return nil, fmt.Errorf("schema bootstrap: %w", err)
	}
	slog.Info("connected to PostgreSQL")
	return pool, nil
}
