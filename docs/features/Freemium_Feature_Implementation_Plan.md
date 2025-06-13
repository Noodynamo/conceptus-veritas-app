# Freemium Feature Implementation Plan

This document outlines the technical implementation strategy for the freemium tier structure defined in the [Freemium Tier Structure and Benefits](./Freemium_Tier_Structure_and_Benefits.md) document.

## Table of Contents

1. [Overview](#overview)
2. [Technical Architecture](#technical-architecture)
3. [Implementation Phases](#implementation-phases)
4. [Backend Services](#backend-services)
5. [Frontend Components](#frontend-components)
6. [Database Schema](#database-schema)
7. [Testing Strategy](#testing-strategy)
8. [Analytics Integration](#analytics-integration)

## Overview

This implementation plan provides a comprehensive roadmap for developing the technical infrastructure required to support Conceptus Veritas's freemium business model. It covers backend services, frontend components, database schema, and integration points needed to deliver the tiered feature access defined in the Freemium Tier Structure.

## Technical Architecture

The freemium implementation will follow a service-oriented architecture with clear separation of concerns:

```
┌─────────────────────┐      ┌─────────────────────┐      ┌─────────────────────┐
│   Client            │      │   API Layer         │      │   Service Layer     │
│                     │      │                     │      │                     │
│  - React Native UI  │      │  - FastAPI Routes   │      │  - Subscription     │
│  - Tier-aware UI    │◄────►│  - Auth Middleware  │◄────►│  - Feature Access   │
│  - Upgrade Flows    │      │  - Rate Limiting    │      │  - Usage Tracking   │
│  - Usage Indicators │      │  - Request Validation│      │  - Payment Process  │
└─────────────────────┘      └─────────────────────┘      └─────────────────────┘
                                                                      ▲
                                                                      │
                                                                      ▼
                                                          ┌─────────────────────┐
                                                          │   Data Layer        │
                                                          │                     │
                                                          │  - PostgreSQL       │
                                                          │  - Redis Cache      │
                                                          │  - Analytics Store  │
                                                          └─────────────────────┘
```

### Key Components

1. **Subscription Service**: Central service managing subscription state, tier rules, and feature access
2. **Rate Limiting Service**: Enforces usage limits based on user's subscription tier
3. **Feature Flag System**: Controls access to tier-specific features
4. **Payment Processing Integration**: Handles subscription purchases and management
5. **User Tier Context Provider**: Makes subscription data available throughout the frontend
6. **Upgrade Experience Components**: UI components for tier comparison and upgrading

## Implementation Phases

The implementation will be divided into three phases:

### Phase 1: Core Infrastructure (Weeks 1-3)

1. **Subscription Data Model**: Implement user_subscriptions table and relationships
2. **Basic Tier Management**: Create subscription_service with core tier logic
3. **API Middleware**: Develop auth middleware with subscription awareness
4. **Frontend Tier Context**: Create React context for subscription data
5. **Usage Tracking**: Implement basic usage tracking for limited features

**Deliverables**:

- Functional subscription data model
- Backend tier validation
- Frontend subscription context
- Basic usage limiting for Ask feature

### Phase 2: Feature Gating & Monetization (Weeks 4-6)

1. **Complete Rate Limiting**: Implement all tier-specific usage limits
2. **Feature Access Controls**: Add tier checks to all relevant endpoints
3. **Payment Integration**: Integrate with payment provider (Stripe)
4. **Subscription Management UI**: Build screens for viewing/managing subscription
5. **Upgrade Flows**: Implement upgrade paths and paywall screens

**Deliverables**:

- Complete rate limiting across all features
- Functional payment processing
- Subscription management UI
- Contextual upgrade prompts

### Phase 3: Optimization & Analytics (Weeks 7-8)

1. **Conversion Optimization**: Implement A/B testing for upgrade flows
2. **Analytics Integration**: Track key subscription metrics
3. **Personalization**: Add personalized upgrade recommendations
4. **Retention Tools**: Implement tools to reduce churn
5. **Admin Dashboard**: Create admin interface for subscription analytics

**Deliverables**:

- A/B testing framework for conversion
- Comprehensive subscription analytics
- Admin dashboard for subscription monitoring
- Churn prediction and prevention tools

## Backend Services

### Subscription Service (`subscription_service.py`)

**Purpose**: Central service for managing subscription state and business logic

**Key Functions**:

- `get_user_tier(user_id)`: Returns the user's current subscription tier
- `check_feature_access(user_id, feature_name)`: Validates if user has access to a feature
- `check_usage_limit(user_id, feature_name)`: Checks if user has remaining usage for the day
- `increment_usage(user_id, feature_name)`: Records feature usage
- `process_subscription_change(user_id, new_tier)`: Handles tier transitions
- `get_tier_limits(tier_name)`: Returns all limits for a specific tier

**Dependencies**:

- PostgreSQL for subscription data
- Redis for usage counting and caching
- Stripe API for payment processing

### Rate Limiting Service (`rate_limit_service.py`)

**Purpose**: Enforces usage limits based on user's subscription tier

**Key Functions**:

- `get_remaining_usage(user_id, feature_name)`: Returns remaining usage for a feature
- `check_rate_limit(user_id, feature_name)`: Validates if request should be allowed
- `get_reset_time()`: Returns time until usage counters reset

**Implementation**:

- Uses Redis for high-performance counters
- Daily reset at midnight in user's timezone
- Graceful handling of offline/sync scenarios

### Feature Access Middleware (`subscription_middleware.py`)

**Purpose**: FastAPI middleware that validates subscription requirements for endpoints

**Key Functions**:

- `verify_subscription_tier(required_tier)`: Dependency for routes requiring specific tier
- `verify_feature_access(feature_name)`: Dependency for routes with feature-specific access
- `verify_usage_limit(feature_name)`: Dependency for routes with usage limits

**Implementation**:

- FastAPI dependency injection
- Clean HTTP 402 (Payment Required) or 429 (Too Many Requests) responses
- Detailed response with upgrade information

## Frontend Components

### Subscription Context (`SubscriptionContext.tsx`)

**Purpose**: React Context providing subscription data to all components

**Key Features**:

- Current subscription tier
- Feature access information
- Usage limits and remaining counts
- Subscription status (active, expiring, etc.)
- Methods to check feature availability

**Implementation**:

```jsx
// Example usage
function AskScreen() {
  const { checkFeatureAccess, getRemainingUsage, userTier } = useSubscription();

  const canUseInsightExpansion = checkFeatureAccess('insight_expansion');
  const remainingQuestions = getRemainingUsage('ask_questions');

  // Component logic
}
```

### Tier-Aware Components

**1. FeatureGate Component**:

- Conditionally renders content based on tier access
- Shows appropriate upgrade messaging when feature is restricted
- Handles different restriction types (not available vs. usage limit)

**2. UsageIndicator Component**:

- Displays remaining usage for limited features
- Visual indicators (green/yellow/red) based on remaining amount
- Option to show or hide based on context

**3. UpgradeButton Component**:

- Contextual button for upgrading subscription
- Can be customized with specific feature messaging
- Tracks conversion analytics

### Subscription Screens

**1. SubscriptionScreen**:

- Displays current subscription details
- Shows subscription comparison table
- Provides options to upgrade/downgrade
- Handles subscription management

**2. PaywallScreen**:

- Modal screen when users hit feature limits
- Clearly communicates benefits of upgrading
- Optimized conversion flow with minimal steps
- Supports various entry points/contexts

**3. OnboardingTierScreen**:

- Introduces tier structure during onboarding
- Highlights free tier capabilities
- Plants seeds for future upgrades

## Database Schema

### Primary Tables

**1. user_subscriptions**:

```sql
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    subscription_tier VARCHAR(20) NOT NULL DEFAULT 'free',
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
```

**2. feature_usage**:

```sql
CREATE TABLE feature_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    feature_name VARCHAR(50) NOT NULL,
    usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
    usage_count INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_feature_usage_user_feature_date ON feature_usage(user_id, feature_name, usage_date);
```

**3. subscription_events**:

```sql
CREATE TABLE subscription_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    event_type VARCHAR(50) NOT NULL,
    previous_tier VARCHAR(20),
    new_tier VARCHAR(20),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscription_events_user_id ON subscription_events(user_id);
CREATE INDEX idx_subscription_events_event_type ON subscription_events(event_type);
```

### Redis Schema

**1. Daily Usage Counters**:

- Key pattern: `usage:{user_id}:{feature_name}:{date}`
- Value: Integer count of usage
- TTL: 48 hours (to account for timezone differences)

**2. Tier Cache**:

- Key pattern: `tier:{user_id}`
- Value: JSON with tier and key limits
- TTL: 1 hour with refresh on access

## Testing Strategy

### Unit Tests

1. **Subscription Service Tests**:

   - Verify tier logic functions correctly
   - Test edge cases in usage limiting
   - Validate feature access rules

2. **Rate Limiting Tests**:

   - Verify counters increment correctly
   - Test daily reset functionality
   - Validate limit enforcement

3. **Frontend Component Tests**:
   - Test FeatureGate conditional rendering
   - Verify subscription context provides correct data
   - Test upgrade flows

### Integration Tests

1. **API Endpoint Tests**:

   - Verify endpoints correctly enforce tier restrictions
   - Test rate limiting headers and responses
   - Validate upgrade flows end-to-end

2. **Payment Flow Tests**:
   - Test subscription creation/modification
   - Verify webhook handling
   - Test renewal and cancellation flows

### User Acceptance Tests

1. **Tier Experience Tests**:

   - Validate the complete user experience in each tier
   - Test upgrade/downgrade flows
   - Verify feature limitations work as expected

2. **Edge Case Scenarios**:
   - Test behavior at tier boundaries
   - Verify handling of subscription errors
   - Test offline/sync scenarios

## Analytics Integration

### Key Tracking Events

1. **Subscription Events**:

   - `ph_subscription_viewed`: User views subscription options
   - `ph_subscription_upgraded`: User upgrades subscription
   - `ph_subscription_downgraded`: User downgrades subscription
   - `ph_subscription_cancelled`: User cancels subscription
   - `ph_subscription_renewed`: Subscription automatically renews

2. **Limit Encounter Events**:
   - `ph_usage_limit_reached`: User hits a usage limit
   - `ph_feature_access_blocked`: User attempts to access restricted feature
   - `ph_upgrade_prompt_shown`: Upgrade prompt is displayed
   - `ph_upgrade_prompt_clicked`: User clicks on upgrade prompt

### Dashboard Requirements

1. **Conversion Funnel Dashboard**:

   - Track progression from free to paid
   - Analyze conversion rates by entry point
   - Monitor paywall view-to-conversion rates

2. **Subscription Health Dashboard**:

   - Monitor distribution of users across tiers
   - Track churn rates and reasons
   - Analyze lifetime value by acquisition source

3. **Feature Usage Dashboard**:
   - Track usage patterns by tier
   - Identify features driving upgrades
   - Monitor limit encounters by feature

### Optimization Framework

1. **A/B Testing Infrastructure**:

   - Test different paywall designs
   - Experiment with pricing presentation
   - Optimize upgrade messaging

2. **Personalization Engine**:
   - Target upgrade messages based on usage patterns
   - Customize feature highlighting based on user behavior
   - Time promotions based on engagement cycles
