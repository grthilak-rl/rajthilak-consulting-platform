"""add rich content sections to case_studies

Revision ID: 003
Revises: 002
Create Date: 2026-02-22

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("case_studies", sa.Column("problem", sa.Text(), nullable=True))
    op.add_column("case_studies", sa.Column("solution", sa.Text(), nullable=True))
    op.add_column("case_studies", sa.Column("role_description", sa.Text(), nullable=True))
    op.add_column("case_studies", sa.Column("key_features", postgresql.JSON(), nullable=True))
    op.add_column("case_studies", sa.Column("architecture", sa.Text(), nullable=True))
    op.add_column("case_studies", sa.Column("challenges", sa.Text(), nullable=True))
    op.add_column("case_studies", sa.Column("impact", sa.Text(), nullable=True))
    op.add_column("case_studies", sa.Column("gallery", postgresql.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column("case_studies", "gallery")
    op.drop_column("case_studies", "impact")
    op.drop_column("case_studies", "challenges")
    op.drop_column("case_studies", "architecture")
    op.drop_column("case_studies", "key_features")
    op.drop_column("case_studies", "role_description")
    op.drop_column("case_studies", "solution")
    op.drop_column("case_studies", "problem")
