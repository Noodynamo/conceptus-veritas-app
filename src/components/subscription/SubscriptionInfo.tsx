/**
 * Subscription Info Component
 *
 * This component displays the user's current subscription information and upgrade options.
 */

import React from 'react';
import styled from 'styled-components/macro';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { TierType, PlatformType, BillingCycle } from '../../models/subscription/tiers';

// Styled components
const Container = styled.div`
  padding: 20px;
  border-radius: 8px;
  background-color: ${props => props.theme.colors.background.secondary};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const TierBadge = styled.div<{ tier: TierType }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 16px;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 16px;
  background-color: ${props => {
    switch (props.tier) {
      case TierType.FREE:
        return props.theme.colors.tier.free;
      case TierType.PREMIUM:
        return props.theme.colors.tier.premium;
      case TierType.PRO:
        return props.theme.colors.tier.pro;
      default:
        return props.theme.colors.tier.free;
    }
  }};
  color: ${props => props.theme.colors.text.onTier};
`;

const Title = styled.h2`
  font-size: 20px;
  margin-bottom: 8px;
  color: ${props => props.theme.colors.text.primary};
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 16px;
`;

const FeatureList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 16px 0;
`;

const FeatureItem = styled.li`
  padding: 8px 0;
  display: flex;
  align-items: center;
  border-bottom: 1px solid ${props => props.theme.colors.border.light};

  &:last-child {
    border-bottom: none;
  }
`;

const FeatureIcon = styled.span`
  margin-right: 12px;
  color: ${props => props.theme.colors.accent.primary};
`;

const FeatureName = styled.span`
  flex: 1;
  font-size: 14px;
  color: ${props => props.theme.colors.text.primary};
`;

const FeatureValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.secondary};
`;

const UpgradeButton = styled.button`
  background-color: ${props => props.theme.colors.accent.primary};
  color: ${props => props.theme.colors.text.onAccent};
  border: none;
  border-radius: 4px;
  padding: 10px 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  margin-top: 16px;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${props => props.theme.colors.accent.hover};
  }

  &:disabled {
    background-color: ${props => props.theme.colors.accent.disabled};
    cursor: not-allowed;
  }
`;

const LoadingIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.status.error};
  padding: 16px;
  border-radius: 4px;
  background-color: ${props => props.theme.colors.status.errorBg};
  margin-bottom: 16px;
`;

interface SubscriptionInfoProps {
  showUpgradeButton?: boolean;
  onUpgradeClick?: (tierId: TierType) => void;
}

/**
 * Subscription Info Component
 */
export const SubscriptionInfo: React.FC<SubscriptionInfoProps> = ({
  showUpgradeButton = true,
  onUpgradeClick,
}) => {
  const { currentTier, subscription, isLoading, error, calculatePrice } = useSubscription();

  // Handle upgrade button click
  const handleUpgradeClick = () => {
    if (onUpgradeClick) {
      // Suggest next tier up
      const nextTier =
        currentTier.id === TierType.FREE
          ? TierType.PREMIUM
          : currentTier.id === TierType.PREMIUM
            ? TierType.PRO
            : null;

      if (nextTier) {
        onUpgradeClick(nextTier);
      }
    }
  };

  // Determine if upgrade is available
  const canUpgrade = currentTier.id !== TierType.PRO;

  // Get key features to display
  const getKeyFeatures = () => {
    const features = [];

    switch (currentTier.id) {
      case TierType.FREE:
        features.push(
          { name: 'Daily Questions', value: '10/day' },
          { name: 'Journal Entries', value: '5/day' },
          { name: 'Philosophical Tones', value: '5 basic' },
          { name: 'Daily Quests', value: '1/day' },
          { name: 'Ads', value: 'Yes (minimal)' }
        );
        break;
      case TierType.PREMIUM:
        features.push(
          { name: 'Daily Questions', value: '50/day' },
          { name: 'Journal Entries', value: 'Unlimited' },
          { name: 'Philosophical Tones', value: 'All standard' },
          { name: 'Daily Quests', value: '3/day' },
          { name: 'Ads', value: 'None' }
        );
        break;
      case TierType.PRO:
        features.push(
          { name: 'Daily Questions', value: 'Unlimited' },
          { name: 'Journal Entries', value: 'Unlimited' },
          { name: 'Philosophical Tones', value: 'All + exclusives' },
          { name: 'Daily Quests', value: '5/day' },
          { name: 'Ads', value: 'None' }
        );
        break;
    }

    return features;
  };

  // Calculate next tier price
  const getNextTierPrice = () => {
    if (currentTier.id === TierType.FREE) {
      return calculatePrice(TierType.PREMIUM, PlatformType.MOBILE, BillingCycle.MONTHLY);
    } else if (currentTier.id === TierType.PREMIUM) {
      return calculatePrice(TierType.PRO, PlatformType.MOBILE, BillingCycle.MONTHLY);
    }
    return 0;
  };

  // Render loading state
  if (isLoading) {
    return (
      <Container>
        <LoadingIndicator>Loading subscription info...</LoadingIndicator>
      </Container>
    );
  }

  // Render error state
  if (error) {
    return (
      <Container>
        <ErrorMessage>
          Failed to load subscription information. Please try again later.
        </ErrorMessage>
      </Container>
    );
  }

  // Get features to display
  const keyFeatures = getKeyFeatures();

  return (
    <Container>
      <TierBadge tier={currentTier.id}>{currentTier.name} Plan</TierBadge>

      <Title>Your Subscription</Title>
      <Subtitle>{currentTier.description}</Subtitle>

      {subscription?.isInTrial && (
        <Subtitle>Trial ends on {subscription.trialEndDate?.toLocaleDateString()}</Subtitle>
      )}

      <FeatureList>
        {keyFeatures.map((feature, index) => (
          <FeatureItem key={index}>
            <FeatureIcon>✓</FeatureIcon>
            <FeatureName>{feature.name}</FeatureName>
            <FeatureValue>{feature.value}</FeatureValue>
          </FeatureItem>
        ))}
      </FeatureList>

      {showUpgradeButton && canUpgrade && (
        <UpgradeButton onClick={handleUpgradeClick}>
          Upgrade to {currentTier.id === TierType.FREE ? 'Premium' : 'Pro'} (${getNextTierPrice()}
          /month)
        </UpgradeButton>
      )}
    </Container>
  );
};

export default SubscriptionInfo;
