"""
User model for the application.

This module defines the SQLAlchemy model for users and related user information.
"""

from datetime import datetime
from typing import Optional, List
from uuid import UUID, uuid4

from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PGUUID, TIMESTAMP, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from backend.src.db.base import Base


class User(Base):
    """
    User model representing application users.
    """

    __tablename__ = "users"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
    preferences = Column(JSONB, nullable=True, default={})
    last_login = Column(TIMESTAMP(timezone=True), nullable=True)

    # Relationships for subscription system
    subscription = relationship("UserSubscription", uselist=False, back_populates="user")
    feature_usages = relationship("FeatureUsage", back_populates="user")
    subscription_events = relationship("SubscriptionEvent", back_populates="user")

    # Other relationships will be added as features are implemented
    # For example: ask_interactions, journal_entries, etc.

    @property
    def subscription_tier(self) -> str:
        """Get the user's current subscription tier."""
        if not self.subscription:
            return "free"
        return self.subscription.subscription_tier

    def is_tier_or_higher(self, tier: str) -> bool:
        """
        Check if the user's subscription is at or above the specified tier.

        Args:
            tier: The tier to check against ("free", "premium", or "pro")

        Returns:
            bool: True if the user's tier is equal to or higher than the specified tier
        """
        tier_levels = {"free": 0, "premium": 1, "pro": 2}

        user_tier_level = tier_levels.get(self.subscription_tier, 0)
        required_tier_level = tier_levels.get(tier, 0)

        return user_tier_level >= required_tier_level
