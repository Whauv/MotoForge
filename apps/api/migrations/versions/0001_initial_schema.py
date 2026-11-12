"""Initial schema: motorcycles, mod_parts, compatibilities.

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-11-12
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None

MOD_PART_CATEGORIES = ("EXHAUST", "SUSPENSION", "WHEELS", "FAIRINGS", "HANDLEBARS")


def upgrade() -> None:
    op.create_table(
        "motorcycles",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(120), nullable=False),
        sa.Column("brand", sa.String(120), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("base_price", sa.Float(), nullable=False),
        sa.Column("base_weight_kg", sa.Float(), nullable=False),
        sa.Column("base_hp", sa.Float(), nullable=False),
        sa.Column("model_url", sa.String(512), nullable=False),
        sa.Column("segment", sa.String(80), nullable=False),
        sa.Column("source_provider", sa.String(120), nullable=False),
        sa.Column("source_id", sa.String(160), nullable=True),
        sa.Column("asset_status", sa.String(80), nullable=False),
    )
    op.create_index("ix_motorcycles_id", "motorcycles", ["id"])
    op.create_index("ix_motorcycles_name", "motorcycles", ["name"])
    op.create_index("ix_motorcycles_brand", "motorcycles", ["brand"])

    op.create_table(
        "mod_parts",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(160), nullable=False),
        sa.Column(
            "category",
            sa.Enum(
                *MOD_PART_CATEGORIES,
                name="modpartcategory",
                native_enum=False,
                length=10,
            ),
            nullable=False,
        ),
        sa.Column("price", sa.Float(), nullable=False),
        sa.Column("weight_delta", sa.Float(), nullable=False),
        sa.Column("hp_delta", sa.Float(), nullable=False),
        sa.Column("description", sa.String(1000), nullable=False),
        sa.Column("model_url", sa.String(512), nullable=False),
        sa.Column("supported_segments", sa.String(240), nullable=False),
        sa.Column("brand", sa.String(120), nullable=True),
        sa.Column("sku", sa.String(120), nullable=True),
        sa.Column("asset_status", sa.String(80), nullable=False),
    )
    op.create_index("ix_mod_parts_id", "mod_parts", ["id"])
    op.create_index("ix_mod_parts_name", "mod_parts", ["name"])
    op.create_index("ix_mod_parts_category", "mod_parts", ["category"])

    op.create_table(
        "compatibilities",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "motorcycle_id",
            sa.Integer(),
            sa.ForeignKey("motorcycles.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "mod_part_id",
            sa.Integer(),
            sa.ForeignKey("mod_parts.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.UniqueConstraint(
            "motorcycle_id", "mod_part_id", name="uq_motorcycle_mod_part"
        ),
    )
    op.create_index("ix_compatibilities_id", "compatibilities", ["id"])
    op.create_index(
        "ix_compatibilities_motorcycle_id", "compatibilities", ["motorcycle_id"]
    )
    op.create_index(
        "ix_compatibilities_mod_part_id", "compatibilities", ["mod_part_id"]
    )


def downgrade() -> None:
    op.drop_table("compatibilities")
    op.drop_table("mod_parts")
    op.drop_table("motorcycles")
