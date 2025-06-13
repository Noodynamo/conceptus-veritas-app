"""
Models for the subscription system.

This module defines the SQLAlchemy models for:
- UserSubscription: Tracks user subscription details
- FeatureUsage: Records usage of limited features
- SubscriptionEvent: Logs subscription-related events
"""
from datetime import datetime, date
from typing import Optional, Dict, Any
from uuid import UUID, uuid4

from sqlalchemy import Column, String, Integer, Boolean, Date, ForeignKey, Text, JSON, Index
from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from backend.src.db.base import Base


class UserSubscription(Base):
    """Model for storing user subscription information."""

    __tablename__ = "user_subscriptions"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    subscription_tier = Column(String(20), nullable=False, default="free")
    stripe_customer_id = Column(String(255), nullable=True)
    stripe_subscription_id = Column(String(255), nullable=True)
    current_period_start = Column(TIMESTAMP(timezone=True), nullable=True)
    current_period_end = Column(TIMESTAMP(timezone=True), nullable=True)
    cancel_at_period_end = Column(Boolean, default=False)
    status = Column(String(20), nullable=False, default="active")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="subscriptions")
    events = relationship("SubscriptionEvent", back_populates="subscription")

    # Create an index on user_id for faster lookups
    __table_args__ = (
        Index("idx_user_subscriptions_user_id", user_id),
    )

    @property
    def is_active(self) -> bool:
        """Check if the subscription is active."""
        return self.status == "active"

    @property
    def is_premium(self) -> bool:
        """Check if the subscription is Premium or Pro tier."""
        return self.subscription_tier in ["premium", "pro"]

    @property
    def is_pro(self) -> bool:
        """Check if the subscription is Pro tier."""
        return self.subscription_tier == "pro"


class FeatureUsage(Base):
    """Model for tracking daily feature usage per user."""

    __tablename__ = "feature_usage"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    feature_name = Column(String(50), nullable=False)
    usage_date = Column(Date, nullable=False, default=datetime.now().date)
    usage_count = Column(Integer, nullable=False, default=1)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="feature_usage")

    # Create a unique index on the combination of user_id, feature_name, and usage_date
    __table_args__ = (
        Index("idx_feature_usage_user_feature_date", user_id, feature_name, usage_date, unique=True),
    )

    def increment(self, amount: int = 1) -> int:
        """Increment the usage count by the specified amount."""
        self.usage_count += amount
        self.updated_at = datetime.now()
        return self.usage_count


class SubscriptionEvent(Base):
    """Model for tracking subscription-related events."""

    __tablename__ = "subscription_events"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    subscription_id = Column(PGUUID(as_uuid=True), ForeignKey("user_subscriptions.id"), nullable=False)
    event_type = Column(String(50), nullable=False)
    previous_tier = Column(String(20), nullable=True)
    new_tier = Column(String(20), nullable=True)
    metadata = Column(JSON, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="subscription_events")
    subscription = relationship("UserSubscription", back_populates="events")

    # Create indexes for faster lookups
    __table_args__ = (
        Index("idx_subscription_events_user_id", user_id),
        Index("idx_subscription_events_event_type", event_type),
    )

    @classmethod
    def create_subscription_changed_event(
        cls,
        user_id: UUID,
        previous_tier: str,
        new_tier: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> "SubscriptionEvent":
        """Create a subscription changed event."""
        return cls(
            user_id=user_id,
            event_type="subscription_changed",
            previous_tier=previous_tier,
            new_tier=new_tier,
            metadata=metadata or {}
        )
