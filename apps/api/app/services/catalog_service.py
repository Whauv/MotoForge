from __future__ import annotations

import re
from datetime import datetime, timedelta, timezone
from typing import Any

import httpx
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.models.compatibility import Compatibility
from app.models.mod_part import ModPart
from app.models.motorcycle import Motorcycle
from app.schemas.catalog import (
    CatalogBrandRead,
    CatalogBrandsResponse,
    CatalogImportRequest,
    CatalogImportResponse,
    CatalogModelRead,
    CatalogModelsResponse,
)

_CACHE: dict[str, tuple[datetime, Any]] = {}
_YEAR_PATTERN = re.compile(r"\b(19|20)\d{2}\b")


def _cache_get(key: str) -> Any | None:
    cached = _CACHE.get(key)
    if cached is None:
        return None

    expires_at, value = cached
    if expires_at <= datetime.now(timezone.utc):
        _CACHE.pop(key, None)
        return None

    return value


def _cache_set(key: str, value: Any) -> Any:
    ttl = max(settings.catalog_cache_ttl_seconds, 60)
    _CACHE[key] = (
        datetime.now(timezone.utc) + timedelta(seconds=ttl),
        value,
    )
    return value


def _normalize_name(value: str) -> str:
    return re.sub(r"[^a-z0-9]", "", value.lower())


def _slugify(value: str) -> str:
    normalized = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return normalized or "motorcycle"


def _segment_from_category(category: str | None, model_name: str) -> str:
    combined = f"{category or ''} {model_name}".lower()
    if any(token in combined for token in ("sport", "supersport", "ninja", "hayabusa")):
        return "sport"
    if any(token in combined for token in ("cruiser", "bobber", "harley", "iron")):
        return "cruiser"
    if any(token in combined for token in ("classic", "retro", "interceptor", "nine")):
        return "retro"
    return "naked"


def _local_brands(db: Session) -> CatalogBrandsResponse:
    statement = select(Motorcycle.brand).distinct().order_by(Motorcycle.brand)
    brands = [
        CatalogBrandRead(id=brand, name=brand)
        for brand in db.scalars(statement)
    ]
    return CatalogBrandsResponse(source="local", items=brands)


def _local_models(db: Session, brand_name: str) -> CatalogModelsResponse:
    statement = (
        select(Motorcycle)
        .where(Motorcycle.brand == brand_name)
        .order_by(Motorcycle.name, Motorcycle.year.desc())
    )
    motorcycles = list(db.scalars(statement).all())
    grouped: dict[str, set[int]] = {}

    for motorcycle in motorcycles:
        if motorcycle.year < 2015:
            continue
        grouped.setdefault(motorcycle.name, set()).add(motorcycle.year)

    items = [
        CatalogModelRead(
            id=f"{brand_name}:{name}",
            name=name,
            years=sorted(years, reverse=True),
        )
        for name, years in sorted(grouped.items())
    ]
    return CatalogModelsResponse(source="local", items=items)


async def _fetch_provider_json(path: str) -> Any:
    cache_key = f"motormanage:{path}"
    cached = _cache_get(cache_key)
    if cached is not None:
        return cached

    headers = {"Accept": "application/json"}
    if settings.motormanage_api_key:
        headers["X-API-KEY"] = settings.motormanage_api_key

    base_url = settings.motormanage_base_url.rstrip("/")
    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.get(f"{base_url}{path}", headers=headers)
        response.raise_for_status()
        return _cache_set(cache_key, response.json())


def _provider_enabled() -> bool:
    return (
        settings.motorcycle_catalog_provider.lower() == "motormanage"
        and bool(settings.motormanage_api_key)
    )


def _extract_years(value: Any) -> list[int]:
    current_year = datetime.now(timezone.utc).year
    years: set[int] = set()

    if isinstance(value, int):
        if 2015 <= value <= current_year:
            return [value]
        return []

    if isinstance(value, list):
        for item in value:
            years.update(_extract_years(item))
        return sorted(years, reverse=True)

    if isinstance(value, str):
        matches = [int(match.group(0)) for match in _YEAR_PATTERN.finditer(value)]
        if matches:
            for year in matches:
                if 2015 <= year <= current_year:
                    years.add(year)

            if len(matches) >= 2 and "-" in value:
                lower = max(min(matches), 2015)
                upper = min(max(matches), current_year)
                years.update(range(lower, upper + 1))

    return sorted(years, reverse=True)


