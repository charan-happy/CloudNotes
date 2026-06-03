import time
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI(title="CloudNotes Auth Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Expose /metrics (Prometheus scrape endpoint)
Instrumentator().instrument(app).expose(app)

START_TIME = time.time()

# In-memory store (swap for real DB later)
users: dict[str, dict] = {}


class RegisterBody(BaseModel):
    username: str
    email: str
    password: str


@app.get("/")
def health():
    return {"status": "Auth Service is running!"}


@app.get("/v1/health-status")
def health_status():
    return {
        "service": "auth-service",
        "version": "1.0.0",
        "status": "healthy",
        "uptime_seconds": round(time.time() - START_TIME, 1),
        "registered_users": len(users),
        "endpoints": [
            {"method": "GET",  "path": "/",                 "description": "Simple health ping"},
            {"method": "GET",  "path": "/v1/health-status", "description": "Detailed health info"},
            {"method": "GET",  "path": "/metrics",          "description": "Prometheus metrics"},
            {"method": "GET",  "path": "/login",            "description": "Authenticate user"},
            {"method": "POST", "path": "/register",         "description": "Register new user"},
        ],
    }


@app.get("/login")
def login(username: str, password: str):
    user = users.get(username)
    if not user or user["password"] != password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"token": f"token-{username}-{user['email']}"}


@app.post("/register")
def register(body: RegisterBody):
    if body.username in users:
        raise HTTPException(status_code=409, detail="Username already taken")
    users[body.username] = {"email": body.email, "password": body.password}
    return {"token": f"token-{body.username}-{body.email}", "message": "Account created"}
