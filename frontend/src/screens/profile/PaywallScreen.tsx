import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform
} from 'react-native';
import {
  Text,
  Title,
  Subheading,
  Button,
  Card,
  ActivityIndicator,
  Divider,
  Chip
} from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { SubscriptionTier, TIER_NAMES } from '../../types/subscription';
import { subscriptionService } from '../../services/subscriptionService';

type RootStackParamList = {
  Paywall: {
    source?: string;
    requiredTier?: SubscriptionTier;
    featureName?: string;
  };
};

type PaywallScreenRouteProp = RouteProp<RootStackParamList, 'Paywall'>;

const PaywallScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<PaywallScreenRouteProp>();
  const {
    tier: currentTier,
    isLoading,
    upgradeSubscription,
    error
  } = useSubscriptionStore();

  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [availableFeatures, setAvailableFeatures] = useState<Record<string, string[]>>({});

  // Get params from route
  const { source, requiredTier, featureName } = route.params || {};

  // Set default selected tier based on required tier or current tier
  useEffect(() => {
    if (requiredTier) {
      setSelectedTier(requiredTier);
    } else if (currentTier === SubscriptionTier.FREE) {
      setSelectedTier(SubscriptionTier.PREMIUM);
    } else if (currentTier === SubscriptionTier.PREMIUM) {
      setSelectedTier(SubscriptionTier.PRO);
    }
  }, [requiredTier, currentTier]);

  // Fetch available features for each tier
  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const features = await subscriptionService.getAvailableFeatures();

        // Organize features by tier
        const tierFeatures: Record<string, string[]> = {
          [SubscriptionTier.FREE]: [],
          [SubscriptionTier.PREMIUM]: [],
          [SubscriptionTier.PRO]: []
        };

        // Add features to their respective tiers
        if (features.available_features) {
          tierFeatures[SubscriptionTier.FREE] = features.available_features;
        }

        if (features.next_tier === SubscriptionTier.PREMIUM && features.next_tier_features) {
          tierFeatures[SubscriptionTier.PREMIUM] = [
            ...tierFeatures[SubscriptionTier.FREE],
            ...features.next_tier_features
          ];
        } else if (features.next_tier === SubscriptionTier.PRO && features.next_tier_features) {
          tierFeatures[SubscriptionTier.PREMIUM] = tierFeatures[SubscriptionTier.FREE];
          tierFeatures[SubscriptionTier.PRO] = [
            ...tierFeatures[SubscriptionTier.PREMIUM],
            ...features.next_tier_features
          ];
        }

        setAvailableFeatures(tierFeatures);
      } catch (err) {
        setErrorMessage('Failed to load subscription features');
      }
    };

    fetchFeatures();
  }, []);

  // Upgrade subscription handler
  const handleUpgrade = async () => {
    if (!selectedTier) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // In a real app, this would initiate a payment flow
      const success = await upgradeSubscription(selectedTier);

      if (success) {
        // Navigate back or to thank you screen
        navigation.goBack();
      } else {
        setErrorMessage('Subscription upgrade failed. Please try again.');
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Subscription upgrade failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate pricing for each tier
  const getTierPrice = (tier: SubscriptionTier): string => {
    switch (tier) {
      case SubscriptionTier.FREE:
        return 'Free';
      case SubscriptionTier.PREMIUM:
        return '$9.99/month';
      case SubscriptionTier.PRO:
        return '$19.99/month';
      default:
        return '';
    }
  };

  // Get tier features to display
  const getTierFeatures = (tier: SubscriptionTier): string[] => {
    const features = availableFeatures[tier] || [];
    // Format feature names for display
    return features.map(feature => {
      const parts = feature.split('_');
      return parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
    });
  };

  // Helper to check if a tier is available for upgrade
  const isTierAvailable = (tier: SubscriptionTier): boolean => {
    if (tier === SubscriptionTier.FREE) return false;
    if (currentTier === SubscriptionTier.PRO) return false;
    if (currentTier === SubscriptionTier.PREMIUM && tier === SubscriptionTier.PREMIUM) return false;
    return true;
  };

  // Message to display based on source
  const getSourceMessage = (): string => {
    if (featureName) {
      return `Upgrade your plan to unlock "${featureName}"`;
    }

    if (source === 'usage_limit') {
      return 'You've reached your usage limit. Upgrade to continue.';
    }

    if (source === 'feature_access') {
      return 'This feature requires a higher subscription tier.';
    }

    return 'Choose a plan that works for you';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Title style={styles.title}>Upgrade Your Experience</Title>
          <Subheading style={styles.subtitle}>{getSourceMessage()}</Subheading>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>Loading subscription options...</Text>
          </View>
        ) : (
          <View style={styles.tierContainer}>
            {/* Free Tier Card */}
            <Card style={[styles.tierCard, styles.freeTierCard]}>
              <Card.Content>
                <Title style={styles.tierTitle}>{TIER_NAMES[SubscriptionTier.FREE]}</Title>
                <Text style={styles.tierPrice}>{getTierPrice(SubscriptionTier.FREE)}</Text>
                <Divider style={styles.divider} />
                <View style={styles.featuresContainer}>
                  {getTierFeatures(SubscriptionTier.FREE).map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <Text style={styles.featureText}>✓ {feature}</Text>
                    </View>
                  ))}
                </View>
                <Button
                  mode="outlined"
                  disabled={true}
                  style={styles.tierButton}
                >
                  Current Plan
                </Button>
              </Card.Content>
            </Card>

            {/* Premium Tier Card */}
            <Card
              style={[
                styles.tierCard,
                styles.premiumTierCard,
                selectedTier === SubscriptionTier.PREMIUM && styles.selectedCard
              ]}
            >
              <Card.Content>
                <View style={styles.tierHeaderRow}>
                  <Title style={styles.tierTitle}>{TIER_NAMES[SubscriptionTier.PREMIUM]}</Title>
                  {currentTier === SubscriptionTier.PREMIUM && (
                    <Chip mode="outlined" style={styles.currentChip}>Current</Chip>
                  )}
                </View>
                <Text style={styles.tierPrice}>{getTierPrice(SubscriptionTier.PREMIUM)}</Text>
                <Divider style={styles.divider} />
                <View style={styles.featuresContainer}>
                  {getTierFeatures(SubscriptionTier.PREMIUM).map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <Text style={styles.featureText}>✓ {feature}</Text>
                    </View>
                  ))}
                </View>
                <Button
                  mode="contained"
                  disabled={!isTierAvailable(SubscriptionTier.PREMIUM) || isProcessing}
                  loading={isProcessing && selectedTier === SubscriptionTier.PREMIUM}
                  onPress={() => {
                    setSelectedTier(SubscriptionTier.PREMIUM);
                    handleUpgrade();
                  }}
                  style={styles.tierButton}
                >
                  {currentTier === SubscriptionTier.PREMIUM ? 'Current Plan' : 'Choose Premium'}
                </Button>
              </Card.Content>
            </Card>

            {/* Pro Tier Card */}
            <Card
              style={[
                styles.tierCard,
                styles.proTierCard,
                selectedTier === SubscriptionTier.PRO && styles.selectedCard
              ]}
            >
              <Card.Content>
                <View style={styles.tierHeaderRow}>
                  <Title style={styles.tierTitle}>{TIER_NAMES[SubscriptionTier.PRO]}</Title>
                  {currentTier === SubscriptionTier.PRO && (
                    <Chip mode="outlined" style={styles.currentChip}>Current</Chip>
                  )}
                </View>
                <Text style={styles.tierPrice}>{getTierPrice(SubscriptionTier.PRO)}</Text>
                <Divider style={styles.divider} />
                <View style={styles.featuresContainer}>
                  {getTierFeatures(SubscriptionTier.PRO).map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <Text style={styles.featureText}>✓ {feature}</Text>
                    </View>
                  ))}
                </View>
                <Button
                  mode="contained"
                  disabled={!isTierAvailable(SubscriptionTier.PRO) || isProcessing}
                  loading={isProcessing && selectedTier === SubscriptionTier.PRO}
                  onPress={() => {
                    setSelectedTier(SubscriptionTier.PRO);
                    handleUpgrade();
                  }}
                  style={[styles.tierButton, styles.proButton]}
                >
                  {currentTier === SubscriptionTier.PRO ? 'Current Plan' : 'Choose Pro'}
                </Button>
              </Card.Content>
            </Card>
          </View>
        )}

        {errorMessage && (
          <Text style={styles.errorText}>{errorMessage}</Text>
        )}

        <View style={styles.footer}>
          <Button mode="text" onPress={() => navigation.goBack()}>
            Maybe Later
          </Button>

          <Text style={styles.footerText}>
            Subscriptions will automatically renew unless canceled at least 24 hours before the end of the current period.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
  },
  tierContainer: {
    marginBottom: 24,
  },
  tierCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#6200ee',
  },
  freeTierCard: {
    backgroundColor: '#f5f5f5',
  },
  premiumTierCard: {
    backgroundColor: '#e0f7fa',
  },
  proTierCard: {
    backgroundColor: '#e8f5e9',
  },
  tierHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tierTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  currentChip: {
    height: 24,
  },
  tierPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 8,
  },
  divider: {
    marginVertical: 16,
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featureItem: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    lineHeight: 20,
  },
  tierButton: {
    marginTop: 8,
  },
  proButton: {
    backgroundColor: '#00897b',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
  footer: {
    marginTop: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.7,
    paddingHorizontal: 16,
  },
});

export default PaywallScreen;
