from __future__ import annotations

from sqlalchemy import ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Compatibility(Base):
    __tablename__ = "compatibilities"
    __table_args__ = (
        UniqueConstraint("motorcycle_id", "mod_part_id", name="uq_motorcycle_mod_part"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    motorcycle_id: Mapped[int] = mapped_column(
        ForeignKey("motorcycles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    mod_part_id: Mapped[int] = mapped_column(
        ForeignKey("mod_parts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    motorcycle = relationship("Motorcycle", back_populates="compatibilities")
    mod_part = relationship("ModPart", back_populates="compatibilities")
