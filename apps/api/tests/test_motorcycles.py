from __future__ import annotations

import sys
from pathlib import Path

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

API_ROOT = Path(__file__).resolve().parents[1]
if str(API_ROOT) not in sys.path:
    sys.path.insert(0, str(API_ROOT))

from app.database import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402
from app.models.motorcycle import Motorcycle  # noqa: E402


TEST_DATABASE_URL = "sqlite://"
engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=Session,
)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


def seed_motorcycles() -> None:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    with TestingSessionLocal() as db:
        db.add_all(
            [
                Motorcycle(
                    name="MT-07",
                    brand="Yamaha",
                    year=2023,
                    base_price=780000,
                    base_weight_kg=184,
                    base_hp=73.4,
                    model_url="https://cdn.test/yamaha-mt07.glb",
                ),
                Motorcycle(
                    name="Interceptor 650",
                    brand="Royal Enfield",
                    year=2021,
                    base_price=340000,
                    base_weight_kg=217,
                    base_hp=47.0,
                    model_url="https://cdn.test/re-interceptor.glb",
                ),
                Motorcycle(
                    name="Duke 390",
                    brand="KTM",
                    year=2024,
                    base_price=390000,
                    base_weight_kg=168,
                    base_hp=43.5,
                    model_url="https://cdn.test/ktm-duke390.glb",
                ),
            ]
        )
        db.commit()


@pytest.fixture
async def client():
    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(
        transport=transport,
        base_url="http://testserver",
    ) as async_client:
        yield async_client
    app.dependency_overrides.clear()


@pytest.mark.anyio
async def test_list_motorcycles_with_filters_and_pagination(client: AsyncClient):
    seed_motorcycles()

    response = await client.get(
        "/api/motorcycles",
        params={"year_from": 2022, "limit": 1, "offset": 0},
    )
    assert response.status_code == 200
    payload = response.json()
    assert len(payload) == 1
    assert payload[0]["year"] >= 2022

    second_page = await client.get(
        "/api/motorcycles",
        params={"year_from": 2022, "limit": 1, "offset": 1},
    )
    assert second_page.status_code == 200
    second_payload = second_page.json()
    assert len(second_payload) == 1
    assert second_payload[0]["id"] != payload[0]["id"]
