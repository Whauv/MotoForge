from __future__ import annotations

from contextlib import asynccontextmanager
import time
from collections import defaultdict, deque

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import inspect, text

from app.config import settings
from app.database import Base, engine
from app.models import compatibility as compatibility_model  # noqa: F401
from app.models import mod_part as mod_part_model  # noqa: F401
from app.models import motorcycle as motorcycle_model  # noqa: F401
from app.routers import catalog, motorcycles, parts, quotes
from app.utils.exceptions import register_exception_handlers
from app.utils.logger import register_request_logging


def ensure_sqlite_mvp_columns() -> None:
    if engine.dialect.name != "sqlite":
        return

    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())
    if "motorcycles" not in existing_tables or "mod_parts" not in existing_tables:
        return

    motorcycle_columns = {
        column["name"] for column in inspector.get_columns("motorcycles")
    }
    mod_part_columns = {
        column["name"] for column in inspector.get_columns("mod_parts")
    }

    statements = []
    if "segment" not in motorcycle_columns:
        statements.append(
            "ALTER TABLE motorcycles ADD COLUMN segment VARCHAR(80) "
            "NOT NULL DEFAULT 'naked'"
        )
    if "source_provider" not in motorcycle_columns:
        statements.append(
            "ALTER TABLE motorcycles ADD COLUMN source_provider VARCHAR(120) "
            "NOT NULL DEFAULT 'seed'"
        )
    if "source_id" not in motorcycle_columns:
        statements.append("ALTER TABLE motorcycles ADD COLUMN source_id VARCHAR(160)")
    if "asset_status" not in motorcycle_columns:
        statements.append(
            "ALTER TABLE motorcycles ADD COLUMN asset_status VARCHAR(80) "
            "NOT NULL DEFAULT 'placeholder'"
        )
    if "supported_segments" not in mod_part_columns:
        statements.append(
            "ALTER TABLE mod_parts ADD COLUMN supported_segments VARCHAR(240) "
            "NOT NULL DEFAULT ''"
        )
    if "brand" not in mod_part_columns:
        statements.append("ALTER TABLE mod_parts ADD COLUMN brand VARCHAR(120)")
    if "sku" not in mod_part_columns:
        statements.append("ALTER TABLE mod_parts ADD COLUMN sku VARCHAR(120)")
    if "asset_status" not in mod_part_columns:
        statements.append(
            "ALTER TABLE mod_parts ADD COLUMN asset_status VARCHAR(80) "
            "NOT NULL DEFAULT 'placeholder'"
        )

    if not statements:
        return

    with engine.begin() as connection:
        for statement in statements:
            connection.execute(text(statement))


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    ensure_sqlite_mvp_columns()
    yield


app = FastAPI(title="MotoForge API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_request_logging(app)
register_exception_handlers(app)

app.include_router(motorcycles.router, prefix="/api")
app.include_router(catalog.router, prefix="/api")
app.include_router(parts.router, prefix="/api")
app.include_router(quotes.router, prefix="/api")


_RATE_BUCKETS: dict[str, deque[float]] = defaultdict(deque)


@app.middleware("http")
async def basic_rate_limiter(request: Request, call_next):
    limit = settings.api_rate_limit_per_minute
    window_seconds = 60
    now = time.time()
    client_host = request.client.host if request.client else "unknown"
    bucket = _RATE_BUCKETS[client_host]

    while bucket and bucket[0] <= now - window_seconds:
        bucket.popleft()

    if len(bucket) >= limit:
        request_id = getattr(request.state, "request_id", "")
        return JSONResponse(
            status_code=429,
            content={
                "code": "rate_limited",
                "message": "Too many requests. Please retry shortly.",
                "request_id": request_id,
            },
        )

    bucket.append(now)
    return await call_next(request)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    request_id = getattr(request.state, "request_id", "")
    return JSONResponse(
        status_code=422,
        content={
            "code": "validation_error",
            "message": "Request validation failed.",
            "request_id": request_id,
            "errors": exc.errors(),
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(
    request: Request,
    _: Exception,
) -> JSONResponse:
    request_id = getattr(request.state, "request_id", "")
    return JSONResponse(
        status_code=500,
        content={
            "code": "internal_error",
            "message": "Unexpected server error.",
            "request_id": request_id,
        },
    )


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok", "env": settings.app_env}
