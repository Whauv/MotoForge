from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class MotorcycleBase(BaseModel):
    name: str
    brand: str
    year: int
    base_price: float
    base_weight_kg: float
    base_hp: float
    model_url: str


class MotorcycleCreate(MotorcycleBase):
    pass


class MotorcycleRead(MotorcycleBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
