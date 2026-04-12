from __future__ import annotations

import logging
import time

from fastapi import FastAPI, Request


LOGGER_NAME = "motoforge.api"


def configure_logging() -> logging.Logger:
    logger = logging.getLogger(LOGGER_NAME)
    if not logger.handlers:
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            "%(asctime)s %(levelname)s %(name)s %(message)s"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    logger.setLevel(logging.INFO)
    logger.propagate = False
    return logger


def register_request_logging(app: FastAPI) -> None:
    logger = configure_logging()

    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        start_time = time.perf_counter()
        response = await call_next(request)
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        logger.info(
            'event="request_completed" '
            'method="%s" path="%s" status_code=%s duration_ms=%s',
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
        )
        return response
