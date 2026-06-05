"""CloudNotes Auth Service — production FastAPI app.

- Real PostgreSQL (asyncpg pool) with startup retry and graceful shutdown
- bcrypt password hashing, HS256 JWT sessions
- Prometheus /metrics, DB-aware /v1/health-status
- Cloud-agnostic: all config via env vars (runs on RDS/Cloud SQL/Azure/OCI)
"""
import time
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from prometheus_fastapi_instrumentator import Instrumentator
from pydantic import BaseModel, EmailStr, Field

import db
import jwt
from config import settings
from logging_config import setup_logging
from security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)

log = setup_logging()

START_TIME = time.time()
bearer = HTTPBearer(auto_error=False)


@asynccontextmanager
async def lifespan(_: FastAPI):
    await db.connect()
    yield
    await db.disconnect()


app = FastAPI(title="CloudNotes Auth Service", version=settings.VERSION, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

Instrumentator().instrument(app).expose(app)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    if request.url.path != "/metrics":  # skip scrape noise
        log.info(
            "request",
            extra={"extra_fields": {
                "method": request.method,
                "path": request.url.path,
                "status": response.status_code,
                "duration_ms": round((time.perf_counter() - start) * 1000, 2),
                "client_ip": request.client.host if request.client else None,
            }},
        )
    return response


# ── Schemas ──────────────────────────────────────────────────────────────────
class RegisterBody(BaseModel):
    username: str = Field(min_length=3, max_length=30)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginBody(BaseModel):
    username: str = Field(min_length=1)
    password: str = Field(min_length=1)


class TokenResponse(BaseModel):
    token: str
    user_id: str
    username: str
    email: str


# ── Routes ───────────────────────────────────────────────────────────────────
@app.get("/")
async def health():
    return {"status": "Auth Service is running!"}


@app.get("/v1/health-status")
async def health_status():
    db_ok = await db.ping()
    user_count = 0
    if db_ok:
        async with db.pool().acquire() as conn:
            user_count = await conn.fetchval("SELECT COUNT(*) FROM users")
    return {
        "service": settings.SERVICE_NAME,
        "version": settings.VERSION,
        "status": "healthy" if db_ok else "degraded",
        "language": "Python",
        "framework": "FastAPI",
        "database": "connected" if db_ok else "unreachable",
        "uptime_seconds": round(time.time() - START_TIME, 1),
        "registered_users": user_count,
        "endpoints": [
            {"method": "GET",  "path": "/",                 "description": "Liveness ping"},
            {"method": "GET",  "path": "/v1/health-status", "description": "Readiness + DB health"},
            {"method": "GET",  "path": "/metrics",          "description": "Prometheus metrics"},
            {"method": "POST", "path": "/register",         "description": "Register new user"},
            {"method": "POST", "path": "/login",            "description": "Authenticate, returns JWT"},
            {"method": "GET",  "path": "/me",               "description": "Current user from JWT"},
        ],
    }


@app.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterBody):
    pw_hash = hash_password(body.password)
    async with db.pool().acquire() as conn:
        try:
            row = await conn.fetchrow(
                """
                INSERT INTO users (username, email, display_name, password_hash)
                VALUES ($1, $2, $3, $4)
                RETURNING id, username, email
                """,
                body.username, body.email, body.username, pw_hash,
            )
        except Exception as exc:  # asyncpg.UniqueViolationError and friends
            msg = str(exc).lower()
            if "username" in msg:
                raise HTTPException(status.HTTP_409_CONFLICT, "Username already taken")
            if "email" in msg:
                raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")
            log.exception("register failed")
            raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "Registration failed")

    token = create_access_token(str(row["id"]), row["username"], row["email"])
    return TokenResponse(token=token, user_id=str(row["id"]), username=row["username"], email=row["email"])


@app.post("/login", response_model=TokenResponse)
async def login(body: LoginBody):
    async with db.pool().acquire() as conn:
        row = await conn.fetchrow(
            "SELECT id, username, email, password_hash FROM users WHERE LOWER(username) = LOWER($1)",
            body.username,
        )
    if not row or not verify_password(body.password, row["password_hash"]):
        # Same response whether user is missing or password is wrong (no user enumeration).
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid username or password")

    token = create_access_token(str(row["id"]), row["username"], row["email"])
    return TokenResponse(token=token, user_id=str(row["id"]), username=row["username"], email=row["email"])


@app.get("/me")
async def me(creds: HTTPAuthorizationCredentials | None = Depends(bearer)):
    if creds is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing bearer token")
    try:
        payload = decode_access_token(creds.credentials)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token")
    return {"user_id": payload["sub"], "username": payload["username"], "email": payload["email"]}
