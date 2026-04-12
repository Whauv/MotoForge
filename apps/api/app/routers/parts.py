from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.mod_part import ModPartRead
from app.services.parts_service import get_parts_for_bike

router = APIRouter(prefix="/motorcycles", tags=["parts"])


@router.get("/{id}/parts", response_model=dict[str, list[ModPartRead]])
def list_parts_for_motorcycle(
    id: int,
    db: Session = Depends(get_db),
) -> dict[str, list[ModPartRead]]:
    return get_parts_for_bike(db, id)
