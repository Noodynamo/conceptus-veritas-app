import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { SubscriptionTier, TIER_NAMES } from '../../types/subscription';
import { formatDate } from '../../utils/dateUtils';

interface SubscriptionCardProps {
  onUpgrade: () => void;
  onManage: () => void;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ onUpgrade, onManage }) => {
  const { tier, isActive, currentPeriodEnd, cancelAtPeriodEnd } = useSubscriptionStore();

  // Determine the card variant based on the subscription tier
  const getCardVariant = () => {
    switch (tier) {
      case SubscriptionTier.PRO:
        return styles.proCard;
      case SubscriptionTier.PREMIUM:
        return styles.premiumCard;
      default:
        return styles.freeCard;
    }
  };

  // Get the next tier to upgrade to
  const getNextTier = (): SubscriptionTier | null => {
    if (tier === SubscriptionTier.FREE) return SubscriptionTier.PREMIUM;
    if (tier === SubscriptionTier.PREMIUM) return SubscriptionTier.PRO;
    return null;
  };

  const nextTier = getNextTier();

  return (
    <Card style={[styles.card, getCardVariant()]}>
      <Card.Content>
        <View style={styles.header}>
          <Title style={styles.title}>{TIER_NAMES[tier]} Plan</Title>
          <View style={[styles.badge, getCardVariant()]}>
            <Text style={styles.badgeText}>{TIER_NAMES[tier]}</Text>
          </View>
        </View>

        <View style={styles.content}>
          {tier !== SubscriptionTier.FREE && (
            <>
              {isActive && (
                <Paragraph style={styles.detail}>
                  {cancelAtPeriodEnd
                    ? `Your plan will end on ${formatDate(currentPeriodEnd)}`
                    : `Your next billing date is ${formatDate(currentPeriodEnd)}`}
                </Paragraph>
              )}
            </>
          )}

          {tier === SubscriptionTier.FREE && (
            <Paragraph style={styles.message}>
              Upgrade to Premium for more features, higher usage limits, and an enhanced experience.
            </Paragraph>
          )}

          {tier === SubscriptionTier.PREMIUM && (
            <Paragraph style={styles.message}>
              You're enjoying Premium benefits! Upgrade to Pro for unlimited access to all features.
            </Paragraph>
          )}

          {tier === SubscriptionTier.PRO && (
            <Paragraph style={styles.message}>
              You have our top-tier Pro plan with unlimited access to all features!
            </Paragraph>
          )}
        </View>

        <View style={styles.actions}>
          {nextTier && (
            <Button
              mode="contained"
              onPress={onUpgrade}
              style={[styles.upgradeButton, getCardVariant()]}
            >
              Upgrade to {TIER_NAMES[nextTier]}
            </Button>
          )}

          {tier !== SubscriptionTier.FREE && (
            <Button mode="outlined" onPress={onManage} style={styles.manageButton}>
              Manage Subscription
            </Button>
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 12,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  freeCard: {
    backgroundColor: '#f5f5f5',
  },
  premiumCard: {
    backgroundColor: '#e0f7fa',
  },
  proCard: {
    backgroundColor: '#e8f5e9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontWeight: 'bold',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    marginBottom: 16,
  },
  detail: {
    marginBottom: 8,
  },
  message: {
    marginBottom: 12,
    lineHeight: 20,
  },
  actions: {
    marginTop: 8,
  },
  upgradeButton: {
    marginBottom: 8,
  },
  manageButton: {
    borderColor: '#757575',
  },
});

export default SubscriptionCard;
