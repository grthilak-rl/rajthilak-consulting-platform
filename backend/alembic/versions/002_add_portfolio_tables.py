"""add case_studies, services, testimonials, site_content tables

Revision ID: 002
Revises: 001
Create Date: 2026-02-20

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "case_studies",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("slug", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("role", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("industry", sa.String(), nullable=False),
        sa.Column("technologies", postgresql.JSON(), nullable=False, server_default="[]"),
        sa.Column("featured", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("metrics", postgresql.JSON(), nullable=True),
        sa.Column("visual_color", sa.String(), nullable=False, server_default="'primary'"),
        sa.Column("visual_icon", sa.String(), nullable=False, server_default="'code'"),
        sa.Column("display_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_case_studies_slug", "case_studies", ["slug"], unique=True)

    op.create_table(
        "services",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("slug", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("icon", sa.String(), nullable=False, server_default="'briefcase'"),
        sa.Column("tags", postgresql.JSON(), nullable=False, server_default="[]"),
        sa.Column("display_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_services_slug", "services", ["slug"], unique=True)

    op.create_table(
        "testimonials",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("author_name", sa.String(), nullable=False),
        sa.Column("author_role", sa.String(), nullable=False),
        sa.Column("author_company", sa.String(), nullable=False),
        sa.Column("author_initials", sa.String(5), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("rating", sa.Integer(), nullable=False, server_default="5"),
        sa.Column("featured", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )

    op.create_table(
        "site_content",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("key", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("metadata", postgresql.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_site_content_key", "site_content", ["key"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_site_content_key", table_name="site_content")
    op.drop_table("site_content")
    op.drop_table("testimonials")
    op.drop_index("ix_services_slug", table_name="services")
    op.drop_table("services")
    op.drop_index("ix_case_studies_slug", table_name="case_studies")
    op.drop_table("case_studies")
