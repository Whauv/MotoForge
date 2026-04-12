from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict


PartCategory = Literal["exhaust", "suspension", "wheels", "fairings", "handlebars"]


class ModPartBase(BaseModel):
    name: str
    category: PartCategory
    price: float
    weight_delta: float
    hp_delta: float
    description: str
    model_url: str


class ModPartCreate(ModPartBase):
    pass


class ModPartRead(ModPartBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
