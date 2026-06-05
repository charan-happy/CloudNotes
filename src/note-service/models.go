package main

import (
	"encoding/json"
	"time"
)

// Note mirrors the notes table. Content is raw JSON (TipTap document).
type Note struct {
	ID        string          `json:"id"`
	UserID    string          `json:"user_id"`
	Title     string          `json:"title"`
	Content   json.RawMessage `json:"content"`
	Tags      []string        `json:"tags"`
	Icon      string          `json:"icon"`
	Color     string          `json:"color"`
	Cover     *string         `json:"cover,omitempty"`
	NoteTheme string          `json:"note_theme"`
	Pinned    bool            `json:"pinned"`
	CreatedAt time.Time       `json:"created_at"`
	UpdatedAt time.Time       `json:"updated_at"`
}

// CreateNoteRequest is the body for POST /v1/notes. user_id comes from the JWT,
// never from the client.
type CreateNoteRequest struct {
	Title     string          `json:"title"`
	Content   json.RawMessage `json:"content"`
	Tags      []string        `json:"tags"`
	Icon      string          `json:"icon"`
	Color     string          `json:"color"`
	Cover     *string         `json:"cover"`
	NoteTheme string          `json:"note_theme"`
	Pinned    bool            `json:"pinned"`
}

// UpdateNoteRequest is the body for PUT /v1/notes/:id. All fields optional (PATCH-style).
type UpdateNoteRequest struct {
	Title     *string         `json:"title"`
	Content   json.RawMessage `json:"content"`
	Tags      []string        `json:"tags"`
	Icon      *string         `json:"icon"`
	Color     *string         `json:"color"`
	Cover     *string         `json:"cover"`
	NoteTheme *string         `json:"note_theme"`
	Pinned    *bool           `json:"pinned"`
}
