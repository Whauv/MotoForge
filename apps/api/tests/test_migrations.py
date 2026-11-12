from __future__ import annotations

import sys
from pathlib import Path

from sqlalchemy import create_engine, inspect, text

API_ROOT = Path(__file__).resolve().parents[1]
if str(API_ROOT) not in sys.path:
    sys.path.insert(0, str(API_ROOT))

from app import migrations_runner  # noqa: E402


def test_fresh_database_gets_full_schema(tmp_path, monkeypatch):
    engine = create_engine(f"sqlite:///{tmp_path / 'fresh.db'}")
    monkeypatch.setattr(migrations_runner, "engine", engine)

    migrations_runner.run_migrations()

    tables = set(inspect(engine).get_table_names())
    assert {"motorcycles", "mod_parts", "compatibilities", "alembic_version"} <= tables


def test_legacy_database_is_patched_and_stamped(tmp_path, monkeypatch):
    engine = create_engine(f"sqlite:///{tmp_path / 'legacy.db'}")
    with engine.begin() as connection:
        connection.execute(
            text(
                "CREATE TABLE motorcycles (id INTEGER PRIMARY KEY, name VARCHAR(120),"
                " brand VARCHAR(120), year INTEGER, base_price FLOAT,"
                " base_weight_kg FLOAT, base_hp FLOAT, model_url VARCHAR(512))"
            )
        )
        connection.execute(
            text(
                "CREATE TABLE mod_parts (id INTEGER PRIMARY KEY, name VARCHAR(160),"
                " category VARCHAR(10), price FLOAT, weight_delta FLOAT,"
                " hp_delta FLOAT, description VARCHAR(1000), model_url VARCHAR(512))"
            )
        )
        connection.execute(
            text(
                "CREATE TABLE compatibilities (id INTEGER PRIMARY KEY,"
                " motorcycle_id INTEGER, mod_part_id INTEGER)"
            )
        )
    monkeypatch.setattr(migrations_runner, "engine", engine)

    migrations_runner.run_migrations()

    inspector = inspect(engine)
    motorcycle_columns = {c["name"] for c in inspector.get_columns("motorcycles")}
    part_columns = {c["name"] for c in inspector.get_columns("mod_parts")}
    assert {"segment", "source_provider", "asset_status"} <= motorcycle_columns
    assert {"supported_segments", "brand", "sku"} <= part_columns
    with engine.connect() as connection:
        version = connection.execute(text("SELECT version_num FROM alembic_version"))
        assert version.scalar() == migrations_runner.BASELINE_REVISION
