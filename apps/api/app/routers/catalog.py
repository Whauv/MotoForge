from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.catalog import (
    CatalogBrandsResponse,
    CatalogImportRequest,
    CatalogImportResponse,
    CatalogModelsResponse,
)
from app.services.catalog_service import (
    get_catalog_brands,
    get_catalog_models,
    import_catalog_motorcycle,
)

router = APIRouter(prefix="/catalog", tags=["catalog"])


@router.get("/brands", response_model=CatalogBrandsResponse)
async def list_catalog_brands(
    db: Session = Depends(get_db),
) -> CatalogBrandsResponse:
    return await get_catalog_brands(db)


@router.get("/models", response_model=CatalogModelsResponse)
async def list_catalog_models(
    brand_name: str = Query(..., min_length=1),
    brand_id: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> CatalogModelsResponse:
    return await get_catalog_models(db, brand_id=brand_id, brand_name=brand_name)


@router.post("/import", response_model=CatalogImportResponse)
def import_motorcycle_from_catalog(
    payload: CatalogImportRequest,
    db: Session = Depends(get_db),
) -> CatalogImportResponse:
    return import_catalog_motorcycle(db, payload)
