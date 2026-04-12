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


PART_MODEL_BASE_URL = "https://cdn.motoforge.local/models/parts"

MOTORCYCLES = [
    {
        "slug": "yamaha-mt07-2023",
        "brand": "Yamaha",
        "name": "MT-07",
        "year": 2023,
        "base_price": 759000,
        "base_weight_kg": 184.0,
        "base_hp": 73.4,
        "model_url": "https://cdn.motoforge.local/models/yamaha-mt07-2023.glb",
        "segment": "naked",
    },
    {
        "slug": "kawasaki-ninja650-2024",
        "brand": "Kawasaki",
        "name": "Ninja 650",
        "year": 2024,
        "base_price": 799000,
        "base_weight_kg": 196.0,
        "base_hp": 67.3,
        "model_url": "https://cdn.motoforge.local/models/kawasaki-ninja650-2024.glb",
        "segment": "sport",
    },
    {
        "slug": "honda-cb650r-2022",
        "brand": "Honda",
        "name": "CB650R",
        "year": 2022,
        "base_price": 915000,
        "base_weight_kg": 202.0,
        "base_hp": 94.0,
        "model_url": "https://cdn.motoforge.local/models/honda-cb650r-2022.glb",
        "segment": "naked",
    },
    {
        "slug": "ktm-duke390-2024",
        "brand": "KTM",
        "name": "390 Duke",
        "year": 2024,
        "base_price": 311000,
        "base_weight_kg": 168.0,
        "base_hp": 45.0,
        "model_url": "https://cdn.motoforge.local/models/ktm-duke390-2024.glb",
        "segment": "naked",
    },
    {
        "slug": "royalenfield-interceptor650-2023",
        "brand": "Royal Enfield",
        "name": "Interceptor 650",
        "year": 2023,
        "base_price": 349000,
        "base_weight_kg": 218.0,
        "base_hp": 47.0,
        "model_url": "https://cdn.motoforge.local/models/interceptor650-2023.glb",
        "segment": "retro",
    },
    {
        "slug": "ducati-monster937-2023",
        "brand": "Ducati",
        "name": "Monster",
        "year": 2023,
        "base_price": 1245000,
        "base_weight_kg": 188.0,
        "base_hp": 111.0,
        "model_url": "https://cdn.motoforge.local/models/ducati-monster-2023.glb",
        "segment": "naked",
    },
    {
        "slug": "triumph-streettriple-rs-2024",
        "brand": "Triumph",
        "name": "Street Triple RS",
        "year": 2024,
        "base_price": 1175000,
        "base_weight_kg": 188.0,
        "base_hp": 128.0,
        "model_url": "https://cdn.motoforge.local/models/streettriple-rs-2024.glb",
        "segment": "naked",
    },
    {
        "slug": "suzuki-hayabusa-2023",
        "brand": "Suzuki",
        "name": "Hayabusa",
        "year": 2023,
        "base_price": 1649000,
        "base_weight_kg": 264.0,
        "base_hp": 187.0,
        "model_url": "https://cdn.motoforge.local/models/hayabusa-2023.glb",
        "segment": "sport",
    },
    {
        "slug": "bmw-rninet-2022",
        "brand": "BMW",
        "name": "R nineT",
        "year": 2022,
        "base_price": 1899000,
        "base_weight_kg": 221.0,
        "base_hp": 109.0,
        "model_url": "https://cdn.motoforge.local/models/bmw-rninet-2022.glb",
        "segment": "retro",
    },
    {
        "slug": "harley-iron883-2020",
        "brand": "Harley-Davidson",
        "name": "Iron 883",
        "year": 2020,
        "base_price": 940000,
        "base_weight_kg": 256.0,
        "base_hp": 49.0,
        "model_url": "https://cdn.motoforge.local/models/harley-iron883-2020.glb",
        "segment": "cruiser",
    },
]

