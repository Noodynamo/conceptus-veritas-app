"""
Subscription API package.

This package provides endpoints for subscription management, feature access,
and usage limits based on user subscription tiers.
"""

from backend.src.api.v1.subscription.routes import router as subscription_router

__all__ = ["subscription_router"]
