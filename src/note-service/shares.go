package main

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"golang.org/x/crypto/bcrypt"
)

// ── types ─────────────────────────────────────────────────────────────────────
type CreateShareRequest struct {
	Permission         string  `json:"permission"`           // "view" | "edit"
	SharedWithUsername *string `json:"shared_with_username"` // optional — restrict to one user
	Password           *string `json:"password"`             // optional — gate public links
	ExpiresInDays      *int    `json:"expires_in_days"`      // optional — auto-expire
}

type Share struct {
	ID               string     `json:"id"`
	NoteID           string     `json:"note_id"`
	Token            string     `json:"token"`
	Permission       string     `json:"permission"`
	SharedWith       *string    `json:"shared_with_user_id,omitempty"`
	HasPassword      bool       `json:"has_password"`
	ExpiresAt        *time.Time `json:"expires_at,omitempty"`
	CreatedAt        time.Time  `json:"created_at"`
}

func genShareToken() (string, error) {
	b := make([]byte, 18)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}

// ── owner: create a share link ────────────────────────────────────────────────
func (h *Handler) createShare(c *gin.Context) {
	noteID := c.Param("id")
	owner := currentUser(c)

	ctx, cancel := h.ctx(c)
	defer cancel()

	// The note must belong to the caller.
	var exists bool
	if err := h.pool.QueryRow(ctx,
		`SELECT EXISTS(SELECT 1 FROM notes WHERE id = $1 AND user_id = $2)`, noteID, owner,
	).Scan(&exists); err != nil || !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "note not found"})
		return
	}

	var req CreateShareRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.Permission != "edit" {
		req.Permission = "view"
	}

	// Resolve a target user, if sharing with a specific person — by username OR email.
	var sharedWith *string
	if req.SharedWithUsername != nil && *req.SharedWithUsername != "" {
		who := strings.TrimSpace(*req.SharedWithUsername)
		col := "username"
		if strings.Contains(who, "@") {
			col = "email"
		}
		var uid string
		err := h.pool.QueryRow(ctx,
			`SELECT id::text FROM users WHERE LOWER(`+col+`) = LOWER($1)`, who,
		).Scan(&uid)
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "No CloudNotes user found with that username or email."})
			return
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "lookup failed"})
			return
		}
		sharedWith = &uid
	}

	// Optional password gate.
	var pwHash *string
	if req.Password != nil && *req.Password != "" {
		hash, err := bcrypt.GenerateFromPassword([]byte(*req.Password), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "password hashing failed"})
			return
		}
		s := string(hash)
		pwHash = &s
	}

	// Optional expiry.
	var expiresAt *time.Time
	if req.ExpiresInDays != nil && *req.ExpiresInDays > 0 {
		t := time.Now().AddDate(0, 0, *req.ExpiresInDays)
		expiresAt = &t
	}

	token, err := genShareToken()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "token generation failed"})
		return
	}

	var sh Share
	err = h.pool.QueryRow(ctx,
		`INSERT INTO note_shares (note_id, owner_id, token, permission, shared_with_user_id, password_hash, expires_at)
		 VALUES ($1,$2,$3,$4,$5,$6,$7)
		 RETURNING id, note_id, token, permission, shared_with_user_id, (password_hash IS NOT NULL), expires_at, created_at`,
		noteID, owner, token, req.Permission, sharedWith, pwHash, expiresAt,
	).Scan(&sh.ID, &sh.NoteID, &sh.Token, &sh.Permission, &sh.SharedWith, &sh.HasPassword, &sh.ExpiresAt, &sh.CreatedAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create share"})
		return
	}
	c.JSON(http.StatusCreated, sh)
}

// ── owner: list a note's shares ───────────────────────────────────────────────
func (h *Handler) listShares(c *gin.Context) {
	ctx, cancel := h.ctx(c)
	defer cancel()

	rows, err := h.pool.Query(ctx,
		`SELECT id, note_id, token, permission, shared_with_user_id, (password_hash IS NOT NULL), expires_at, created_at
		 FROM note_shares WHERE note_id = $1 AND owner_id = $2 ORDER BY created_at DESC`,
		c.Param("id"), currentUser(c),
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
		return
	}
	defer rows.Close()

	shares := make([]Share, 0)
	for rows.Next() {
		var s Share
		if err := rows.Scan(&s.ID, &s.NoteID, &s.Token, &s.Permission, &s.SharedWith, &s.HasPassword, &s.ExpiresAt, &s.CreatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "scan failed"})
			return
		}
		shares = append(shares, s)
	}
	c.JSON(http.StatusOK, gin.H{"shares": shares, "count": len(shares)})
}

// ── owner: revoke a share ─────────────────────────────────────────────────────
func (h *Handler) revokeShare(c *gin.Context) {
	ctx, cancel := h.ctx(c)
	defer cancel()

	tag, err := h.pool.Exec(ctx,
		`DELETE FROM note_shares WHERE id = $1 AND note_id = $2 AND owner_id = $3`,
		c.Param("shareId"), c.Param("id"), currentUser(c),
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "delete failed"})
		return
	}
	if tag.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "share not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "share revoked"})
}

// noteColsPrefixed returns the note columns prefixed with a table alias for JOINs.
func noteColsPrefixed(alias string) string {
	return alias + ".id, " + alias + ".user_id, " + alias + ".title, " + alias + ".content, " +
		alias + ".tags, " + alias + ".icon, " + alias + ".color, " + alias + ".cover, " +
		alias + ".note_theme, " + alias + ".pinned, " + alias + ".created_at, " + alias + ".updated_at"
}

