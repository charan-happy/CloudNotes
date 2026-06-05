package main

import (
	"os"
	"strconv"
	"time"
)

// Config holds all runtime configuration, read once from the environment.
// Cloud-agnostic: DATABASE_URL targets any PostgreSQL (RDS / Cloud SQL / Azure / OCI).
type Config struct {
	Port            string
	DatabaseURL     string
	JWTSecret       string
	PoolMaxConns    int32
	PoolMinConns    int32
	ConnectRetries  int
	ConnectBackoff  time.Duration
	RequestTimeout  time.Duration
	ShutdownTimeout time.Duration
}

func loadConfig() Config {
	return Config{
		Port:            getenv("PORT", "8001"),
		DatabaseURL:     getenv("DATABASE_URL", "postgresql://cloudnotes:cloudnotes@localhost:5432/cloudnotes"),
		JWTSecret:       getenv("JWT_SECRET", "dev-secret-change-in-prod"),
		PoolMaxConns:    int32(getenvInt("DB_POOL_MAX", 20)),
		PoolMinConns:    int32(getenvInt("DB_POOL_MIN", 5)),
		ConnectRetries:  getenvInt("DB_CONNECT_RETRIES", 10),
		ConnectBackoff:  time.Duration(getenvInt("DB_CONNECT_BACKOFF_SECONDS", 2)) * time.Second,
		RequestTimeout:  time.Duration(getenvInt("REQUEST_TIMEOUT_SECONDS", 10)) * time.Second,
		ShutdownTimeout: time.Duration(getenvInt("SHUTDOWN_TIMEOUT_SECONDS", 15)) * time.Second,
	}
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getenvInt(key string, fallback int) int {
	if v := os.Getenv(key); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}
	return fallback
}
