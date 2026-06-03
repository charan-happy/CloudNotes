# ── Stage 1: Install dependencies ───────────────────────────────────────────
FROM python:3.12-slim AS builder

WORKDIR /app

# Create a virtual env inside the image so we can copy only it to runtime
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM python:3.12-slim

WORKDIR /app

# Copy only the pre-built venv — no compiler/pip in final image
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Non-root user
RUN useradd -r -u 1001 appuser
USER appuser

COPY --chown=appuser:appuser main.py .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
