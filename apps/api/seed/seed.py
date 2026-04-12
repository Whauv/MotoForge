from __future__ import annotations

import sys
from pathlib import Path

from sqlalchemy import select

API_ROOT = Path(__file__).resolve().parents[1]
if str(API_ROOT) not in sys.path:
    sys.path.insert(0, str(API_ROOT))

from app.database import Base, SessionLocal, engine  # noqa: E402
from app.models.compatibility import Compatibility  # noqa: E402
from app.models.mod_part import ModPart, ModPartCategory  # noqa: E402
from app.models.motorcycle import Motorcycle  # noqa: E402


BENELLI_MODEL_URL = "https://cdn.motoforge.local/models/benelli-502c.glb"
PART_MODEL_BASE_URL = "https://cdn.motoforge.local/models/parts"


def seed() -> None:
    Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        motorcycle = db.scalar(
            select(Motorcycle).where(
                Motorcycle.brand == "Benelli",
                Motorcycle.name == "502C",
                Motorcycle.year == 2024,
            )
        )
        if motorcycle is None:
            motorcycle = Motorcycle(
                name="502C",
                brand="Benelli",
                year=2024,
                base_price=580000,
                base_weight_kg=217.0,
                base_hp=47.6,
                model_url=BENELLI_MODEL_URL,
            )
            db.add(motorcycle)
            db.flush()

        parts_to_seed = [
            {
                "name": "GPR Deeptone Exhaust",
                "category": ModPartCategory.EXHAUST,
                "price": 18000,
                "weight_delta": -3.2,
                "hp_delta": 6.5,
                "description": (
                    "Free-flow slip-on exhaust tuned for stronger "
                    "mid-range response and a deeper note."
                ),
                "model_url": f"{PART_MODEL_BASE_URL}/gpr-deeptone-exhaust.glb",
            },
            {
                "name": "Ohlins Rear Shock",
                "category": ModPartCategory.SUSPENSION,
                "price": 32000,
                "weight_delta": -0.8,
                "hp_delta": 0.0,
                "description": (
                    "Adjustable premium rear suspension setup for sharper "
                    "cornering stability and rider feedback."
                ),
                "model_url": f"{PART_MODEL_BASE_URL}/ohlins-rear-shock.glb",
            },
            {
                "name": "Excel Takasago Wheels",
                "category": ModPartCategory.WHEELS,
                "price": 24000,
                "weight_delta": -2.1,
                "hp_delta": 0.0,
                "description": (
                    "Lightweight forged wheel upgrade that trims rotational "
                    "mass for quicker turn-in."
                ),
                "model_url": f"{PART_MODEL_BASE_URL}/excel-takasago-wheels.glb",
            },
            {
                "name": "Carbon Fibre Fairing Kit",
                "category": ModPartCategory.FAIRINGS,
                "price": 15000,
                "weight_delta": -1.5,
                "hp_delta": 0.0,
                "description": (
                    "Carbon body kit that reduces weight while giving the "
                    "Benelli a sharper streetfighter profile."
                ),
                "model_url": f"{PART_MODEL_BASE_URL}/carbon-fairing-kit.glb",
            },
            {
                "name": "Rizoma Bar End Mirrors + Handlebars",
                "category": ModPartCategory.HANDLEBARS,
                "price": 8500,
                "weight_delta": -0.3,
                "hp_delta": 0.0,
                "description": (
                    "Cockpit upgrade with wider leverage, cleaner bar-end "
                    "mirrors, and improved control feel."
                ),
                "model_url": f"{PART_MODEL_BASE_URL}/rizoma-handlebars-mirrors.glb",
            },
        ]

        for part_payload in parts_to_seed:
            part = db.scalar(
                select(ModPart).where(ModPart.name == part_payload["name"])
            )
            if part is None:
                part = ModPart(**part_payload)
                db.add(part)
                db.flush()

            compatibility = db.scalar(
                select(Compatibility).where(
                    Compatibility.motorcycle_id == motorcycle.id,
                    Compatibility.mod_part_id == part.id,
                )
            )
            if compatibility is None:
                db.add(
                    Compatibility(
                        motorcycle_id=motorcycle.id,
                        mod_part_id=part.id,
                    )
                )

        db.commit()


if __name__ == "__main__":
    seed()
