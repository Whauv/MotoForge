from __future__ import annotations

from sqlalchemy import Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Motorcycle(Base):
    __tablename__ = "motorcycles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    brand: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    base_price: Mapped[float] = mapped_column(Float, nullable=False)
    base_weight_kg: Mapped[float] = mapped_column(Float, nullable=False)
    base_hp: Mapped[float] = mapped_column(Float, nullable=False)
    model_url: Mapped[str] = mapped_column(String(512), nullable=False)

    compatibilities = relationship(
        "Compatibility",
        back_populates="motorcycle",
        cascade="all, delete-orphan",
    )
