from __future__ import annotations

from sqlalchemy import Select, select
from sqlalchemy.orm import Session

from app.models.motorcycle import Motorcycle
from app.utils.exceptions import BikeNotFound


def get_all_motorcycles(
    db: Session,
    *,
    brand: str | None = None,
    year_from: int | None = None,
    year_to: int | None = None,
    limit: int = 100,
    offset: int = 0,
) -> list[Motorcycle]:
    statement: Select[tuple[Motorcycle]] = select(Motorcycle)
    if brand:
        statement = statement.where(Motorcycle.brand.ilike(brand.strip()))
    if year_from:
        statement = statement.where(Motorcycle.year >= year_from)
    if year_to:
        statement = statement.where(Motorcycle.year <= year_to)

    statement = (
        statement.order_by(Motorcycle.brand, Motorcycle.name)
        .limit(limit)
        .offset(offset)
    )
    return list(db.scalars(statement).all())


def get_motorcycle_by_id(db: Session, id: int) -> Motorcycle:
    motorcycle = db.get(Motorcycle, id)
    if motorcycle is None:
        raise BikeNotFound(id)
    return motorcycle
