from __future__ import annotations

import logging
import time
import uuid

from fastapi import FastAPI, Request
from starlette.responses import Response


LOGGER_NAME = "motoforge.api"
REQUEST_ID_HEADER = "X-Request-ID"


def configure_logging() -> logging.Logger:
    logger = logging.getLogger(LOGGER_NAME)
    if not logger.handlers:
        handler = logging.StreamHandler()
        formatter = logging.Formatter("%(asctime)s %(levelname)s %(name)s %(message)s")
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    logger.setLevel(logging.INFO)
    logger.propagate = False
    return logger


def register_request_logging(app: FastAPI) -> None:
    logger = configure_logging()

    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        request_id = request.headers.get(REQUEST_ID_HEADER) or str(uuid.uuid4())
        request.state.request_id = request_id
        start_time = time.perf_counter()
        response = await call_next(request)
        response.headers[REQUEST_ID_HEADER] = request_id
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        logger.info(
            'event="request_completed" '
            'request_id="%s" method="%s" path="%s" status_code=%s duration_ms=%s',
            request_id,
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
        )
        return response

    @app.middleware("http")
    async def apply_security_headers(request: Request, call_next):
        response: Response = await call_next(request)
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        response.headers.setdefault(
            "Permissions-Policy",
            "camera=(), microphone=(), geolocation=()",
        )
        return response
