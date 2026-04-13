from __future__ import annotations

from pydantic import BaseModel


class CatalogBrandRead(BaseModel):
    id: str
    name: str


class CatalogModelRead(BaseModel):
    id: str
    name: str
    years: list[int]
    category: str | None = None


class CatalogBrandsResponse(BaseModel):
    source: str
    attribution: str | None = None
    items: list[CatalogBrandRead]


class CatalogModelsResponse(BaseModel):
    source: str
    attribution: str | None = None
    items: list[CatalogModelRead]


class CatalogImportRequest(BaseModel):
    brand_name: str
    brand_id: str | None = None
    model_name: str
    model_id: str | None = None
    year: int
    category: str | None = None


class CatalogImportResponse(BaseModel):
    id: int
    brand: str
    name: str
    year: int
    segment: str
    asset_status: str
    source_provider: str
    source_id: str | None = None
    created: bool
