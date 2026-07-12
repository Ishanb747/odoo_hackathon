"""add_superadmin

Revision ID: 128892f2fa74
Revises: 20aa39d0df9c
Create Date: 2026-07-12 14:03:25.676911

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '128892f2fa74'
down_revision: Union[str, Sequence[str], None] = '20aa39d0df9c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE employeerole ADD VALUE IF NOT EXISTS 'superadmin'")


def downgrade() -> None:
    """Downgrade schema."""
    pass