MOD_PARTS = [
    {
        "name": "Akrapovic Racing Line Exhaust",
        "category": ModPartCategory.EXHAUST,
        "price": 62000,
        "weight_delta": -3.4,
        "hp_delta": 5.6,
        "description": (
            "Titanium exhaust system with sharper throttle response "
            "and premium finish."
        ),
        "model_url": f"{PART_MODEL_BASE_URL}/akrapovic-racing-line.glb",
        "segments": ["sport", "naked"],
    },
    {
        "name": "SC-Project S1 Slip-On",
        "category": ModPartCategory.EXHAUST,
        "price": 41000,
        "weight_delta": -2.7,
        "hp_delta": 3.8,
        "description": (
            "Compact race-inspired slip-on for aggressive sound "
            "and lighter rear mass."
        ),
        "model_url": f"{PART_MODEL_BASE_URL}/sc-project-s1.glb",
        "segments": ["sport", "naked"],
    },
    {
        "name": "Yoshimura AT2 Full System",
        "category": ModPartCategory.EXHAUST,
        "price": 54000,
        "weight_delta": -3.0,
        "hp_delta": 4.9,
        "description": (
            "Street-legal full system built for broad torque gains "
            "and faster rev pickup."
        ),
        "model_url": f"{PART_MODEL_BASE_URL}/yoshimura-at2.glb",
        "segments": ["sport", "naked"],
    },
    {
        "name": "Vance & Hines Twin Slash",
        "category": ModPartCategory.EXHAUST,
        "price": 38000,
        "weight_delta": -2.2,
        "hp_delta": 2.1,
        "description": (
            "Classic twin-pipe cruiser exhaust with deeper tone "
            "and cleaner side profile."
        ),
        "model_url": f"{PART_MODEL_BASE_URL}/vance-hines-twin-slash.glb",
        "segments": ["cruiser"],
    },
    {
        "name": "S&S Grand National Slip-On",
        "category": ModPartCategory.EXHAUST,
        "price": 47000,
        "weight_delta": -2.5,
        "hp_delta": 2.8,
        "description": (
            "Torque-focused exhaust upgrade tailored for modern retro "
            "and cruiser builds."
        ),
        "model_url": f"{PART_MODEL_BASE_URL}/ss-grand-national.glb",
        "segments": ["retro", "cruiser"],
    },
    {
        "name": "Arrow Pro-Race Exhaust",
        "category": ModPartCategory.EXHAUST,
        "price": 36500,
        "weight_delta": -2.4,
        "hp_delta": 3.2,
        "description": (
            "Lean race canister built for middleweight machines "
            "and everyday rideability."
        ),
        "model_url": f"{PART_MODEL_BASE_URL}/arrow-prorace.glb",
        "segments": ["sport", "naked"],
    },
    {
        "name": "Ohlins STX 46 Rear Shock",
        "category": ModPartCategory.SUSPENSION,
        "price": 52000,
        "weight_delta": -0.9,
        "hp_delta": 0.0,
        "description": (
            "Premium monotube rear shock for sharper damping control "
            "on fast roads."
        ),
        "model_url": f"{PART_MODEL_BASE_URL}/ohlins-stx46.glb",
        "segments": ["sport", "naked", "retro"],
    },
    {
        "name": "YSS Adjustable Mono Shock",
        "category": ModPartCategory.SUSPENSION,
        "price": 28000,
        "weight_delta": -0.6,
        "hp_delta": 0.0,
        "description": (
            "Balanced value suspension upgrade for riders tuning comfort "
            "and cornering."
        ),
        "model_url": f"{PART_MODEL_BASE_URL}/yss-adjustable-shock.glb",
        "segments": ["sport", "naked", "retro"],
    },
    {
        "name": "Hyperpro Streetbox Kit",
        "category": ModPartCategory.SUSPENSION,
        "price": 46000,
        "weight_delta": -0.8,
        "hp_delta": 0.0,
        "description": (
            "Front and rear street setup improving compliance, "
            "balance, and confidence."
        ),
        "model_url": f"{PART_MODEL_BASE_URL}/hyperpro-streetbox.glb",
        "segments": ["sport", "naked"],
    },
    {
        "name": "Progressive 444 Cruiser Shocks",
        "category": ModPartCategory.SUSPENSION,
        "price": 34000,
        "weight_delta": -0.5,
        "hp_delta": 0.0,
        "description": (
            "Cruiser rear shock pair improving ride quality on broken "
            "roads and highways."
        ),
        "model_url": f"{PART_MODEL_BASE_URL}/progressive-444.glb",
        "segments": ["cruiser"],
    },
    {
        "name": "Wilbers Twin Shock Set",
        "category": ModPartCategory.SUSPENSION,
        "price": 49000,
        "weight_delta": -0.7,
        "hp_delta": 0.0,
        "description": (
            "Refined twin-shock retro setup for classic bikes with "
            "modern damping feel."
        ),
        "model_url": f"{PART_MODEL_BASE_URL}/wilbers-twin-shock.glb",
        "segments": ["retro"],
    },
    {
        "name": "K-Tech Razor-R Lite",
        "category": ModPartCategory.SUSPENSION,
        "price": 39500,
        "weight_delta": -0.6,
        "hp_delta": 0.0,
        "description": (
            "Track-leaning rear shock for riders who push their street "
            "bikes hard."
        ),
        "model_url": f"{PART_MODEL_BASE_URL}/ktech-razor-r-lite.glb",
        "segments": ["sport", "naked"],
    },
    {
        "name": "Marchesini Forged Wheels",
        "category": ModPartCategory.WHEELS,
        "price": 138000,
        "weight_delta": -4.5,
        "hp_delta": 0.0,
        "description": (
            "Forged alloy wheelset reducing unsprung mass for faster "
            "turn-in and drive."
        ),
        "model_url": f"{PART_MODEL_BASE_URL}/marchesini-forged-wheels.glb",
        "segments": ["sport", "naked"],
    },
    {
        "name": "OZ Gass RS-A Wheels",
        "category": ModPartCategory.WHEELS,
        "price": 121000,
        "weight_delta": -4.1,
        "hp_delta": 0.0,
        "description": (
            "Lightweight performance wheels with strong braking "
            "and transition benefits."
        ),
        "model_url": f"{PART_MODEL_BASE_URL}/oz-gass-rsa.glb",
        "segments": ["sport", "naked"],
    },
    {
        "name": "BST Carbon Wheel Set",
        "category": ModPartCategory.WHEELS,
        "price": 246000,
        "weight_delta": -5.8,
        "hp_delta": 0.0,
        "description": (
            "Carbon wheel upgrade for flagship performance builds "
            "chasing instant response."
        ),
        "model_url": f"{PART_MODEL_BASE_URL}/bst-carbon-wheels.glb",
        "segments": ["sport", "naked"],
    },
    {
        "name": "Roland Sands Tracker Wheels",
        "category": ModPartCategory.WHEELS,
        "price": 98000,
        "weight_delta": -3.6,
        "hp_delta": 0.0,
        "description": (
            "Custom wheel package for retro and cruiser builds "
            "with workshop character."
        ),
        "model_url": f"{PART_MODEL_BASE_URL}/roland-sands-tracker.glb",
        "segments": ["retro", "cruiser"],
    },
    {
        "name": "Excel Takasago Spoke Wheels",
        "category": ModPartCategory.WHEELS,
        "price": 76000,
        "weight_delta": -2.9,
        "hp_delta": 0.0,
        "description": (
            "Strong lightweight spoked wheel set suited to retro "
            "roadster conversions."
        ),
        "model_url": f"{PART_MODEL_BASE_URL}/excel-takasago-spoke.glb",
        "segments": ["retro"],
    },
    {
        "name": "Rotobox Boost Carbon Wheels",
        "category": ModPartCategory.WHEELS,
        "price": 228000,
        "weight_delta": -5.2,
        "hp_delta": 0.0,
        "description": (
            "Premium carbon wheel package for high-end naked "
            "and sport builds."
        ),
        "model_url": f"{PART_MODEL_BASE_URL}/rotobox-boost.glb",
        "segments": ["sport", "naked"],
    },
    {
        "name": "Puig Naked New Generation Screen",
        "category": ModPartCategory.FAIRINGS,
        "price": 16500,
        "weight_delta": -0.4,
        "hp_delta": 0.0,
        "description": (
            "Compact flyscreen that improves wind management "
            "without hiding the bike shape."
        ),
        "model_url": f"{PART_MODEL_BASE_URL}/puig-naked-screen.glb",
        "segments": ["naked"],
    },
    {
        "name": "Carbon Belly Pan Kit",
        "category": ModPartCategory.FAIRINGS,
        "price": 21500,
        "weight_delta": -1.1,
        "hp_delta": 0.0,
        "description": (
            "Lightweight lower fairing accent that sharpens the side "
            "profile and stance."
        ),
        "model_url": f"{PART_MODEL_BASE_URL}/carbon-belly-pan.glb",
        "segments": ["naked", "sport"],
    },
    {
        "name": "Race Upper Fairing Conversion",
        "category": ModPartCategory.FAIRINGS,
        "price": 42000,
        "weight_delta": -1.8,
        "hp_delta": 0.0,
        "description": (
            "Track-inspired fairing conversion with a tucked silhouette "
            "and cleaner front."
        ),
        "model_url": f"{PART_MODEL_BASE_URL}/race-upper-fairing.glb",
        "segments": ["sport"],
    },
    {
        "name": "Quarter Fairing Retro Kit",
        "category": ModPartCategory.FAIRINGS,
        "price": 27500,
        "weight_delta": -0.9,
        "hp_delta": 0.0,
        "description": (
            "Cafe-inspired quarter fairing that transforms modern retro "
            "bikes visually."
        ),
        "model_url": f"{PART_MODEL_BASE_URL}/quarter-fairing-retro.glb",
        "segments": ["retro"],
    },
    {
        "name": "Batwing Touring Fairing",
        "category": ModPartCategory.FAIRINGS,
        "price": 35500,
        "weight_delta": 1.6,
        "hp_delta": 0.0,
        "description": (
            "Bold cruiser fairing setup improving presence and highway "
            "wind protection."
        ),
        "model_url": f"{PART_MODEL_BASE_URL}/batwing-touring-fairing.glb",
        "segments": ["cruiser"],
    },
    {
        "name": "Minimalist Headlight Cowl",
        "category": ModPartCategory.FAIRINGS,
        "price": 9800,
        "weight_delta": -0.2,
        "hp_delta": 0.0,
        "description": (
            "Small headlight cowl for a cleaner front end and subtle "
            "custom presence."
        ),
        "model_url": f"{PART_MODEL_BASE_URL}/minimalist-headlight-cowl.glb",
        "segments": ["naked", "retro"],
    },
    {
        "name": "Rizoma Drag Bar Kit",
        "category": ModPartCategory.HANDLEBARS,
        "price": 18500,
        "weight_delta": -0.4,
        "hp_delta": 0.0,
        "description": (
            "Low drag-bar setup with premium finish and sharper "
            "steering feel."
        ),
        "model_url": f"{PART_MODEL_BASE_URL}/rizoma-drag-bar.glb",
        "segments": ["naked", "sport"],
    },
    {
        "name": "Renthal Street Low Bar",
        "category": ModPartCategory.HANDLEBARS,
        "price": 11200,
        "weight_delta": -0.2,
        "hp_delta": 0.0,
        "description": (
            "Street-friendly low bar upgrade for improved control "
            "and reduced reach."
        ),
        "model_url": f"{PART_MODEL_BASE_URL}/renthal-street-low.glb",
        "segments": ["naked", "retro"],
    },
    {
        "name": "Woodcraft Clip-On Set",
        "category": ModPartCategory.HANDLEBARS,
        "price": 26800,
        "weight_delta": -0.3,
        "hp_delta": 0.0,
        "description": (
            "Performance clip-ons for a more aggressive riding triangle "
            "on sport builds."
        ),
        "model_url": f"{PART_MODEL_BASE_URL}/woodcraft-clipons.glb",
        "segments": ["sport"],
    },
    {
        "name": "Tracker Bar Conversion",
        "category": ModPartCategory.HANDLEBARS,
        "price": 15400,
        "weight_delta": -0.1,
        "hp_delta": 0.0,
        "description": (
            "Wide tracker-style bar ideal for custom retros "
            "and urban builds."
        ),
        "model_url": f"{PART_MODEL_BASE_URL}/tracker-bar-conversion.glb",
        "segments": ["retro"],
    },
    {
        "name": "Ape Hanger Mini Set",
        "category": ModPartCategory.HANDLEBARS,
        "price": 24300,
        "weight_delta": 0.4,
        "hp_delta": 0.0,
        "description": (
            "Mini ape setup for cruisers wanting a taller custom "
            "cockpit silhouette."
        ),
        "model_url": f"{PART_MODEL_BASE_URL}/apehanger-mini.glb",
        "segments": ["cruiser"],
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
        "segments": ["naked", "sport", "retro"],
    },
]


