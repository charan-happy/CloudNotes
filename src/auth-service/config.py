"""Centralised configuration, read once from the environment."""
import os


class Settings:
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://cloudnotes:cloudnotes@localhost:5432/cloudnotes",
    )
    DB_POOL_MIN: int = int(os.getenv("DB_POOL_MIN", "5"))
    DB_POOL_MAX: int = int(os.getenv("DB_POOL_MAX", "20"))
    DB_CONNECT_RETRIES: int = int(os.getenv("DB_CONNECT_RETRIES", "10"))
    DB_CONNECT_BACKOFF_SECONDS: float = float(os.getenv("DB_CONNECT_BACKOFF_SECONDS", "2"))

    # JWT
    JWT_SECRET: str = os.getenv("JWT_SECRET", "dev-secret-change-in-prod")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_HOURS: int = int(os.getenv("JWT_EXPIRY_HOURS", "24"))

    # CORS — comma-separated list of allowed origins
    CORS_ORIGINS: list[str] = os.getenv(
        "CORS_ORIGINS", "http://localhost:3000"
    ).split(",")

    SERVICE_NAME: str = "auth-service"
    VERSION: str = "1.0.0"


settings = Settings()
