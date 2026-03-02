"""add role and invite_token to users

Revision ID: 004
Revises: 003
Create Date: 2026-03-02

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "004"
down_revision: Union[str, None] = "003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create the enum type
    op.execute("CREATE TYPE userrole AS ENUM ('admin', 'editor', 'client')")

    # Add role column — default 'admin' so existing user gets admin role
    op.add_column(
        "users",
        sa.Column(
            "role",
            sa.Enum("admin", "editor", "client", name="userrole", create_type=False),
            nullable=False,
            server_default="admin",
        ),
    )

    # Add invite_token column
    op.add_column("users", sa.Column("invite_token", sa.String(), nullable=True))
    op.create_index("ix_users_invite_token", "users", ["invite_token"], unique=True)

    # Make password_hash nullable (for pending client invitations)
    op.alter_column("users", "password_hash", existing_type=sa.String(), nullable=True)


def downgrade() -> None:
    op.alter_column("users", "password_hash", existing_type=sa.String(), nullable=False)
    op.drop_index("ix_users_invite_token", table_name="users")
    op.drop_column("users", "invite_token")
    op.drop_column("users", "role")
    op.execute("DROP TYPE IF EXISTS userrole")
