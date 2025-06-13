"""
Subscription service for managing user subscriptions and feature access.

This module provides services for:
- Managing user subscription tiers
- Checking feature access based on subscription tier
- Tracking and limiting feature usage
- Recording subscription events
"""

import logging
from datetime import datetime, date, timedelta
from typing import Dict, List, Optional, Any, Tuple
from uuid import UUID

from fastapi import Depends, HTTPException, status
from sqlalchemy import and_, func
from sqlalchemy.orm import Session

from backend.src.db.session import get_db
from backend.src.models.subscription import UserSubscription, FeatureUsage, SubscriptionEvent
from backend.src.models.user import User
from backend.src.schemas.subscription import (
    SubscriptionCreate,
    SubscriptionUpdate,
    FeatureUsageSummary,
    SubscriptionSummary,
)
from backend.src.services.analytics.analytics_service import AnalyticsService


logger = logging.getLogger(__name__)

# Define tier limits
TIER_LIMITS = {
    "free": {
        "ask_questions": 10,
        "journal_entries": 5,
        "quest_daily": 1,
        "forum_threads": 3,
        "forum_comments": 10,
        "forum_votes": 20,
        "insight_expansion": 0,
        "save_to_journal": 5,
        "concept_tagging": 3,
        "media_attachments": 2,
    },
    "premium": {
        "ask_questions": 50,
        "journal_entries": 100000,  # Effectively unlimited
        "quest_daily": 3,
        "forum_threads": 10,
        "forum_comments": 30,
        "forum_votes": 50,
        "insight_expansion": 5,
        "save_to_journal": 25,
        "concept_tagging": 10,
        "media_attachments": 5,
    },
    "pro": {
        "ask_questions": 100000,  # Effectively unlimited
        "journal_entries": 100000,  # Effectively unlimited
        "quest_daily": 5,
        "forum_threads": 100000,  # Effectively unlimited
        "forum_comments": 100000,  # Effectively unlimited
        "forum_votes": 100000,  # Effectively unlimited
        "insight_expansion": 100000,  # Effectively unlimited
        "save_to_journal": 100000,  # Effectively unlimited
        "concept_tagging": 100000,  # Effectively unlimited
        "media_attachments": 100000,  # Effectively unlimited
    }
}

# Define features that require specific tiers
TIER_FEATURES = {
    "free": [
        "basic_ask",
        "basic_journal",
        "basic_quest",
        "basic_explore",
        "basic_forum",
    ],
    "premium": [
        "basic_ask",
        "basic_journal",
        "basic_quest",
        "basic_explore",
        "basic_forum",
        "advanced_ask",
        "unlimited_journal",
        "advanced_quest",
        "advanced_explore",
        "advanced_forum",
        "extended_responses",
        "insight_expansion",
        "advanced_visualization",
    ],
    "pro": [
        "basic_ask",
        "basic_journal",
        "basic_quest",
        "basic_explore",
        "basic_forum",
        "advanced_ask",
        "unlimited_journal",
        "advanced_quest",
        "advanced_explore",
        "advanced_forum",
        "extended_responses",
        "insight_expansion",
        "advanced_visualization",
        "unlimited_ask",
        "custom_pathways",
        "premium_ai_models",
        "exclusive_content",
        "unlimited_export",
    ]
}