// ── public: read a shared note ────────────────────────────────────────────────
func (h *Handler) getSharedNote(c *gin.Context) {
	ctx, cancel := h.ctx(c)
	defer cancel()

	var (
		shareID, noteID, permission string
		ownerID                     string
		sharedWith                  *string
		pwHash                      *string
		expiresAt                   *time.Time
	)
	err := h.pool.QueryRow(ctx,
		`SELECT id, note_id, owner_id, permission, shared_with_user_id, password_hash, expires_at
		 FROM note_shares WHERE token = $1`, c.Param("token"),
	).Scan(&shareID, &noteID, &ownerID, &permission, &sharedWith, &pwHash, &expiresAt)
	if errors.Is(err, pgx.ErrNoRows) {
		c.JSON(http.StatusNotFound, gin.H{"error": "This share link doesn't exist or was revoked."})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
		return
	}

	if code, msg := h.checkAccess(c, ownerID, sharedWith, pwHash, expiresAt); code != http.StatusOK {
		c.JSON(code, gin.H{"error": msg, "needs_password": code == http.StatusUnauthorized && pwHash != nil})
		return
	}

	row := h.pool.QueryRow(ctx, `SELECT `+noteCols+` FROM notes WHERE id = $1`, noteID)
	n, err := scanNote(row)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "note not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"note": n, "permission": permission, "owner_id": ownerID})
}

// ── public: edit a shared note (only when permission = edit) ──────────────────
func (h *Handler) updateSharedNote(c *gin.Context) {
	ctx, cancel := h.ctx(c)
	defer cancel()

	var (
		noteID, permission, ownerID string
		sharedWith                  *string
		pwHash                      *string
		expiresAt                   *time.Time
	)
	err := h.pool.QueryRow(ctx,
		`SELECT note_id, owner_id, permission, shared_with_user_id, password_hash, expires_at
		 FROM note_shares WHERE token = $1`, c.Param("token"),
	).Scan(&noteID, &ownerID, &permission, &sharedWith, &pwHash, &expiresAt)
	if errors.Is(err, pgx.ErrNoRows) {
		c.JSON(http.StatusNotFound, gin.H{"error": "share not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
		return
	}

	if code, msg := h.checkAccess(c, ownerID, sharedWith, pwHash, expiresAt); code != http.StatusOK {
		c.JSON(code, gin.H{"error": msg})
		return
	}
	if permission != "edit" {
		c.JSON(http.StatusForbidden, gin.H{"error": "This link is view-only."})
		return
	}

	var req UpdateNoteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
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
		 WHERE id = $9
		 RETURNING `+noteCols,
		req.Title, content, tags, req.Icon, req.Color, req.Cover, req.NoteTheme, req.Pinned, noteID,
	)
	n, err := scanNote(row)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "update failed"})
		return
	}
	c.JSON(http.StatusOK, n)
}

// ── authenticated: notes shared with me ───────────────────────────────────────
func (h *Handler) sharedWithMe(c *gin.Context) {
	ctx, cancel := h.ctx(c)
	defer cancel()

	rows, err := h.pool.Query(ctx,
		`SELECT s.token, s.permission, `+noteColsPrefixed("n")+`
		 FROM note_shares s JOIN notes n ON n.id = s.note_id
		 WHERE s.shared_with_user_id = $1
		   AND (s.expires_at IS NULL OR s.expires_at > NOW())
		 ORDER BY n.updated_at DESC`,
		currentUser(c),
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
		return
	}
	defer rows.Close()

	type SharedNote struct {
		Token      string `json:"token"`
		Permission string `json:"permission"`
		Note       *Note  `json:"note"`
	}
	out := make([]SharedNote, 0)
	for rows.Next() {
		var sn SharedNote
		var n Note
		if err := rows.Scan(&sn.Token, &sn.Permission,
			&n.ID, &n.UserID, &n.Title, &n.Content, &n.Tags, &n.Icon,
			&n.Color, &n.Cover, &n.NoteTheme, &n.Pinned, &n.CreatedAt, &n.UpdatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "scan failed"})
			return
		}
		if len(n.Content) == 0 {
			n.Content = []byte(`{}`)
		}
		sn.Note = &n
		out = append(out, sn)
	}
	c.JSON(http.StatusOK, gin.H{"shared": out, "count": len(out)})
}

// checkAccess enforces expiry, audience (specific-user) and password rules.
// Returns (200, "") when access is allowed.
func (h *Handler) checkAccess(c *gin.Context, ownerID string, sharedWith, pwHash *string, expiresAt *time.Time) (int, string) {
	if expiresAt != nil && time.Now().After(*expiresAt) {
		return http.StatusGone, "This share link has expired."
	}
	viewer := optionalUser(c, h.jwtSecret)

	// Shared with a specific user → only that user (or the owner) may open it.
	if sharedWith != nil {
		if viewer == "" {
			return http.StatusUnauthorized, "Please sign in to open this shared note."
		}
		if viewer != *sharedWith && viewer != ownerID {
			return http.StatusForbidden, "This note was shared with a specific person."
		}
		return http.StatusOK, ""
	}

	// Public link with a password → owner bypasses, everyone else must provide it.
	if pwHash != nil && viewer != ownerID {
		pw := c.GetHeader("X-Share-Password")
		if pw == "" {
			return http.StatusUnauthorized, "This shared note is password-protected."
		}
		if bcrypt.CompareHashAndPassword([]byte(*pwHash), []byte(pw)) != nil {
			return http.StatusUnauthorized, "Incorrect password."
		}
	}
	return http.StatusOK, ""
}
