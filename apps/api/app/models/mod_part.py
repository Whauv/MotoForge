from __future__ import annotations

from enum import Enum

from sqlalchemy import Enum as SqlEnum
from sqlalchemy import Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ModPartCategory(str, Enum):
    EXHAUST = "exhaust"
    SUSPENSION = "suspension"
    WHEELS = "wheels"
    FAIRINGS = "fairings"
    HANDLEBARS = "handlebars"


class ModPart(Base):
    __tablename__ = "mod_parts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False, index=True)
    category: Mapped[ModPartCategory] = mapped_column(
        SqlEnum(ModPartCategory, native_enum=False),
        nullable=False,
        index=True,
    )
    price: Mapped[float] = mapped_column(Float, nullable=False)
    weight_delta: Mapped[float] = mapped_column(Float, nullable=False)
    hp_delta: Mapped[float] = mapped_column(Float, nullable=False)
    description: Mapped[str] = mapped_column(String(1000), nullable=False)
    model_url: Mapped[str] = mapped_column(String(512), nullable=False)

    compatibilities = relationship(
        "Compatibility",
        back_populates="mod_part",
        cascade="all, delete-orphan",
    )
