"""
Create subscription tables for implementing the freemium tier structure.

This migration creates:
1. user_subscriptions table for tracking user subscription status
2. feature_usage table for tracking feature usage limits
3. subscription_events table for tracking subscription changes
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid

# revision identifiers
revision = '001_create_subscription_tables'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Create user_subscriptions table
    op.create_table(
        'user_subscriptions',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('subscription_tier', sa.String(20), nullable=False, default='free'),
        sa.Column('stripe_customer_id', sa.String(255), nullable=True),
        sa.Column('stripe_subscription_id', sa.String(255), nullable=True),
        sa.Column('current_period_start', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('current_period_end', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('cancel_at_period_end', sa.Boolean, default=False),
        sa.Column('status', sa.String(20), nullable=False, default='active'),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now())
    )
    op.create_index('idx_user_subscriptions_user_id', 'user_subscriptions', ['user_id'])

    # Create feature_usage table
    op.create_table(
        'feature_usage',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('feature_name', sa.String(50), nullable=False),
        sa.Column('usage_date', sa.Date, nullable=False, server_default=sa.func.current_date()),
        sa.Column('usage_count', sa.Integer, nullable=False, default=1),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now())
    )
    op.create_index('idx_feature_usage_user_feature_date', 'feature_usage', ['user_id', 'feature_name', 'usage_date'], unique=True)

    # Create subscription_events table
    op.create_table(
        'subscription_events',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('event_type', sa.String(50), nullable=False),
        sa.Column('previous_tier', sa.String(20), nullable=True),
        sa.Column('new_tier', sa.String(20), nullable=True),
        sa.Column('metadata', JSONB, nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.func.now())
    )
    op.create_index('idx_subscription_events_user_id', 'subscription_events', ['user_id'])
    op.create_index('idx_subscription_events_event_type', 'subscription_events', ['event_type'])


def downgrade():
    op.drop_table('subscription_events')
    op.drop_table('feature_usage')
    op.drop_table('user_subscriptions')