def upsert_motorcycle(db, motorcycle_payload):
    motorcycle = db.scalar(
        select(Motorcycle).where(
            Motorcycle.brand == motorcycle_payload["brand"],
            Motorcycle.name == motorcycle_payload["name"],
            Motorcycle.year == motorcycle_payload["year"],
        )
    )
    if motorcycle is None:
        motorcycle = Motorcycle(
            name=motorcycle_payload["name"],
            brand=motorcycle_payload["brand"],
            year=motorcycle_payload["year"],
            base_price=motorcycle_payload["base_price"],
            base_weight_kg=motorcycle_payload["base_weight_kg"],
            base_hp=motorcycle_payload["base_hp"],
            model_url=motorcycle_payload["model_url"],
        )
        db.add(motorcycle)
        db.flush()
    return motorcycle


def upsert_part(db, part_payload):
    part = db.scalar(select(ModPart).where(ModPart.name == part_payload["name"]))
    if part is None:
        part = ModPart(
            name=part_payload["name"],
            category=part_payload["category"],
            price=part_payload["price"],
            weight_delta=part_payload["weight_delta"],
            hp_delta=part_payload["hp_delta"],
            description=part_payload["description"],
            model_url=part_payload["model_url"],
        )
        db.add(part)
        db.flush()
    return part


def ensure_compatibility(db, motorcycle_id, mod_part_id):
    compatibility = db.scalar(
        select(Compatibility).where(
            Compatibility.motorcycle_id == motorcycle_id,
            Compatibility.mod_part_id == mod_part_id,
        )
    )
    if compatibility is None:
        db.add(Compatibility(motorcycle_id=motorcycle_id, mod_part_id=mod_part_id))


def seed() -> None:
    Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        motorcycles_by_slug = {}
        for motorcycle_payload in MOTORCYCLES:
            motorcycle = upsert_motorcycle(db, motorcycle_payload)
            motorcycles_by_slug[motorcycle_payload["slug"]] = {
                "id": motorcycle.id,
                "segment": motorcycle_payload["segment"],
            }

        for part_payload in MOD_PARTS:
            part = upsert_part(db, part_payload)
            for motorcycle_info in motorcycles_by_slug.values():
                if motorcycle_info["segment"] in part_payload["segments"]:
                    ensure_compatibility(db, motorcycle_info["id"], part.id)

        db.commit()


if __name__ == "__main__":
    seed()
