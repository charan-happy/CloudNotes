"""Structured JSON logging — one JSON object per line, ready for ELK / Loki / CloudWatch."""
import datetime as dt
import json
import logging
import os


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "ts": dt.datetime.fromtimestamp(record.created, tz=dt.timezone.utc).isoformat(),
            "level": record.levelname.lower(),
            "service": "auth-service",
            "logger": record.name,
            "msg": record.getMessage(),
        }
        # Merge any structured 'extra' fields attached to the record.
        if hasattr(record, "extra_fields") and isinstance(record.extra_fields, dict):
            payload.update(record.extra_fields)
        if record.exc_info:
            payload["error"] = self.formatException(record.exc_info)
        return json.dumps(payload)


def setup_logging() -> logging.Logger:
    level = logging.DEBUG if os.getenv("LOG_LEVEL") == "debug" else logging.INFO
    handler = logging.StreamHandler()
    handler.setFormatter(JsonFormatter())

    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(level)

    # Route uvicorn/gunicorn access+error logs through the same JSON handler.
    for name in ("uvicorn", "uvicorn.error", "uvicorn.access"):
        lg = logging.getLogger(name)
        lg.handlers.clear()
        lg.propagate = True

    return logging.getLogger("auth-service")
