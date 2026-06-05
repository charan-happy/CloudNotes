// CloudNotes Note Service — production Gin app.
//
//   - PostgreSQL via pgxpool with startup retry and graceful shutdown
//   - JWT auth: every note is scoped to the authenticated user (token "sub")
//   - Prometheus /metrics, DB-aware /v1/health-status
//   - Cloud-agnostic: all config via env (RDS / Cloud SQL / Azure / OCI)
package main

import (
	"context"
	"errors"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func main() {
	logger := setupLogger()
	cfg := loadConfig()

	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	pool, err := newPool(ctx, cfg)
	cancel()
	if err != nil {
		logger.Error("startup failed", "error", err)
		os.Exit(1)
	}
	defer pool.Close()

	h := &Handler{pool: pool, timeout: cfg.RequestTimeout, jwtSecret: cfg.JWTSecret}

	if os.Getenv("GIN_MODE") == "" {
		gin.SetMode(gin.ReleaseMode)
	}
	r := gin.New()
	r.Use(gin.Recovery(), requestLogger(), metricsMiddleware(), corsMiddleware())

	// Unauthenticated infra endpoints.
	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "Note Service is running!"})
	})
	r.GET("/v1/health-status", h.healthStatus)
	r.GET("/metrics", gin.WrapH(promhttp.Handler()))

	// Authenticated note CRUD — JWT required, scoped to the caller.
	notes := r.Group("/v1/notes", authMiddleware(cfg.JWTSecret))
	{
		notes.GET("", h.listNotes)
		notes.POST("", h.createNote)
		notes.GET("/:id", h.getNote)
		notes.PUT("/:id", h.updateNote)
		notes.DELETE("/:id", h.deleteNote)

		// Sharing (owner-only)
		notes.POST("/:id/share", h.createShare)
		notes.GET("/:id/shares", h.listShares)
		notes.DELETE("/:id/shares/:shareId", h.revokeShare)
	}

	// Notes shared with the authenticated user.
	r.GET("/v1/shared-with-me", authMiddleware(cfg.JWTSecret), h.sharedWithMe)

	// Public share access (optional auth handled inside the handlers).
	shared := r.Group("/v1/shared")
	{
		shared.GET("/:token", h.getSharedNote)
		shared.PUT("/:token", h.updateSharedNote)
	}

	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           r,
		ReadHeaderTimeout: 5 * time.Second,
	}

	// Run server, then block on shutdown signal.
	go func() {
		logger.Info("listening", "port", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger.Error("listen failed", "error", err)
			os.Exit(1)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop
	logger.Info("shutdown signal received, draining connections")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), cfg.ShutdownTimeout)
	defer shutdownCancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		logger.Error("graceful shutdown failed", "error", err)
	}
	logger.Info("stopped cleanly")
}

func (h *Handler) healthStatus(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 3*time.Second)
	defer cancel()

	dbOK := h.pool.Ping(ctx) == nil
	var noteCount int64
	if dbOK {
		_ = h.pool.QueryRow(ctx, "SELECT COUNT(*) FROM notes").Scan(&noteCount)
	}
	status := "healthy"
	code := http.StatusOK
	if !dbOK {
		status, code = "degraded", http.StatusServiceUnavailable
	}
	c.JSON(code, gin.H{
		"service":    "note-service",
		"version":    "1.0.0",
		"status":     status,
		"language":   "Go",
		"framework":  "Gin",
		"database":   map[bool]string{true: "connected", false: "unreachable"}[dbOK],
		"note_count": noteCount,
		"endpoints": []gin.H{
			{"method": "GET", "path": "/v1/health-status", "description": "Readiness + DB health"},
			{"method": "GET", "path": "/metrics", "description": "Prometheus metrics"},
			{"method": "GET", "path": "/v1/notes", "description": "List caller's notes"},
			{"method": "POST", "path": "/v1/notes", "description": "Create a note"},
			{"method": "GET", "path": "/v1/notes/:id", "description": "Get note by ID"},
			{"method": "PUT", "path": "/v1/notes/:id", "description": "Update a note"},
			{"method": "DELETE", "path": "/v1/notes/:id", "description": "Delete a note"},
		},
	})
}

func corsMiddleware() gin.HandlerFunc {
	origins := getenv("CORS_ORIGINS", "http://localhost:3000")
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", origins)
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	}
}
