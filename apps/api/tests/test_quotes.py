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
from app.models.compatibility import Compatibility  # noqa: E402
from app.models.mod_part import ModPart, ModPartCategory  # noqa: E402
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


def seed_test_data() -> dict[str, int]:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    with TestingSessionLocal() as db:
        motorcycle = Motorcycle(
            name="502C",
            brand="Benelli",
            year=2024,
            base_price=580000,
            base_weight_kg=217.0,
            base_hp=47.6,
            model_url="https://cdn.test/benelli-502c.glb",
        )
        db.add(motorcycle)
        db.flush()

        compatible_exhaust = ModPart(
            name="GPR Deeptone Exhaust",
            category=ModPartCategory.EXHAUST,
            price=18000,
            weight_delta=-3.2,
            hp_delta=6.5,
            description="Performance slip-on exhaust.",
            model_url="https://cdn.test/gpr-exhaust.glb",
        )
        compatible_wheels = ModPart(
            name="Excel Takasago Wheels",
            category=ModPartCategory.WHEELS,
            price=24000,
            weight_delta=-2.1,
            hp_delta=0.0,
            description="Lightweight forged wheel set.",
            model_url="https://cdn.test/excel-wheels.glb",
        )
        incompatible_part = ModPart(
            name="Universal Rally Fairing",
            category=ModPartCategory.FAIRINGS,
            price=19999,
            weight_delta=-1.0,
            hp_delta=0.0,
            description="Not linked to the Benelli for this test.",
            model_url="https://cdn.test/rally-fairing.glb",
        )
        db.add_all([compatible_exhaust, compatible_wheels, incompatible_part])
        db.flush()

        db.add_all(
            [
                Compatibility(
                    motorcycle_id=motorcycle.id,
                    mod_part_id=compatible_exhaust.id,
                ),
                Compatibility(
                    motorcycle_id=motorcycle.id,
                    mod_part_id=compatible_wheels.id,
                ),
            ]
        )
        db.commit()

        return {
            "motorcycle_id": motorcycle.id,
            "compatible_exhaust_id": compatible_exhaust.id,
            "compatible_wheels_id": compatible_wheels.id,
            "incompatible_part_id": incompatible_part.id,
        }


@pytest.fixture
async def client():
    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as async_client:
        yield async_client
    app.dependency_overrides.clear()


@pytest.mark.anyio
async def test_valid_quote(client: AsyncClient):
    ids = seed_test_data()

    response = await client.post(
        "/api/quote",
        json={
            "motorcycle_id": ids["motorcycle_id"],
            "selected_part_ids": [
                ids["compatible_exhaust_id"],
                ids["compatible_wheels_id"],
            ],
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["total_price"] == 622000.0
    assert payload["hp_gain"] == 6.5
    assert payload["new_weight_kg"] == 211.7
    assert len(payload["line_items"]) == 2


@pytest.mark.anyio
async def test_invalid_bike(client: AsyncClient):
    seed_test_data()

    response = await client.post(
        "/api/quote",
        json={"motorcycle_id": 9999, "selected_part_ids": []},
    )

    assert response.status_code == 404
    assert "Motorcycle with id 9999" in response.json()["detail"]


@pytest.mark.anyio
async def test_incompatible_part(client: AsyncClient):
    ids = seed_test_data()

    response = await client.post(
        "/api/quote",
        json={
            "motorcycle_id": ids["motorcycle_id"],
            "selected_part_ids": [ids["incompatible_part_id"]],
        },
    )

    assert response.status_code == 400
    assert "not compatible" in response.json()["detail"]
