from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.motorcycle import MotorcycleRead
from app.services.motorcycle_service import get_all_motorcycles, get_motorcycle_by_id

router = APIRouter(prefix="/motorcycles", tags=["motorcycles"])


@router.get("", response_model=list[MotorcycleRead])
def list_motorcycles(
    db: Session = Depends(get_db),
    brand: str | None = Query(default=None),
    year_from: int | None = Query(default=None, ge=1900, le=2100),
    year_to: int | None = Query(default=None, ge=1900, le=2100),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
) -> list[MotorcycleRead]:
    return get_all_motorcycles(
        db,
        brand=brand,
        year_from=year_from,
        year_to=year_to,
        limit=limit,
        offset=offset,
    )


@router.get("/{id}", response_model=MotorcycleRead)
def read_motorcycle(id: int, db: Session = Depends(get_db)) -> MotorcycleRead:
    return get_motorcycle_by_id(db, id)