async def get_catalog_brands(db: Session) -> CatalogBrandsResponse:
    if not _provider_enabled():
        return _local_brands(db)

    try:
        payload = await _fetch_provider_json("/brands")
    except httpx.HTTPError:
        return _local_brands(db)

    raw_items = payload if isinstance(payload, list) else payload.get("data", [])
    items: list[CatalogBrandRead] = []

    for item in raw_items:
        brand_id = str(item.get("id") or item.get("slug") or item.get("name") or "")
        name = str(item.get("name") or item.get("brand") or "").strip()
        if not brand_id or not name:
            continue
        items.append(CatalogBrandRead(id=brand_id, name=name))

    items.sort(key=lambda item: item.name)
    return CatalogBrandsResponse(
        source="motormanage",
        attribution="MotorManage",
        items=items,
    )


async def get_catalog_models(
    db: Session,
    *,
    brand_id: str | None,
    brand_name: str,
) -> CatalogModelsResponse:
    if not _provider_enabled() or not brand_id:
        return _local_models(db, brand_name)

    try:
        payload = await _fetch_provider_json(f"/brands/{brand_id}/motorcycles")
    except httpx.HTTPError:
        return _local_models(db, brand_name)

    raw_items = payload if isinstance(payload, list) else payload.get("data", [])
    grouped: dict[str, CatalogModelRead] = {}

    for item in raw_items:
        raw_name = str(
            item.get("name")
            or item.get("model")
            or item.get("title")
            or ""
        ).strip()
        if not raw_name:
            continue

        name = raw_name.removeprefix(f"{brand_name} ").strip() or raw_name
        years = _extract_years(
            item.get("years")
            or item.get("year")
            or item.get("production_years")
        )
        if not years:
            continue

        category = item.get("category")
        key = _normalize_name(name)
        existing = grouped.get(key)
        if existing is None:
            grouped[key] = CatalogModelRead(
                id=str(item.get("id") or item.get("slug") or key),
                name=name,
                years=years,
                category=str(category).strip() if category else None,
            )
            continue

        existing.years = sorted(set(existing.years).union(years), reverse=True)
        if existing.category is None and category:
            existing.category = str(category).strip()

    items = sorted(grouped.values(), key=lambda item: item.name)
    return CatalogModelsResponse(
        source="motormanage",
        attribution="MotorManage",
        items=items,
    )


def import_catalog_motorcycle(
    db: Session,
    payload: CatalogImportRequest,
) -> CatalogImportResponse:
    existing = db.scalar(
        select(Motorcycle).where(
            Motorcycle.brand == payload.brand_name,
            Motorcycle.name == payload.model_name,
            Motorcycle.year == payload.year,
        )
    )

    if existing is not None:
        return CatalogImportResponse(
            id=existing.id,
            brand=existing.brand,
            name=existing.name,
            year=existing.year,
            segment=existing.segment,
            asset_status=existing.asset_status,
            source_provider=existing.source_provider,
            source_id=existing.source_id,
            created=False,
        )

    segment = _segment_from_category(payload.category, payload.model_name)
    source_id = payload.model_id or payload.brand_id
    model_slug = _slugify(f"{payload.brand_name}-{payload.model_name}-{payload.year}")
    motorcycle = Motorcycle(
        name=payload.model_name,
        brand=payload.brand_name,
        year=payload.year,
        base_price=0,
        base_weight_kg=0,
        base_hp=0,
        model_url=f"https://cdn.motoforge.local/models/{model_slug}.glb",
        segment=segment,
        source_provider=settings.motorcycle_catalog_provider,
        source_id=source_id,
        asset_status="placeholder",
    )
    db.add(motorcycle)
    db.flush()

    compatible_parts = list(db.scalars(select(ModPart)).all())
    for part in compatible_parts:
        supported_segments = {
            segment.strip()
            for segment in (part.supported_segments or "").split(",")
            if segment.strip()
        }
        if not supported_segments or segment in supported_segments:
            db.add(
                Compatibility(
                    motorcycle_id=motorcycle.id,
                    mod_part_id=part.id,
                )
            )

    db.commit()
    db.refresh(motorcycle)

    return CatalogImportResponse(
        id=motorcycle.id,
        brand=motorcycle.brand,
        name=motorcycle.name,
        year=motorcycle.year,
        segment=motorcycle.segment,
        asset_status=motorcycle.asset_status,
        source_provider=motorcycle.source_provider,
        source_id=motorcycle.source_id,
        created=True,
    )
