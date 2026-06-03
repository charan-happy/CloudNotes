package main

import (
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Note struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	Title     string    `json:"title"     binding:"required"`
	Content   string    `json:"content"`
	Tags      []string  `json:"tags"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type CreateNoteRequest struct {
	UserID  string   `json:"user_id"  binding:"required"`
	Title   string   `json:"title"    binding:"required"`
	Content string   `json:"content"`
	Tags    []string `json:"tags"`
}

type UpdateNoteRequest struct {
	Title   *string  `json:"title"`
	Content *string  `json:"content"`
	Tags    []string `json:"tags"`
}

// In-memory store — swap for PostgreSQL (see README)
var (
	store = map[string]*Note{}
	mu    sync.RWMutex
)

func main() {
	r := gin.Default()

	// CORS
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	})

	r.GET("/", health)
	r.GET("/v1/health-status", healthDetail)

	v1 := r.Group("/v1/notes")
	{
		v1.GET("", listNotes)
		v1.POST("", createNote)
		v1.GET("/:id", getNote)
		v1.PUT("/:id", updateNote)
		v1.DELETE("/:id", deleteNote)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8001"
	}
	r.Run(":" + port)
}

func health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "Note Service is running!"})
}

func healthDetail(c *gin.Context) {
	mu.RLock()
	count := len(store)
	mu.RUnlock()
	c.JSON(http.StatusOK, gin.H{
		"service": "note-service",
		"version": "1.0.0",
		"status":  "healthy",
		"language": "Go",
		"framework": "Gin",
		"note_count": count,
		"endpoints": []gin.H{
			{"method": "GET",    "path": "/v1/notes",     "description": "List all notes"},
			{"method": "POST",   "path": "/v1/notes",     "description": "Create a note"},
			{"method": "GET",    "path": "/v1/notes/:id", "description": "Get note by ID"},
			{"method": "PUT",    "path": "/v1/notes/:id", "description": "Update a note"},
			{"method": "DELETE", "path": "/v1/notes/:id", "description": "Delete a note"},
		},
	})
}

func listNotes(c *gin.Context) {
	userID := c.Query("user_id")
	mu.RLock()
	defer mu.RUnlock()
	notes := []*Note{}
	for _, n := range store {
		if userID == "" || n.UserID == userID {
			notes = append(notes, n)
		}
	}
	c.JSON(http.StatusOK, gin.H{"notes": notes, "count": len(notes)})
}

func createNote(c *gin.Context) {
	var req CreateNoteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	note := &Note{
		ID:        uuid.NewString(),
		UserID:    req.UserID,
		Title:     req.Title,
		Content:   req.Content,
		Tags:      req.Tags,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	if note.Tags == nil {
		note.Tags = []string{}
	}
	mu.Lock()
	store[note.ID] = note
	mu.Unlock()
	c.JSON(http.StatusCreated, note)
}

func getNote(c *gin.Context) {
	id := c.Param("id")
	mu.RLock()
	note, ok := store[id]
	mu.RUnlock()
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "note not found"})
		return
	}
	c.JSON(http.StatusOK, note)
}

func updateNote(c *gin.Context) {
	id := c.Param("id")
	mu.Lock()
	defer mu.Unlock()
	note, ok := store[id]
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "note not found"})
		return
	}
	var req UpdateNoteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.Title != nil {
		note.Title = *req.Title
	}
	if req.Content != nil {
		note.Content = *req.Content
	}
	if req.Tags != nil {
		note.Tags = req.Tags
	}
	note.UpdatedAt = time.Now()
	c.JSON(http.StatusOK, note)
}

func deleteNote(c *gin.Context) {
	id := c.Param("id")
	mu.Lock()
	defer mu.Unlock()
	if _, ok := store[id]; !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "note not found"})
		return
	}
	delete(store, id)
	c.JSON(http.StatusOK, gin.H{"message": "note deleted"})
}
