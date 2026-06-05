"""Async PostgreSQL connection pool with startup retry and schema bootstrap.

Cloud-agnostic: connects to any PostgreSQL via DATABASE_URL — AWS RDS,
GCP Cloud SQL, Azure Database for PostgreSQL, OCI, or local Docker.
"""
import asyncio
import logging

import asyncpg

from config import settings

log = logging.getLogger("auth-service.db")

_pool: asyncpg.Pool | None = None

# asyncpg wants the scheme without the SQLAlchemy-style +driver suffix.
def _normalise_dsn(dsn: str) -> str:
    return dsn.replace("postgresql+asyncpg://", "postgresql://").replace(
        "postgres://", "postgresql://"
    )


SCHEMA = """
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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
"""


async def connect() -> None:
    """Open the pool, retrying until the database is reachable."""
    global _pool
    dsn = _normalise_dsn(settings.DATABASE_URL)

    last_err: Exception | None = None
    for attempt in range(1, settings.DB_CONNECT_RETRIES + 1):
        try:
            _pool = await asyncpg.create_pool(
                dsn=dsn,
                min_size=settings.DB_POOL_MIN,
                max_size=settings.DB_POOL_MAX,
                command_timeout=10,
                # Recycle idle connections so we don't hold dead sockets after
                # a managed-DB failover (RDS/Cloud SQL rotate endpoints).
                max_inactive_connection_lifetime=300,
            )
            async with _pool.acquire() as conn:
                await conn.execute(SCHEMA)
            log.info("connected to PostgreSQL (attempt %d)", attempt)
            return
        except Exception as exc:  # noqa: BLE001
            last_err = exc
            log.warning(
                "DB connect failed (attempt %d/%d): %s",
                attempt, settings.DB_CONNECT_RETRIES, exc,
            )
            await asyncio.sleep(settings.DB_CONNECT_BACKOFF_SECONDS)

    raise RuntimeError(f"could not connect to PostgreSQL: {last_err}")


async def disconnect() -> None:
    if _pool is not None:
        await _pool.close()
        log.info("PostgreSQL pool closed")


def pool() -> asyncpg.Pool:
    if _pool is None:
        raise RuntimeError("database pool not initialised")
    return _pool


async def ping() -> bool:
    try:
        async with pool().acquire() as conn:
            await conn.execute("SELECT 1")
        return True
    except Exception:  # noqa: BLE001
        return False
