"""
Rate limiting service for enforcing usage limits based on subscription tiers.

This module provides services for:
- Checking if a user has hit their usage limits
- Tracking feature usage rates
- Handling resets of usage counters
"""

import logging
from datetime import datetime, date, timedelta
from typing import Dict, Optional, Tuple, Any
from uuid import UUID

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.src.db.session import get_db
from backend.src.services.subscription.subscription_service import SubscriptionService, TIER_LIMITS


logger = logging.getLogger(__name__)


class RateLimitService:
    """Service for enforcing usage limits based on subscription tiers."""

    def __init__(
        self,
        db: Session = Depends(get_db),
        subscription_service: SubscriptionService = Depends()
    ):
        self.db = db
        self.subscription_service = subscription_service

    def check_rate_limit(
        self, user_id: UUID, feature_name: str
    ) -> Tuple[bool, int, Dict[str, Any]]:
        """
        Check if a user has hit their rate limit for a feature.

        Args:
            user_id: The ID of the user
            feature_name: The name of the feature to check

        Returns:
            Tuple[bool, int, Dict[str, Any]]:
                - Whether the request is allowed
                - Remaining uses
                - Additional metadata (reset time, tier info, etc.)
        """
        # Get user's subscription tier
        user_tier = self.subscription_service.get_user_tier(user_id)

        # If feature doesn't have a limit for this tier, allow it
        if feature_name not in TIER_LIMITS.get(user_tier, {}):
            return True, 9999, {"tier": user_tier, "limit_type": "none"}

        # Check if user has remaining usage
        allowed, remaining = self.subscription_service.check_usage_limit(user_id, feature_name)

        # Calculate time until reset
        now = datetime.now()
        tomorrow = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
        seconds_until_reset = int((tomorrow - now).total_seconds())

        metadata = {
            "tier": user_tier,
            "limit_type": "daily",
            "reset_seconds": seconds_until_reset,
            "reset_time": tomorrow.isoformat(),
            "limit": TIER_LIMITS[user_tier][feature_name],
            "upgrade_required": not allowed and user_tier != "pro"
        }

        return allowed, remaining, metadata

    def increment_and_check(
        self, user_id: UUID, feature_name: str, amount: int = 1
    ) -> Tuple[bool, int, Dict[str, Any]]:
        """
        Increment usage and check if the user has hit their rate limit.

        Args:
            user_id: The ID of the user
            feature_name: The name of the feature
            amount: The amount to increment by

        Returns:
            Tuple[bool, int, Dict[str, Any]]:
                - Whether the request is allowed
                - Remaining uses
                - Additional metadata (reset time, tier info, etc.)
        """
        # First check if operation would be allowed
        allowed, remaining, metadata = self.check_rate_limit(user_id, feature_name)

        # If allowed, increment the usage
        if allowed:
            # Only increment by what's allowed (cap at remaining)
            increment_amount = min(amount, remaining)
            self.subscription_service.increment_usage(user_id, feature_name, increment_amount)

            # Recalculate remaining uses
            remaining = max(0, remaining - increment_amount)
            metadata["remaining"] = remaining

        return allowed, remaining, metadata

    def get_reset_time(self) -> datetime:
        """
        Get the time when usage counters will reset.

        Returns:
            datetime: The time when usage counters will reset
        """
        now = datetime.now()
        tomorrow = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
        return tomorrow

    def get_rate_limit_headers(
        self, allowed: bool, remaining: int, metadata: Dict[str, Any]
    ) -> Dict[str, str]:
        """
        Get HTTP headers for rate limiting.

        Args:
            allowed: Whether the request is allowed
            remaining: Remaining uses
            metadata: Additional metadata

        Returns:
            Dict[str, str]: HTTP headers for rate limiting
        """
        return {
            "X-RateLimit-Limit": str(metadata.get("limit", 0)),
            "X-RateLimit-Remaining": str(remaining),
            "X-RateLimit-Reset": str(metadata.get("reset_seconds", 0)),
            "X-Tier-Level": metadata.get("tier", "free"),
            "X-Upgrade-Required": str(metadata.get("upgrade_required", False)).lower(),
        }