class SubscriptionService:
    """Service for managing subscriptions and feature access."""

    def __init__(self, db: Session = Depends(get_db), analytics: Optional[AnalyticsService] = None):
        self.db = db
        self.analytics = analytics

    def get_user_subscription(self, user_id: UUID) -> Optional[UserSubscription]:
        """
        Get a user's subscription.

        Args:
            user_id: The ID of the user

        Returns:
            Optional[UserSubscription]: The user's subscription or None if not found
        """
        return self.db.query(UserSubscription).filter(UserSubscription.user_id == user_id).first()

    def create_subscription(self, subscription_data: SubscriptionCreate) -> UserSubscription:
        """
        Create a new subscription for a user.

        Args:
            subscription_data: The subscription data

        Returns:
            UserSubscription: The created subscription
        """
        # Check if user already has a subscription
        existing = self.get_user_subscription(subscription_data.user_id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already has a subscription"
            )

        # Create new subscription
        subscription = UserSubscription(**subscription_data.dict())
        self.db.add(subscription)
        self.db.commit()
        self.db.refresh(subscription)

        # Record subscription event
        self._record_subscription_event(
            user_id=subscription_data.user_id,
            event_type="subscription_created",
            new_tier=subscription_data.subscription_tier,
        )

        # Track analytics event
        if self.analytics:
            self.analytics.track(
                user_id=str(subscription_data.user_id),
                event="subscription_created",
                properties={
                    "tier": subscription_data.subscription_tier,
                    "status": subscription_data.status,
                }
            )

        return subscription

    def update_subscription(
        self, user_id: UUID, subscription_data: SubscriptionUpdate
    ) -> UserSubscription:
        """
        Update a user's subscription.

        Args:
            user_id: The ID of the user
            subscription_data: The updated subscription data

        Returns:
            UserSubscription: The updated subscription
        """
        subscription = self.get_user_subscription(user_id)
        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User subscription not found"
            )

        # Store previous tier for event logging
        previous_tier = subscription.subscription_tier

        # Update subscription fields
        update_data = subscription_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(subscription, key, value)

        self.db.commit()
        self.db.refresh(subscription)

        # If tier changed, record subscription event
        if subscription_data.subscription_tier and previous_tier != subscription_data.subscription_tier:
            self._record_subscription_event(
                user_id=user_id,
                event_type="subscription_changed",
                previous_tier=previous_tier,
                new_tier=subscription_data.subscription_tier,
            )

            # Track tier change in analytics
            if self.analytics:
                self.analytics.track(
                    user_id=str(user_id),
                    event="subscription_tier_changed",
                    properties={
                        "previous_tier": previous_tier,
                        "new_tier": subscription_data.subscription_tier,
                    }
                )

        return subscription

    def cancel_subscription(self, user_id: UUID, immediate: bool = False) -> UserSubscription:
        """
        Cancel a user's subscription.

        Args:
            user_id: The ID of the user
            immediate: Whether to cancel immediately or at period end

        Returns:
            UserSubscription: The updated subscription
        """
        subscription = self.get_user_subscription(user_id)
        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User subscription not found"
            )

        if immediate:
            # Immediate cancellation
            subscription.status = "canceled"
            subscription.subscription_tier = "free"
        else:
            # Cancel at period end
            subscription.cancel_at_period_end = True

        self.db.commit()
        self.db.refresh(subscription)

        # Record cancellation event
        event_type = "subscription_canceled_immediate" if immediate else "subscription_canceled_period_end"
        self._record_subscription_event(
            user_id=user_id,
            event_type=event_type,
            previous_tier=subscription.subscription_tier,
            new_tier="free" if immediate else subscription.subscription_tier,
        )

        # Track cancellation in analytics
        if self.analytics:
            self.analytics.track(
                user_id=str(user_id),
                event="subscription_canceled",
                properties={
                    "immediate": immediate,
                    "tier": subscription.subscription_tier,
                }
            )

        return subscription

    def get_user_tier(self, user_id: UUID) -> str:
        """
        Get a user's current subscription tier.

        Args:
            user_id: The ID of the user

        Returns:
            str: The user's subscription tier ("free", "premium", or "pro")
        """
        subscription = self.get_user_subscription(user_id)
        if not subscription or not subscription.is_active:
            return "free"
        return subscription.subscription_tier

    def check_feature_access(self, user_id: UUID, feature_name: str) -> bool:
        """
        Check if a user has access to a specific feature.

        Args:
            user_id: The ID of the user
            feature_name: The name of the feature to check

        Returns:
            bool: True if the user has access, False otherwise
        """
        user_tier = self.get_user_tier(user_id)
        available_features = []

        # Collect all features available to this tier
        for tier in TIER_FEATURES:
            available_features.extend(TIER_FEATURES[tier])
            if tier == user_tier:
                break

        return feature_name in available_features

    def check_usage_limit(self, user_id: UUID, feature_name: str) -> Tuple[bool, int]:
        """
        Check if a user has remaining usage for a feature.

        Args:
            user_id: The ID of the user
            feature_name: The name of the feature to check

        Returns:
            Tuple[bool, int]: (True if limit not reached, remaining uses)
        """
        # Get user's tier and the corresponding limit
        user_tier = self.get_user_tier(user_id)
        if feature_name not in TIER_LIMITS.get(user_tier, {}):
            # If the feature doesn't have a limit for this tier, allow it
            return True, 9999

        daily_limit = TIER_LIMITS[user_tier][feature_name]

        # Get today's usage
        today = date.today()
        usage = self.db.query(FeatureUsage).filter(
            FeatureUsage.user_id == user_id,
            FeatureUsage.feature_name == feature_name,
            FeatureUsage.usage_date == today
        ).first()

        # Calculate remaining uses
        used_today = usage.usage_count if usage else 0
        remaining = max(0, daily_limit - used_today)

        return remaining > 0, remaining

    def increment_usage(self, user_id: UUID, feature_name: str, amount: int = 1) -> int:
        """
        Increment usage count for a feature.

        Args:
            user_id: The ID of the user
            feature_name: The name of the feature
            amount: The amount to increment by

        Returns:
            int: The new usage count
        """
        today = date.today()

        # Get or create usage record
        usage = self.db.query(FeatureUsage).filter(
            FeatureUsage.user_id == user_id,
            FeatureUsage.feature_name == feature_name,
            FeatureUsage.usage_date == today
        ).first()

        if not usage:
            # Create new usage record
            usage = FeatureUsage(
                user_id=user_id,
                feature_name=feature_name,
                usage_date=today,
                usage_count=amount
            )
            self.db.add(usage)
        else:
            # Update existing record
            usage.usage_count += amount

        self.db.commit()
        self.db.refresh(usage)

        # Track usage in analytics
        if self.analytics:
            self.analytics.track(
                user_id=str(user_id),
                event=f"feature_used_{feature_name}",
                properties={
                    "amount": amount,
                    "total_today": usage.usage_count,
                }
            )

        return usage.usage_count

    def get_feature_usage_summary(self, user_id: UUID) -> Dict[str, FeatureUsageSummary]:
        """
        Get a summary of feature usage for a user.

        Args:
            user_id: The ID of the user

        Returns:
            Dict[str, FeatureUsageSummary]: A dictionary of feature usage summaries
        """
        user_tier = self.get_user_tier(user_id)
        today = date.today()

        # Get all usage for today
        usages = self.db.query(FeatureUsage).filter(
            FeatureUsage.user_id == user_id,
            FeatureUsage.usage_date == today
        ).all()

        # Create a dictionary of feature name to usage count
        usage_dict = {u.feature_name: u.usage_count for u in usages}

        # Create summary for each feature with limits
        summary = {}
        for feature, limit in TIER_LIMITS.get(user_tier, {}).items():
            used = usage_dict.get(feature, 0)
            remaining = max(0, limit - used)

            summary[feature] = FeatureUsageSummary(
                feature_name=feature,
                used_today=used,
                daily_limit=limit,
                remaining=remaining,
                # Time until midnight in user's timezone (simplified for now)
                reset_time=f"{23 - datetime.now().hour}h {59 - datetime.now().minute}m"
            )

        return summary

    def get_subscription_summary(self, user_id: UUID) -> SubscriptionSummary:
        """
        Get a summary of a user's subscription and feature usage.

        Args:
            user_id: The ID of the user

        Returns:
            SubscriptionSummary: A summary of the user's subscription
        """
        subscription = self.get_user_subscription(user_id)
        tier = subscription.subscription_tier if subscription else "free"

        # Get feature usage
        feature_usage = self.get_feature_usage_summary(user_id)

        return SubscriptionSummary(
            tier=tier,
            status=subscription.status if subscription else "none",
            is_active=subscription.is_active if subscription else False,
            current_period_end=subscription.current_period_end if subscription else None,
            cancel_at_period_end=subscription.cancel_at_period_end if subscription else False,
            feature_usage=feature_usage
        )

    def _record_subscription_event(
        self,
        user_id: UUID,
        event_type: str,
        previous_tier: Optional[str] = None,
        new_tier: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> SubscriptionEvent:
        """
        Record a subscription event.

        Args:
            user_id: The ID of the user
            event_type: The type of event
            previous_tier: The previous subscription tier
            new_tier: The new subscription tier
            metadata: Additional metadata

        Returns:
            SubscriptionEvent: The created event
        """
        event = SubscriptionEvent(
            user_id=user_id,
            event_type=event_type,
            previous_tier=previous_tier,
            new_tier=new_tier,
            metadata=metadata or {}
        )
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return event
