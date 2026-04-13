from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.mod_part import ModPart
from app.schemas.quote import LineItem, QuoteResponse
from app.services.motorcycle_service import get_motorcycle_by_id
from app.services.parts_service import validate_parts_compatibility


def calculate_quote(
    db: Session,
    motorcycle_id: int,
    selected_part_ids: list[int],
    owns_bike: bool = False,
) -> QuoteResponse:
    motorcycle = get_motorcycle_by_id(db, motorcycle_id)
    validate_parts_compatibility(db, motorcycle_id, selected_part_ids)

    ordered_parts: list[ModPart] = []
    if selected_part_ids:
        unique_part_ids = list(dict.fromkeys(selected_part_ids))
        parts_by_id = {
            part.id: part
            for part in db.scalars(
                select(ModPart).where(ModPart.id.in_(unique_part_ids))
            ).all()
        }
        ordered_parts = [parts_by_id[part_id] for part_id in selected_part_ids]

    parts_total = sum(part.price for part in ordered_parts)
    base_price_included = 0 if owns_bike else motorcycle.base_price
    total_weight_delta = sum(part.weight_delta for part in ordered_parts)
    total_hp_delta = sum(part.hp_delta for part in ordered_parts)

    return QuoteResponse(
        total_price=round(base_price_included + parts_total, 2),
        base_price_included=round(base_price_included, 2),
        parts_subtotal=round(parts_total, 2),
        new_hp=round(motorcycle.base_hp + total_hp_delta, 2),
        new_weight_kg=round(motorcycle.base_weight_kg + total_weight_delta, 2),
        hp_gain=round(total_hp_delta, 2),
        weight_change=round(total_weight_delta, 2),
        line_items=[
            LineItem(
                name=part.name,
                category=part.category.value,
                price=round(part.price, 2),
                weight_delta=round(part.weight_delta, 2),
                hp_delta=round(part.hp_delta, 2),
            )
            for part in ordered_parts
        ],
    )
