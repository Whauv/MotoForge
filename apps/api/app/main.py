from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok", "env": settings.app_env}
