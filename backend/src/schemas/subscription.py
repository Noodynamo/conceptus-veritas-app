"""
Pydantic schemas for the subscription system.

This module defines the Pydantic schemas for:
- SubscriptionBase/Create/Update: For user subscription operations
- FeatureUsageBase/Create/Read: For feature usage tracking
- SubscriptionEventRead: For subscription event retrieval
"""

from datetime import datetime, date
from typing import Optional, Dict, Any
from uuid import UUID

from pydantic import BaseModel, Field, validator


# Subscription Schemas
class SubscriptionBase(BaseModel):
    """Base schema for subscription data."""
    subscription_tier: str = Field("free", description="Subscription tier (free, premium, pro)")
    status: str = Field("active", description="Subscription status (active, canceled, etc.)")
    cancel_at_period_end: bool = Field(False, description="Whether to cancel at period end")


class SubscriptionCreate(SubscriptionBase):
    """Schema for creating a subscription."""
    user_id: UUID = Field(..., description="ID of the user")
    stripe_customer_id: Optional[str] = Field(None, description="Stripe customer ID")
    stripe_subscription_id: Optional[str] = Field(None, description="Stripe subscription ID")
    current_period_start: Optional[datetime] = Field(None, description="Start of current billing period")
    current_period_end: Optional[datetime] = Field(None, description="End of current billing period")


class SubscriptionUpdate(BaseModel):
    """Schema for updating a subscription."""
    subscription_tier: Optional[str] = Field(None, description="Subscription tier (free, premium, pro)")
    stripe_customer_id: Optional[str] = Field(None, description="Stripe customer ID")
    stripe_subscription_id: Optional[str] = Field(None, description="Stripe subscription ID")
    current_period_start: Optional[datetime] = Field(None, description="Start of current billing period")
    current_period_end: Optional[datetime] = Field(None, description="End of current billing period")
    cancel_at_period_end: Optional[bool] = Field(None, description="Whether to cancel at period end")
    status: Optional[str] = Field(None, description="Subscription status (active, canceled, etc.)")


class SubscriptionRead(SubscriptionBase):
    """Schema for reading subscription data."""
    id: UUID
    user_id: UUID
    stripe_customer_id: Optional[str] = None
    stripe_subscription_id: Optional[str] = None
    current_period_start: Optional[datetime] = None
    current_period_end: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


# Feature Usage Schemas
class FeatureUsageBase(BaseModel):
    """Base schema for feature usage."""
    feature_name: str = Field(..., description="Name of the feature being used")
    usage_date: date = Field(..., description="Date of the usage")
    usage_count: int = Field(1, description="Count of usage")


class FeatureUsageCreate(FeatureUsageBase):
    """Schema for creating feature usage records."""
    user_id: UUID = Field(..., description="ID of the user")


class FeatureUsageRead(FeatureUsageBase):
    """Schema for reading feature usage."""
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class FeatureUsageIncrement(BaseModel):
    """Schema for incrementing feature usage."""
    amount: int = Field(1, description="Amount to increment usage by", ge=1)


# Subscription Event Schemas
class SubscriptionEventRead(BaseModel):
    """Schema for reading subscription events."""
    id: UUID
    user_id: UUID
    event_type: str
    previous_tier: Optional[str] = None
    new_tier: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        orm_mode = True


# Usage Summary Schemas
class FeatureUsageSummary(BaseModel):
    """Summary of feature usage for a user."""
    feature_name: str
    used_today: int
    daily_limit: int
    remaining: int
    reset_time: Optional[str] = None


class SubscriptionSummary(BaseModel):
    """Summary of a user's subscription status and feature usage."""
    tier: str
    status: str
    is_active: bool
    current_period_end: Optional[datetime] = None
    cancel_at_period_end: bool
    feature_usage: Dict[str, FeatureUsageSummary]
