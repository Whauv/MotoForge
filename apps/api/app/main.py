from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import catalog, motorcycles, parts, quotes
from app.utils.exceptions import register_exception_handlers
from app.utils.logger import register_request_logging
from app.utils.rate_limit import register_rate_limiting


@asynccontextmanager
async def lifespan(_: FastAPI):
    if settings.auto_migrate:
        from app.migrations_runner import run_migrations

        run_migrations()
    yield


app = FastAPI(title="MotoForge API", version="1.0.0", lifespan=lifespan)

# Starlette runs the most recently added middleware first, so the rate limiter
# is registered before request logging: logging wraps it and the request ID is
# already set when a 429 is returned.
register_rate_limiting(app)
register_request_logging(app)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
register_exception_handlers(app)

app.include_router(motorcycles.router, prefix="/api")
app.include_router(catalog.router, prefix="/api")
app.include_router(parts.router, prefix="/api")
app.include_router(quotes.router, prefix="/api")


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok", "env": settings.app_env}
