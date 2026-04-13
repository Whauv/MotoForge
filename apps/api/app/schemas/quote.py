from __future__ import annotations

from pydantic import BaseModel


class QuoteRequest(BaseModel):
    motorcycle_id: int
    selected_part_ids: list[int]
    owns_bike: bool = False


class LineItem(BaseModel):
    name: str
    category: str
    price: float
    weight_delta: float
    hp_delta: float


class QuoteResponse(BaseModel):
    total_price: float
    base_price_included: float
    parts_subtotal: float
    new_hp: float
    new_weight_kg: float
    hp_gain: float
    weight_change: float
    line_items: list[LineItem]
