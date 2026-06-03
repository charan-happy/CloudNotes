-- CloudNotes database schema
-- Runs automatically when the postgres container first starts

CREATE TABLE IF NOT EXISTS users (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username     VARCHAR(30)  NOT NULL UNIQUE,
    email        VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(100),
    password     TEXT         NOT NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notes (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title      TEXT         NOT NULL,
    content    JSONB        NOT NULL DEFAULT '{}',
    tags       TEXT[]       NOT NULL DEFAULT '{}',
    icon       VARCHAR(10)  NOT NULL DEFAULT '📝',
    color      VARCHAR(20)  NOT NULL DEFAULT 'indigo',
    pinned     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_events (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type  VARCHAR(100) NOT NULL,
    user_id     VARCHAR(255),
    payload     JSONB        NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notes_user_id       ON notes (user_id);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at    ON notes (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events (event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events (created_at DESC);
