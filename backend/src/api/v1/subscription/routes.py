"""
API routes for subscription management.

This module provides endpoints for:
- Retrieving subscription information
- Managing subscription tiers
- Checking feature access and usage limits
"""

import logging
from typing import Dict, List, Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Path, Query
from sqlalchemy.orm import Session

from backend.src.db.session import get_db
from backend.src.api.v1.auth.utils import get_current_user
from backend.src.models.user import User
from backend.src.schemas.subscription import (
    SubscriptionRead,
    SubscriptionUpdate,
    SubscriptionSummary,
    FeatureUsageSummary,
)
from backend.src.services.subscription.subscription_service import SubscriptionService, TIER_FEATURES, TIER_LIMITS
from backend.src.services.subscription.rate_limit_service import RateLimitService
from backend.src.api.v1.subscription.middleware import (
    verify_subscription_tier,
    verify_feature_access,
    verify_usage_limit,
)


logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/me", response_model=SubscriptionRead)
async def get_my_subscription(
    current_user: User = Depends(get_current_user),
    subscription_service: SubscriptionService = Depends(),
):
    """
    Get the current user's subscription information.
    """
    subscription = subscription_service.get_user_subscription(current_user.id)
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found"
        )
    return subscription


@router.get("/summary", response_model=SubscriptionSummary)
async def get_subscription_summary(
    current_user: User = Depends(get_current_user),
    subscription_service: SubscriptionService = Depends(),
):
    """
    Get a summary of the current user's subscription and feature usage.
    """
    return subscription_service.get_subscription_summary(current_user.id)


@router.get("/feature-access/{feature_name}", response_model=Dict[str, Any])
async def check_feature_access(
    feature_name: str = Path(..., description="The name of the feature to check"),
    current_user: User = Depends(get_current_user),
    subscription_service: SubscriptionService = Depends(),
):
    """
    Check if the current user has access to a specific feature.
    """
    has_access = subscription_service.check_feature_access(current_user.id, feature_name)

    # If feature doesn't exist, return 404
    feature_exists = False
    for features in TIER_FEATURES.values():
        if feature_name in features:
            feature_exists = True
            break

    if not feature_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Feature '{feature_name}' not found"
        )

    # Determine which tier is required for this feature
    required_tier = None
    for tier, features in TIER_FEATURES.items():
        if feature_name in features:
            required_tier = tier
            break

    return {
        "feature_name": feature_name,
        "has_access": has_access,
        "current_tier": subscription_service.get_user_tier(current_user.id),
        "required_tier": required_tier or "unknown",
    }


@router.get("/usage-limits/{feature_name}", response_model=Dict[str, Any])
async def check_usage_limit(
    feature_name: str = Path(..., description="The name of the feature to check"),
    current_user: User = Depends(get_current_user),
    subscription_service: SubscriptionService = Depends(),
    rate_limit_service: RateLimitService = Depends(),
):
    """
    Check if the current user has remaining usage for a specific feature.
    """
    # Check if the feature has usage limits
    user_tier = subscription_service.get_user_tier(current_user.id)
    has_limit = feature_name in TIER_LIMITS.get(user_tier, {})

    if not has_limit:
        return {
            "feature_name": feature_name,
            "has_limit": False,
            "current_tier": user_tier,
            "message": "This feature does not have usage limits for your subscription tier"
        }

    # Check if the user has remaining usage
    allowed, remaining, metadata = rate_limit_service.check_rate_limit(current_user.id, feature_name)

    return {
        "feature_name": feature_name,
        "has_limit": True,
        "allowed": allowed,
        "remaining": remaining,
        "current_tier": user_tier,
        "daily_limit": TIER_LIMITS[user_tier].get(feature_name, 0),
        "reset_time": metadata.get("reset_time"),
    }


@router.get("/features", response_model=Dict[str, List[str]])
async def get_available_features(
    current_user: User = Depends(get_current_user),
    subscription_service: SubscriptionService = Depends(),
):
    """
    Get a list of features available to the current user based on their subscription tier.
    """
    user_tier = subscription_service.get_user_tier(current_user.id)

    # Collect all features available to this tier
    available_features = []
    for tier in TIER_FEATURES:
        available_features.extend(TIER_FEATURES[tier])
        if tier == user_tier:
            break

    # Get features available in the next tier
    next_tier = None
    next_tier_features = []

    if user_tier == "free":
        next_tier = "premium"
        next_tier_features = TIER_FEATURES.get("premium", [])
    elif user_tier == "premium":
        next_tier = "pro"
        next_tier_features = TIER_FEATURES.get("pro", [])

    # Remove features the user already has
    next_tier_features = [f for f in next_tier_features if f not in available_features]

    return {
        "current_tier": user_tier,
        "available_features": available_features,
        "next_tier": next_tier,
        "next_tier_features": next_tier_features,
    }


@router.get("/tier-limits", response_model=Dict[str, Dict[str, int]])
async def get_tier_limits(
    current_user: User = Depends(get_current_user),
):
    """
    Get the usage limits for all subscription tiers.
    """
    return TIER_LIMITS


@router.post("/upgrade", response_model=SubscriptionRead)
async def upgrade_subscription(
    tier: str = Query(..., description="The tier to upgrade to (premium or pro)"),
    current_user: User = Depends(get_current_user),
    subscription_service: SubscriptionService = Depends(),
):
    """
    Upgrade the current user's subscription to a higher tier.

    This endpoint is a placeholder for the actual payment flow, which would typically:
    1. Create a payment intent with Stripe
    2. Return client secret for frontend to complete payment
    3. Update subscription tier after webhook confirmation

    For demonstration, this simply updates the subscription tier directly.
    """
    if tier not in ["premium", "pro"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid tier. Must be 'premium' or 'pro'"
        )

    # Get current subscription
    subscription = subscription_service.get_user_subscription(current_user.id)
    current_tier = subscription.subscription_tier if subscription else "free"

    # Validate upgrade path
    if current_tier == "premium" and tier == "premium":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already on the Premium tier"
        )

    if current_tier == "pro":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already on the Pro tier"
        )

    # Update subscription (this would normally happen after payment confirmation)
    if subscription:
        subscription_data = SubscriptionUpdate(
            subscription_tier=tier,
            # Add payment-related fields here in real implementation
        )
        return subscription_service.update_subscription(current_user.id, subscription_data)
    else:
        # Create new subscription if user doesn't have one
        subscription_data = SubscriptionCreate(
            user_id=current_user.id,
            subscription_tier=tier,
            # Add payment-related fields here in real implementation
        )
        return subscription_service.create_subscription(subscription_data)


@router.post("/cancel", response_model=SubscriptionRead)
async def cancel_subscription(
    immediate: bool = Query(False, description="Whether to cancel immediately or at period end"),
    current_user: User = Depends(get_current_user),
    subscription_service: SubscriptionService = Depends(),
):
    """
    Cancel the current user's subscription.
    """
    return subscription_service.cancel_subscription(current_user.id, immediate)
