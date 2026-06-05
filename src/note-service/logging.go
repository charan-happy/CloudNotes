package main

import (
	"log/slog"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

// setupLogger installs a JSON slog logger as the default. One JSON object per
// line on stdout — ready for Loki / ELK / CloudWatch to parse.
func setupLogger() *slog.Logger {
	level := slog.LevelInfo
	if os.Getenv("LOG_LEVEL") == "debug" {
		level = slog.LevelDebug
	}
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: level}))
	logger = logger.With("service", "note-service")
	slog.SetDefault(logger)
	return logger
}

// requestLogger logs one structured line per HTTP request.
func requestLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()
		path := c.FullPath()
		if path == "" {
			path = c.Request.URL.Path
		}
		// Skip noise from scrapers hitting /metrics every few seconds.
		if path == "/metrics" {
			return
		}
		slog.Info("request",
			"method", c.Request.Method,
			"path", path,
			"status", c.Writer.Status(),
			"duration_ms", float64(time.Since(start).Microseconds())/1000.0,
			"client_ip", c.ClientIP(),
			"trace_id", c.GetHeader("X-Request-Id"),
		)
	}
}
