"""Apply Alembic migrations programmatically.

Databases created before Alembic was introduced (via ``create_all`` plus the
old ad-hoc ``ALTER TABLE`` patches) have the tables but no ``alembic_version``
row. Those are brought up to the 0001 schema with the legacy column patch,
stamped, and then upgraded normally.
"""

from __future__ import annotations

from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import inspect, text
from sqlalchemy.engine import Connection

from app.database import engine

API_ROOT = Path(__file__).resolve().parents[1]
BASELINE_REVISION = "0001_initial_schema"

# Columns added to the MVP schema before migrations existed.
_LEGACY_COLUMNS: dict[str, dict[str, str]] = {
    "motorcycles": {
        "segment": "VARCHAR(80) NOT NULL DEFAULT 'naked'",
        "source_provider": "VARCHAR(120) NOT NULL DEFAULT 'seed'",
        "source_id": "VARCHAR(160)",
        "asset_status": "VARCHAR(80) NOT NULL DEFAULT 'placeholder'",
    },
    "mod_parts": {
        "supported_segments": "VARCHAR(240) NOT NULL DEFAULT ''",
        "brand": "VARCHAR(120)",
        "sku": "VARCHAR(120)",
        "asset_status": "VARCHAR(80) NOT NULL DEFAULT 'placeholder'",
    },
}


def _alembic_config(connection: Connection) -> Config:
    config = Config(str(API_ROOT / "alembic.ini"))
    config.set_main_option("script_location", str(API_ROOT / "migrations"))
    config.attributes["connection"] = connection
    config.attributes["skip_logging_config"] = True
    return config


def _patch_legacy_columns(connection: Connection) -> None:
    inspector = inspect(connection)
    for table, columns in _LEGACY_COLUMNS.items():
        existing = {column["name"] for column in inspector.get_columns(table)}
        for name, ddl in columns.items():
            if name not in existing:
                connection.execute(text(f"ALTER TABLE {table} ADD COLUMN {name} {ddl}"))


def run_migrations() -> None:
    with engine.begin() as connection:
        tables = set(inspect(connection).get_table_names())
        config = _alembic_config(connection)
        is_legacy = "alembic_version" not in tables and {
            "motorcycles",
            "mod_parts",
            "compatibilities",
        }.issubset(tables)

        if is_legacy:
            _patch_legacy_columns(connection)
            command.stamp(config, BASELINE_REVISION)

        command.upgrade(config, "head")
