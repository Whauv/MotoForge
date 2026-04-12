from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.motorcycle import Motorcycle
from app.utils.exceptions import BikeNotFound


def get_all_motorcycles(db: Session) -> list[Motorcycle]:
    statement = select(Motorcycle).order_by(Motorcycle.brand, Motorcycle.name)
    return list(db.scalars(statement).all())


def get_motorcycle_by_id(db: Session, id: int) -> Motorcycle:
    motorcycle = db.get(Motorcycle, id)
    if motorcycle is None:
        raise BikeNotFound(id)
    return motorcycle
