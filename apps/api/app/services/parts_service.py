from __future__ import annotations

from collections import defaultdict

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.compatibility import Compatibility
from app.models.mod_part import ModPart
from app.services.motorcycle_service import get_motorcycle_by_id
from app.utils.exceptions import IncompatiblePart, PartNotFound


def get_parts_for_bike(
    db: Session,
    motorcycle_id: int,
) -> dict[str, list[ModPart]]:
    get_motorcycle_by_id(db, motorcycle_id)

    statement = (
        select(ModPart)
        .join(Compatibility, Compatibility.mod_part_id == ModPart.id)
        .where(Compatibility.motorcycle_id == motorcycle_id)
        .order_by(ModPart.category, ModPart.name)
    )
    parts = list(db.scalars(statement).all())

    grouped: dict[str, list[ModPart]] = defaultdict(list)
    for part in parts:
        grouped[str(part.category.value)].append(part)

    return dict(grouped)


def validate_parts_compatibility(
    db: Session,
    motorcycle_id: int,
    part_ids: list[int],
) -> None:
    if not part_ids:
        return

    get_motorcycle_by_id(db, motorcycle_id)

    unique_part_ids = list(dict.fromkeys(part_ids))
    parts = list(
        db.scalars(select(ModPart).where(ModPart.id.in_(unique_part_ids))).all()
    )
    found_ids = {part.id for part in parts}
    missing_ids = [part_id for part_id in unique_part_ids if part_id not in found_ids]
    if missing_ids:
        raise PartNotFound(missing_ids[0])

    compatibility_rows = list(
        db.scalars(
            select(Compatibility.mod_part_id).where(
                Compatibility.motorcycle_id == motorcycle_id,
                Compatibility.mod_part_id.in_(unique_part_ids),
            )
        ).all()
    )
    compatible_ids = set(compatibility_rows)
    incompatible_ids = [
        part_id for part_id in unique_part_ids if part_id not in compatible_ids
    ]
    if incompatible_ids:
        raise IncompatiblePart(motorcycle_id, incompatible_ids)
