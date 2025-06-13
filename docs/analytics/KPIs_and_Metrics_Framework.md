# KPIs and Analytics Measurement Framework

This document outlines the key performance indicators (KPIs) and analytics measurement framework for the Conceptus Veritas application, with a focus on its freemium business model.

## Table of Contents

1. [Introduction](#introduction)
2. [Freemium Tier Structure](#freemium-tier-structure)
3. [Core Business KPIs](#core-business-kpis)
4. [User Acquisition Metrics](#user-acquisition-metrics)
5. [Engagement Metrics](#engagement-metrics)
6. [Retention Metrics](#retention-metrics)
7. [Conversion Metrics](#conversion-metrics)
8. [Feature Usage Metrics](#feature-usage-metrics)
9. [Technical Performance Metrics](#technical-performance-metrics)
10. [Dashboard Structure](#dashboard-structure)
11. [Privacy Compliance](#privacy-compliance)
12. [Implementation Guidelines](#implementation-guidelines)

## Introduction

This measurement framework is designed to track and analyze the performance of the Conceptus Veritas application across all aspects of the user journey, with special attention to the freemium business model. It provides a comprehensive set of metrics to monitor acquisition, engagement, retention, and conversion, while ensuring compliance with privacy regulations.

## Freemium Tier Structure

Conceptus Veritas uses a three-tier subscription model:

1. **Free Tier**

   - Limited access to core features
   - Daily usage limits
   - Basic functionality

2. **Premium Tier**

   - Expanded access to features
   - Higher usage limits
   - Additional capabilities

3. **Pro Tier**
   - Unlimited access to all features
   - Priority access to new capabilities
   - Advanced functionality

The specific feature limitations for each tier are as follows:

| Feature                      | Free Tier     | Premium Tier | Pro Tier  |
| ---------------------------- | ------------- | ------------ | --------- |
| Ask AI                       | 10/day        | 50/day       | Unlimited |
| Journal Entries              | 5/day         | Unlimited    | Unlimited |
| Forum Threads                | 3/day         | 10/day       | Unlimited |
| Forum Comments               | 10/day        | 30/day       | Unlimited |
| Ask Insight Expansion        | Not Available | Available    | Available |
| Advanced Philosophical Tones | Limited       | All          | All       |
| Premium Quests               | Not Available | Available    | Available |

## Core Business KPIs

These KPIs provide a high-level view of the application's business performance:

1. **Monthly Active Users (MAU)**

   - Definition: Unique users who used the app in the last 30 days
   - Target: [TBD]
   - Frequency: Monthly
   - Dashboard: Executive, Growth

2. **Daily Active Users (DAU)**

   - Definition: Unique users who used the app in a day
   - Target: [TBD]
   - Frequency: Daily
   - Dashboard: Executive, Growth

3. **DAU/MAU Ratio (Stickiness)**

   - Definition: Ratio of daily active users to monthly active users
   - Target: >0.25 (25%)
   - Frequency: Monthly
   - Dashboard: Executive, Growth

4. **Conversion Rate (Free to Paid)**

   - Definition: Percentage of free users who upgrade to a paid tier
   - Target: >5%
   - Frequency: Monthly
   - Dashboard: Executive, Growth, Revenue

5. **Average Revenue Per User (ARPU)**

   - Definition: Total revenue divided by total number of users
   - Target: [TBD]
   - Frequency: Monthly
   - Dashboard: Executive, Revenue

6. **User Lifetime Value (LTV)**

   - Definition: Total revenue expected from a user throughout their lifecycle
   - Target: [TBD]
   - Frequency: Monthly
   - Dashboard: Executive, Revenue

7. **Customer Acquisition Cost (CAC)**

   - Definition: Cost to acquire a new user
   - Target: LTV:CAC ratio > 3:1
   - Frequency: Monthly
   - Dashboard: Executive, Growth

8. **Churn Rate**
   - Definition: Percentage of users who stop using the app in a given period
   - Target: <5% monthly
   - Frequency: Monthly
   - Dashboard: Executive, Retention

## User Acquisition Metrics

These metrics track how users discover and start using the application:

1. **New User Signups**

   - Definition: Number of new user registrations
   - Breakdown: By source, device type, and country
   - Frequency: Daily, Weekly, Monthly
   - Dashboard: Growth

2. **Signup Completion Rate**

   - Definition: Percentage of users who complete the signup process
   - Breakdown: By source and device type
   - Frequency: Daily
   - Dashboard: Growth, UX

3. **Onboarding Completion Rate**

   - Definition: Percentage of new users who complete the onboarding flow
   - Target: >80%
   - Frequency: Daily
   - Dashboard: Growth, UX

4. **Time to First Value**

   - Definition: Time taken for a new user to experience core value (e.g., first Ask interaction)
   - Target: <5 minutes
   - Frequency: Weekly
   - Dashboard: UX

5. **Acquisition Channel Performance**
   - Definition: Comparison of user acquisition by channel
   - Metrics: Volume, conversion rate, CAC
   - Frequency: Weekly
   - Dashboard: Growth

## Engagement Metrics

These metrics measure user interaction with the application:

1. **Session Frequency**

   - Definition: Number of sessions per user per week
   - Target: >3 sessions/week
   - Breakdown: By user tier
   - Dashboard: Engagement

2. **Session Duration**

   - Definition: Average time spent in the app per session
   - Target: >5 minutes
   - Breakdown: By user tier and feature
   - Dashboard: Engagement

3. **Feature Usage Distribution**

   - Definition: Percentage of users who use each feature
   - Breakdown: By user tier
   - Frequency: Weekly
   - Dashboard: Engagement

4. **Feature Usage Depth**

   - Definition: Intensity of usage for each feature (e.g., number of questions asked)
   - Breakdown: By user tier
   - Frequency: Weekly
   - Dashboard: Engagement

5. **Wisdom XP Accumulation**

   - Definition: Average XP earned per user per week
   - Target: [TBD]
   - Breakdown: By user tier and source action
   - Dashboard: Engagement, Gamification

6. **Streak Maintenance**

   - Definition: Percentage of users maintaining active streaks
   - Target: >30%
   - Breakdown: By streak length and user tier
   - Dashboard: Engagement, Gamification

7. **User Level Progression**
   - Definition: Distribution of users across wisdom levels
   - Frequency: Monthly
   - Dashboard: Engagement, Gamification

## Retention Metrics

These metrics track how well the application retains users over time:

1. **Retention Cohorts**

   - Definition: Percentage of users who return to the app after N days
   - Key Intervals: Day 1, Day 7, Day 30, Day 90
   - Target: D1 >40%, D7 >25%, D30 >15%
   - Dashboard: Retention

2. **Feature-Specific Retention**

   - Definition: Retention rates for users who engage with specific features
   - Breakdown: By feature and user tier
   - Dashboard: Retention, Product

3. **Churn Predictors**

   - Definition: User behaviors that correlate with eventual churn
   - Frequency: Weekly analysis
   - Dashboard: Retention

4. **Winback Rate**

   - Definition: Percentage of churned users who return to the app
   - Target: >5%
   - Frequency: Monthly
   - Dashboard: Retention

5. **User Lifecycle Stage Distribution**
   - Definition: Distribution of users across lifecycle stages (new, active, at-risk, churned)
   - Frequency: Weekly
   - Dashboard: Retention

## Conversion Metrics

These metrics focus on upgrading users from free to paid tiers:

1. **Conversion Rate by Cohort**

   - Definition: Percentage of users who convert to paid tiers by signup cohort
   - Breakdown: By acquisition source and initial feature usage
   - Dashboard: Revenue

2. **Time to Convert**

   - Definition: Average time from signup to first paid subscription
   - Target: <45 days
   - Breakdown: By user tier and acquisition source
   - Dashboard: Revenue

3. **Upgrade Path Analysis**

   - Definition: Most common paths users take before upgrading
   - Frequency: Monthly analysis
   - Dashboard: Revenue, Product

4. **Paywall Conversion Rate**

   - Definition: Percentage of users who upgrade after encountering a feature limit
   - Target: >8%
   - Breakdown: By feature and context
   - Dashboard: Revenue

5. **Subscription Tier Distribution**

   - Definition: Distribution of users across subscription tiers
   - Target: Premium 70%, Pro 30% (of paid users)
   - Frequency: Monthly
   - Dashboard: Revenue

6. **Annual vs. Monthly Subscription Ratio**

   - Definition: Ratio of annual to monthly subscriptions
   - Target: >40% annual
   - Frequency: Monthly
   - Dashboard: Revenue

7. **Discount Effectiveness**

   - Definition: Conversion rate from promotional offers
   - Breakdown: By discount type and amount
   - Frequency: Per campaign
   - Dashboard: Revenue

8. **Feature Limit Encounters**
   - Definition: Number of times users hit feature limits
   - Breakdown: By feature, tier, and resulting action
   - Frequency: Daily
   - Dashboard: Revenue, Product

## Feature Usage Metrics

These metrics track how users interact with specific features:

### Ask Feature

1. **Questions Per User**

   - Definition: Average number of questions asked per user per day/week
   - Target: Free >3/week, Premium >10/week, Pro >15/week
   - Dashboard: Product

2. **Philosophical Tone Distribution**

   - Definition: Distribution of philosophical tone selections
   - Frequency: Weekly
   - Dashboard: Product

3. **AI Response Rating**

   - Definition: Average rating of AI responses using the Contemplative Orb
   - Target: >4.2/5.0
   - Breakdown: By tone and question type
   - Dashboard: Product

4. **Insight Expansion Usage**

   - Definition: Percentage of eligible responses that receive expansion
   - Target: >15%
   - Dashboard: Product

5. **Concept Extraction Rate**

   - Definition: Average number of concepts extracted per AI response
   - Target: >2.5 concepts/response
   - Dashboard: Product

### Quest Feature

1. **Quest Completion Rate**

   - Definition: Percentage of started quests that are completed
   - Target: >40%
   - Breakdown: By quest difficulty and type
   - Dashboard: Product

2. **Active Quests Per User**

   - Definition: Average number of active quests per user
   - Target: >1.5
   - Breakdown: By user tier
   - Dashboard: Product

3. **Skill Tree Progression**

   - Definition: Distribution of users across the skill tree
   - Frequency: Monthly
   - Dashboard: Product

4. **Daily Quest Participation**

   - Definition: Percentage of users who engage with daily quests
   - Target: >25%
   - Dashboard: Product

### Explore Feature

1. **Concepts Viewed Per Session**

   - Definition: Average number of concepts viewed per exploration session
   - Target: >3
   - Dashboard: Product

2. **Exploration Path Depth**

   - Definition: Average number of steps in an exploration path
   - Target: >4 steps
   - Dashboard: Product

3. **Constellation View Usage**

   - Definition: Percentage of users who use the constellation view
   - Target: >30%
   - Dashboard: Product

4. **Concept Mastery Distribution**

   - Definition: Distribution of concept mastery levels across users
   - Frequency: Monthly
   - Dashboard: Product

### Journal Feature

1. **Journal Entries Per User**

   - Definition: Average number of journal entries per user per week
   - Target: Free >2/week, Premium/Pro >4/week
   - Dashboard: Product

2. **Journal Entry Length**

   - Definition: Average length of journal entries
   - Target: >150 words
   - Dashboard: Product

3. **Concept Tagging Rate**

   - Definition: Average number of concepts tagged per journal entry
   - Target: >1.5
   - Dashboard: Product

4. **Ask to Journal Conversion**
   - Definition: Percentage of Ask interactions saved to Journal
   - Target: >10%
   - Dashboard: Product

### Forum Feature

1. **Thread Creation Rate**

   - Definition: Number of new threads created per day
   - Target: >50/day at 10K MAU
   - Dashboard: Product

2. **Comment Rate**

   - Definition: Average number of comments per thread
   - Target: >3
   - Dashboard: Product

3. **Upvote Distribution**

   - Definition: Distribution of upvotes across threads and comments
   - Frequency: Weekly
   - Dashboard: Product

4. **User Participation Rate**
   - Definition: Percentage of active users who participate in forum
   - Target: >15%
   - Dashboard: Product

## Technical Performance Metrics

These metrics track the technical performance of the application:

1. **App Load Time**

   - Definition: Time from app launch to interactive state
   - Target: <3 seconds
   - Breakdown: By device type and app version
   - Dashboard: Technical

2. **API Response Time**

   - Definition: Average response time for API calls
   - Target: <500ms (95th percentile)
   - Breakdown: By endpoint
   - Dashboard: Technical

3. **AI Response Time**

   - Definition: Time to generate AI responses
   - Target: <5 seconds (90th percentile)
   - Breakdown: By model and tone
   - Dashboard: Technical

4. **Crash-Free Sessions**

   - Definition: Percentage of sessions without crashes
   - Target: >99.5%
   - Breakdown: By device type and app version
   - Dashboard: Technical

5. **Token Usage**

   - Definition: Average token consumption per AI interaction
   - Target: [Optimized for cost-effectiveness]
   - Breakdown: By model and tone
   - Dashboard: Technical

6. **Database Performance**

   - Definition: Query response times
   - Target: <100ms (95th percentile)
   - Dashboard: Technical

7. **Redis Cache Hit Ratio**

   - Definition: Percentage of cache hits vs. misses
   - Target: >85%
   - Dashboard: Technical

8. **Error Rate**
   - Definition: Percentage of API calls resulting in errors
   - Target: <0.5%
   - Breakdown: By endpoint
   - Dashboard: Technical

## Dashboard Structure

The KPIs and metrics will be visualized through seven core dashboards in PostHog:

1. **Executive Dashboard**

   - Purpose: High-level business health overview
   - Primary audience: Leadership team
   - Key metrics: MAU/DAU, conversion rate, ARPU, churn rate

2. **Growth Dashboard**

   - Purpose: User acquisition tracking
   - Primary audience: Growth team
   - Key metrics: New users, onboarding completion, acquisition channels

3. **Engagement Dashboard**

   - Purpose: User interaction monitoring
   - Primary audience: Product team
   - Key metrics: Session frequency/duration, feature usage, XP accumulation

4. **Retention Dashboard**

   - Purpose: User retention analysis
   - Primary audience: Product team
   - Key metrics: Retention cohorts, churn predictors, lifecycle stages

5. **Revenue Dashboard**

   - Purpose: Monetization tracking
   - Primary audience: Business team
   - Key metrics: Conversion rate, tier distribution, feature limit encounters

6. **Product Dashboard**

   - Purpose: Feature usage details
   - Primary audience: Product team
   - Key metrics: Feature-specific usage statistics, user feedback

7. **Technical Dashboard**
   - Purpose: Performance monitoring
   - Primary audience: Engineering team
   - Key metrics: Response times, error rates, resource usage

## Privacy Compliance

All analytics tracking must adhere to these privacy compliance requirements:

1. **Data Collection Consent**

   - Clear consent obtained during onboarding
   - Granular options for analytics participation
   - Easy access to privacy settings

2. **Data Minimization**

   - Only collect data necessary for defined metrics
   - Avoid collecting personally identifiable information (PII)
   - Use data pseudonymization where possible

3. **GDPR Compliance**

   - Support for data access requests
   - Support for data deletion requests
   - Data retention policies (maximum 25 months)

4. **CCPA Compliance**

   - Clear disclosure of data collected
   - Opt-out mechanism for data sales (though we don't sell data)
   - Privacy policy link in app

5. **Children's Privacy**

   - Age verification during signup
   - Restricted analytics for users under 16
   - Parental consent mechanisms

6. **Data Security**

   - Encryption of analytics data in transit and at rest
   - Access controls for analytics dashboards
   - Regular security audits of analytics infrastructure

## Implementation Guidelines

These guidelines ensure consistent and accurate implementation of the measurement framework:

1. **Naming Conventions**

   - All event names prefixed with `ph_` (for PostHog)
   - Use kebab-case for event names (e.g., `ph_user-signup`)
   - Consistent property naming across events

2. **User Identification**

   - Use anonymized user IDs for tracking
   - Track core user properties (tier, join date, etc.)
   - Update user properties when changes occur

3. **Event Schema Versioning**

   - Maintain event schema documentation
   - Version changes to event schemas
   - Backward compatibility for analysis

4. **Implementation Validation**

   - Automated tests for analytics implementation
   - Regular data quality audits
   - Validation process for new event tracking

5. **Technical Integration**

   - PostHog implementation in both frontend and backend
   - Use batch processing for performance optimization
   - Implement offline tracking capabilities

6. **Documentation**

   - Keep this framework document updated
   - Document all events and properties
   - Provide clear implementation examples

7. **Review Process**
   - Quarterly review of KPIs and targets
   - Monthly review of dashboard effectiveness
   - Data quality review after major releases

## Target Refinement Plan

To maintain effective performance monitoring, targets will be refined through:

1. **Baseline Establishment**

   - Collect initial data for 30 days post-launch
   - Establish baseline performance for all metrics

2. **Quarterly Target Review**

   - Review and adjust targets based on actual performance
   - Document changes and rationale

3. **Competitive Benchmarking**

   - Annually compare targets against industry benchmarks
   - Adjust to maintain competitive position

4. **Growth Adjustment**
   - Scale targets appropriately as user base grows
   - Different targets for different market maturity stages
