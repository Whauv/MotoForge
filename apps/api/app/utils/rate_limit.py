"""Sliding-window rate limiter.

State is per process. With several replicas each one enforces its own limit,
so for multi-replica deployments prefer limiting at the ingress / load
balancer, or swap ``_buckets`` for a shared store such as Redis.
"""

from __future__ import annotations

import time
from collections import deque

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.config import settings
from app.utils.exceptions import error_payload

WINDOW_SECONDS = 60.0
# Sweep idle buckets at most this often so memory doesn't grow per unique IP.
SWEEP_INTERVAL_SECONDS = 300.0
EXEMPT_PATHS = frozenset({"/health"})


class SlidingWindowLimiter:
    def __init__(self, limit: int, window_seconds: float = WINDOW_SECONDS):
        self.limit = limit
        self.window_seconds = window_seconds
        self._buckets: dict[str, deque[float]] = {}
        self._last_sweep: float | None = None

    def allow(self, key: str, now: float | None = None) -> bool:
        now = time.monotonic() if now is None else now
        self._maybe_sweep(now)

        bucket = self._buckets.setdefault(key, deque())
        cutoff = now - self.window_seconds
        while bucket and bucket[0] <= cutoff:
            bucket.popleft()

        if len(bucket) >= self.limit:
            return False
        bucket.append(now)
        return True

    def _maybe_sweep(self, now: float) -> None:
        if self._last_sweep is None:
            self._last_sweep = now
        if now - self._last_sweep < SWEEP_INTERVAL_SECONDS:
            return
        cutoff = now - self.window_seconds
        stale = [
            key
            for key, bucket in self._buckets.items()
            if not bucket or bucket[-1] <= cutoff
        ]
        for key in stale:
            del self._buckets[key]
        self._last_sweep = now

    def __len__(self) -> int:
        return len(self._buckets)


def client_key(request: Request) -> str:
    if settings.trust_proxy_headers:
        forwarded = request.headers.get("x-forwarded-for", "")
        first_hop = forwarded.split(",", 1)[0].strip()
        if first_hop:
            return first_hop
    return request.client.host if request.client else "unknown"


def register_rate_limiting(app: FastAPI) -> None:
    """Register before request logging so the request ID is set when we run."""
    if settings.api_rate_limit_per_minute <= 0:
        return

    limiter = SlidingWindowLimiter(settings.api_rate_limit_per_minute)
    app.state.rate_limiter = limiter

    @app.middleware("http")
    async def rate_limit(request: Request, call_next):
        if request.url.path in EXEMPT_PATHS or limiter.allow(client_key(request)):
            return await call_next(request)
        return JSONResponse(
            status_code=429,
            headers={"Retry-After": str(int(WINDOW_SECONDS))},
            content=error_payload(
                request,
                code="rate_limited",
                message="Too many requests. Please retry shortly.",
            ),
        )
