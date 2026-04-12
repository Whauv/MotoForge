from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.motorcycle import MotorcycleRead
from app.services.motorcycle_service import get_all_motorcycles, get_motorcycle_by_id

router = APIRouter(prefix="/motorcycles", tags=["motorcycles"])


@router.get("", response_model=list[MotorcycleRead])
def list_motorcycles(db: Session = Depends(get_db)) -> list[MotorcycleRead]:
    return get_all_motorcycles(db)


@router.get("/{id}", response_model=MotorcycleRead)
def read_motorcycle(id: int, db: Session = Depends(get_db)) -> MotorcycleRead:
    return get_motorcycle_by_id(db, id)
