# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM golang:1.25-alpine AS builder

WORKDIR /app

# Cache dependencies separately from source
COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Build a statically-linked binary (no libc needed in runtime image)
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-w -s" -o note-service .

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM scratch

# Copy CA certs for HTTPS calls
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

COPY --from=builder /app/note-service /note-service

# Non-root: scratch has no users, but we declare the UID conventionally
USER 65532:65532

EXPOSE 8001

ENTRYPOINT ["/note-service"]
