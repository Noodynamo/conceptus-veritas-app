"""
Middleware and dependencies for subscription-based access control.

This module provides FastAPI dependencies for:
- Verifying subscription tier requirements
- Checking feature access based on subscription tier
- Enforcing usage limits based on subscription tier
"""

import logging
from typing import Callable, Optional, List
from uuid import UUID

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from backend.src.db.session import get_db
from backend.src.api.v1.auth.utils import get_current_user
from backend.src.models.user import User
from backend.src.services.subscription.subscription_service import SubscriptionService, TIER_FEATURES
from backend.src.services.subscription.rate_limit_service import RateLimitService

logger = logging.getLogger(__name__)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def verify_subscription_tier(required_tier: str):
    """
    Dependency for verifying that a user has the required subscription tier.

    Args:
        required_tier: The minimum required tier ("free", "premium", or "pro")

    Returns:
        Callable: A dependency function that verifies the user's subscription tier
    """
    async def dependency(
        current_user: User = Depends(get_current_user),
        subscription_service: SubscriptionService = Depends()
    ) -> User:
        """
        Verify that the current user has the required subscription tier.

        Args:
            current_user: The current user
            subscription_service: The subscription service

        Returns:
            User: The current user if verification succeeds

        Raises:
            HTTPException: If the user doesn't have the required tier
        """
        # Get the user's current subscription tier
        user_tier = subscription_service.get_user_tier(current_user.id)

        # Check if the user's tier is sufficient
        if not current_user.is_tier_or_higher(required_tier):
            tier_names = {
                "free": "Free",
                "premium": "Premium",
                "pro": "Pro"
            }

            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"This feature requires a {tier_names.get(required_tier, required_tier)} subscription",
                headers={
                    "X-Current-Tier": user_tier,
                    "X-Required-Tier": required_tier,
                    "X-Upgrade-Required": "true"
                }
            )

        return current_user

    return dependency


def verify_feature_access(feature_name: str):
    """
    Dependency for verifying that a user has access to a specific feature.

    Args:
        feature_name: The name of the feature to check

    Returns:
        Callable: A dependency function that verifies feature access
    """
    async def dependency(
        current_user: User = Depends(get_current_user),
        subscription_service: SubscriptionService = Depends()
    ) -> User:
        """
        Verify that the current user has access to the specified feature.

        Args:
            current_user: The current user
            subscription_service: The subscription service

        Returns:
            User: The current user if verification succeeds

        Raises:
            HTTPException: If the user doesn't have access to the feature
        """
        # Check if the user has access to the feature
        has_access = subscription_service.check_feature_access(current_user.id, feature_name)

        if not has_access:
            # Determine which tier is required for this feature
            required_tier = None
            for tier, features in TIER_FEATURES.items():
                if feature_name in features:
                    required_tier = tier
                    break

            # Default to "premium" if we couldn't determine the required tier
            required_tier = required_tier or "premium"

            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"This feature requires a higher subscription tier",
                headers={
                    "X-Current-Tier": subscription_service.get_user_tier(current_user.id),
                    "X-Required-Tier": required_tier,
                    "X-Feature-Name": feature_name,
                    "X-Upgrade-Required": "true"
                }
            )

        return current_user

    return dependency


def verify_usage_limit(feature_name: str):
    """
    Dependency for verifying that a user hasn't reached their usage limit for a feature.

    Args:
        feature_name: The name of the feature to check

    Returns:
        Callable: A dependency function that verifies usage limits
    """
    async def dependency(
        request: Request,
        current_user: User = Depends(get_current_user),
        rate_limit_service: RateLimitService = Depends()
    ) -> User:
        """
        Verify that the current user hasn't reached their usage limit.

        Args:
            request: The request object
            current_user: The current user
            rate_limit_service: The rate limit service

        Returns:
            User: The current user if verification succeeds

        Raises:
            HTTPException: If the user has reached their usage limit
        """
        # Check if the user has hit their rate limit
        allowed, remaining, metadata = rate_limit_service.check_rate_limit(current_user.id, feature_name)

        # Add rate limit headers to the response
        request.state.rate_limit_headers = rate_limit_service.get_rate_limit_headers(
            allowed, remaining, metadata
        )

        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Usage limit reached for {feature_name}",
                headers=request.state.rate_limit_headers
            )

        return current_user

    return dependency


def track_usage(feature_name: str, amount: int = 1):
    """
    Dependency for tracking feature usage.

    Args:
        feature_name: The name of the feature to track
        amount: The amount to increment usage by

    Returns:
        Callable: A dependency function that tracks feature usage
    """
    async def dependency(
        request: Request,
        current_user: User = Depends(get_current_user),
        rate_limit_service: RateLimitService = Depends()
    ) -> User:
        """
        Track usage for the specified feature.

        Args:
            request: The request object
            current_user: The current user
            rate_limit_service: The rate limit service

        Returns:
            User: The current user
        """
        # Increment usage and check if allowed
        allowed, remaining, metadata = rate_limit_service.increment_and_check(
            current_user.id, feature_name, amount
        )

        # Add rate limit headers to the response
        request.state.rate_limit_headers = rate_limit_service.get_rate_limit_headers(
            allowed, remaining, metadata
        )

        return current_user

    return dependency


async def add_rate_limit_headers(request: Request, call_next):
    """
    Middleware for adding rate limit headers to responses.

    Args:
        request: The request object
        call_next: The next middleware or route handler

    Returns:
        The response from the next middleware or route handler
    """
    # Call the next middleware or route handler
    response = await call_next(request)

    # Add rate limit headers if they exist
    if hasattr(request.state, "rate_limit_headers"):
        for name, value in request.state.rate_limit_headers.items():
            response.headers[name] = value

    return response
