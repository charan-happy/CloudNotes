package main

import (
	"context"
	"errors"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Handler carries dependencies shared by every route.
type Handler struct {
	pool      *pgxpool.Pool
	timeout   time.Duration
	jwtSecret string // used for optional auth on public share endpoints
}

func (h *Handler) ctx(c *gin.Context) (context.Context, context.CancelFunc) {
	return context.WithTimeout(c.Request.Context(), h.timeout)
}

const noteCols = `id, user_id, title, content, tags, icon, color, cover, note_theme, pinned, created_at, updated_at`

func scanNote(row pgx.Row) (*Note, error) {
	var n Note
	err := row.Scan(&n.ID, &n.UserID, &n.Title, &n.Content, &n.Tags, &n.Icon,
		&n.Color, &n.Cover, &n.NoteTheme, &n.Pinned, &n.CreatedAt, &n.UpdatedAt)
	if err != nil {
		return nil, err
	}
	if len(n.Content) == 0 {
		n.Content = []byte(`{}`)
	}
	return &n, nil
}

// GET /v1/notes — list the authenticated user's notes, pinned first, newest first.
func (h *Handler) listNotes(c *gin.Context) {
	ctx, cancel := h.ctx(c)
	defer cancel()

	rows, err := h.pool.Query(ctx,
		`SELECT `+noteCols+` FROM notes WHERE user_id = $1 ORDER BY pinned DESC, updated_at DESC`,
		currentUser(c),
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
		return
	}
	defer rows.Close()

	notes := make([]*Note, 0)
	for rows.Next() {
		n, err := scanNote(rows)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "scan failed"})
			return
		}
		notes = append(notes, n)
	}
	if rows.Err() != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "row iteration failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"notes": notes, "count": len(notes)})
}

// POST /v1/notes — create a note owned by the authenticated user.
func (h *Handler) createNote(c *gin.Context) {
	var req CreateNoteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if len(req.Content) == 0 {
		req.Content = []byte(`{}`)
	}
	if req.Tags == nil {
		req.Tags = []string{}
	}
	if req.Icon == "" {
		req.Icon = "📝"
	}
	if req.Color == "" {
		req.Color = "indigo"
	}
	if req.NoteTheme == "" {
		req.NoteTheme = "inherit"
	}

	ctx, cancel := h.ctx(c)
	defer cancel()

	row := h.pool.QueryRow(ctx,
		`INSERT INTO notes (user_id, title, content, tags, icon, color, cover, note_theme, pinned)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
		 RETURNING `+noteCols,
		currentUser(c), req.Title, req.Content, req.Tags, req.Icon,
		req.Color, req.Cover, req.NoteTheme, req.Pinned,
	)
	n, err := scanNote(row)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "insert failed"})
		return
	}
	c.JSON(http.StatusCreated, n)
}

// GET /v1/notes/:id — fetch one note, only if it belongs to the caller.
func (h *Handler) getNote(c *gin.Context) {
	ctx, cancel := h.ctx(c)
	defer cancel()

	row := h.pool.QueryRow(ctx,
		`SELECT `+noteCols+` FROM notes WHERE id = $1 AND user_id = $2`,
		c.Param("id"), currentUser(c),
	)
	n, err := scanNote(row)
	if errors.Is(err, pgx.ErrNoRows) {
		c.JSON(http.StatusNotFound, gin.H{"error": "note not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
		return
	}
	c.JSON(http.StatusOK, n)
}

// PUT /v1/notes/:id — partial update; COALESCE keeps unset fields unchanged.
func (h *Handler) updateNote(c *gin.Context) {
	var req UpdateNoteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := h.ctx(c)
	defer cancel()

	// pgx maps nil pointers to SQL NULL; COALESCE($n, column) leaves the column as-is.
	var content interface{}
	if len(req.Content) > 0 {
		content = req.Content
	}
	var tags interface{}
	if req.Tags != nil {
		tags = req.Tags
	}

	row := h.pool.QueryRow(ctx,
		`UPDATE notes SET
		    title      = COALESCE($1, title),
		    content    = COALESCE($2, content),
		    tags       = COALESCE($3, tags),
		    icon       = COALESCE($4, icon),
		    color      = COALESCE($5, color),
		    cover      = COALESCE($6, cover),
		    note_theme = COALESCE($7, note_theme),
		    pinned     = COALESCE($8, pinned),
		    updated_at = NOW()
		 WHERE id = $9 AND user_id = $10
		 RETURNING `+noteCols,
		req.Title, content, tags, req.Icon, req.Color, req.Cover,
		req.NoteTheme, req.Pinned, c.Param("id"), currentUser(c),
	)
	n, err := scanNote(row)
	if errors.Is(err, pgx.ErrNoRows) {
		c.JSON(http.StatusNotFound, gin.H{"error": "note not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "update failed"})
		return
	}
	c.JSON(http.StatusOK, n)
}

// DELETE /v1/notes/:id — delete only if owned by the caller.
func (h *Handler) deleteNote(c *gin.Context) {
	ctx, cancel := h.ctx(c)
	defer cancel()

	tag, err := h.pool.Exec(ctx,
		`DELETE FROM notes WHERE id = $1 AND user_id = $2`,
		c.Param("id"), currentUser(c),
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "delete failed"})
		return
	}
	if tag.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "note not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "note deleted"})
}
