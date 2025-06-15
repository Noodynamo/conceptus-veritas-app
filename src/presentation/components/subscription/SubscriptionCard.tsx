import React from 'react';
import { SubscriptionTier, TierType } from '../../../domain/entities/subscription/SubscriptionTier';
import { useSubscriptionViewModel } from '../../viewmodels/subscription/SubscriptionViewModel';
import { useDependencies } from '../../../contexts/DependencyContext';

interface SubscriptionCardProps {
  tier: SubscriptionTier;
  isCurrentTier: boolean;
  onUpgrade: (tierId: string) => Promise<void>;
  onDowngrade: (tierId: string) => Promise<void>;
}

/**
 * Component to display a subscription tier card
 * Shows tier details and upgrade/downgrade buttons
 */
export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  tier,
  isCurrentTier,
  onUpgrade,
  onDowngrade,
}) => {
  return (
    <div className={`subscription-card ${isCurrentTier ? 'current-tier' : ''}`}>
      <div className="card-header">
        <h3>{tier.name}</h3>
        {isCurrentTier && <span className="current-badge">Current Plan</span>}
      </div>

      <div className="card-price">
        <span className="price">${tier.monthlyPrice.toFixed(2)}</span>
        <span className="period">/month</span>
      </div>

      <div className="annual-price">
        ${tier.annualPrice.toFixed(2)}/year (Save $
        {(tier.monthlyPrice * 12 - tier.annualPrice).toFixed(2)})
      </div>

      <div className="features-list">
        <h4>Features</h4>
        <ul>
          {tier.features.map(feature => (
            <li key={feature.id} className={feature.isEnabled ? 'enabled' : 'disabled'}>
              {feature.name}
              {feature.usageLimit && (
                <span className="limit">({feature.usageLimit} per month)</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="card-actions">
        {!isCurrentTier && tier.type !== TierType.FREE && (
          <button className="upgrade-button" onClick={() => onUpgrade(tier.id)}>
            Upgrade
          </button>
        )}

        {!isCurrentTier && tier.type === TierType.FREE && (
          <button className="downgrade-button" onClick={() => onDowngrade(tier.id)}>
            Downgrade
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Container component that manages subscription tiers
 * Uses the SubscriptionViewModel to handle business logic
 * Dependencies are injected via the DependencyContext
 */
export const SubscriptionManager: React.FC<{ userId: string }> = ({ userId }) => {
  // Get dependencies from the context
  const {
    getUserSubscriptionUseCase,
    getAllTiersUseCase,
    upgradeTierUseCase,
    downgradeTierUseCase,
  } = useDependencies();

  // Initialize the view model with injected dependencies
  const viewModel = useSubscriptionViewModel(
    getUserSubscriptionUseCase,
    getAllTiersUseCase,
    upgradeTierUseCase,
    downgradeTierUseCase,
    userId
  );

  const { state, upgradeTier, downgradeTier, refreshSubscription } = viewModel;
  const { userSubscription, availableTiers, loading, error } = state;

  const handleUpgrade = async (tierId: string) => {
    const success = await upgradeTier(tierId);
    if (success) {
      // Show success message
    }
  };

  const handleDowngrade = async (tierId: string) => {
    const success = await downgradeTier(tierId);
    if (success) {
      // Show success message
    }
  };

  if (loading) {
    return <div>Loading subscription information...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Error loading subscription data: {error.message}</p>
        <button onClick={refreshSubscription}>Retry</button>
      </div>
    );
  }

  return (
    <div className="subscription-manager">
      <h2>Subscription Plans</h2>
      <div className="subscription-grid">
        {availableTiers.map(tier => (
          <SubscriptionCard
            key={tier.id}
            tier={tier}
            isCurrentTier={userSubscription?.id === tier.id}
            onUpgrade={handleUpgrade}
            onDowngrade={handleDowngrade}
          />
        ))}
      </div>
    </div>
  );
};
