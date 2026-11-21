"""Initial migration - create all tables

Revision ID: 001_initial
Revises: 
Create Date: 2024-01-01 00:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("hashed_password", sa.String(), nullable=True),
        sa.Column("google_id", sa.String(), nullable=True),
        sa.Column("avatar_url", sa.String(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=True, default=True),
        sa.Column("is_premium", sa.Boolean(), nullable=True, default=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
        sa.UniqueConstraint("google_id"),
    )
    op.create_index("ix_users_email", "users", ["email"])

    op.create_table(
        "destinations",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("country", sa.String(), nullable=False),
        sa.Column("region", sa.String(), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("image_url", sa.String(), nullable=True),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column("avg_budget_inr", sa.Float(), nullable=True),
        sa.Column("best_months", sa.JSON(), nullable=True),
        sa.Column("tags", sa.JSON(), nullable=True),
        sa.Column("visa_required_for_indian", sa.Boolean(), nullable=True),
        sa.Column("language", sa.String(), nullable=True),
        sa.Column("currency", sa.String(), nullable=True),
        sa.Column("timezone", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "trips",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("destination", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("duration_days", sa.Integer(), nullable=False),
        sa.Column("budget_tier", sa.String(), nullable=True),
        sa.Column("total_budget", sa.Float(), nullable=True),
        sa.Column("currency", sa.String(), nullable=True, default="INR"),
        sa.Column("start_date", sa.DateTime(), nullable=True),
        sa.Column("end_date", sa.DateTime(), nullable=True),
        sa.Column("itinerary", sa.JSON(), nullable=True),
        sa.Column("is_saved", sa.Boolean(), nullable=True, default=False),
        sa.Column("is_shared", sa.Boolean(), nullable=True, default=False),
        sa.Column("share_token", sa.String(), nullable=True),
        sa.Column("prompt_used", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("share_token"),
    )
    op.create_index("ix_trips_user_id", "trips", ["user_id"])

    op.create_table(
        "chat_histories",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("session_id", sa.String(), nullable=False),
        sa.Column("messages", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_chat_histories_session_id", "chat_histories", ["session_id"])


def downgrade() -> None:
    op.drop_table("chat_histories")
    op.drop_table("trips")
    op.drop_table("destinations")
    op.drop_table("users")
