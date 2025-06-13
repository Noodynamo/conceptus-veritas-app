import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import {
  Text,
  Title,
  Subheading,
  Button,
  ActivityIndicator,
  Divider,
  Surface,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { formatDate } from '../../utils/dateUtils';
import { SubscriptionTier, TIER_NAMES } from '../../types/subscription';
import SubscriptionCard from '../../components/profile/SubscriptionCard';
import FeatureUsageList from '../../components/profile/FeatureUsageList';

const SubscriptionInfoScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    tier,
    status,
    isActive,
    currentPeriodEnd,
    cancelAtPeriodEnd,
    fetchSubscription,
    isLoading,
    error,
  } = useSubscriptionStore();

  // Fetch subscription data when screen loads
  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Handle subscription upgrade button
  const handleUpgrade = () => {
    navigation.navigate('Paywall' as never);
  };

  // Handle manage subscription button
  const handleManage = () => {
    // This would navigate to subscription management screen
    // where users can cancel, change payment methods, etc.
    navigation.navigate('SubscriptionManage' as never);
  };

  // UI components
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Title style={styles.title}>Subscription & Usage</Title>
      <Subheading style={styles.subtitle}>
        Manage your subscription and view feature usage
      </Subheading>
    </View>
  );

  const renderSubscriptionDetails = () => (
    <View style={styles.detailsContainer}>
      <SubscriptionCard onUpgrade={handleUpgrade} onManage={handleManage} />

      {tier === SubscriptionTier.FREE && (
        <Surface style={styles.upgradePrompt}>
          <Text style={styles.upgradeText}>
            Upgrade to Premium or Pro to unlock more features and higher usage limits!
          </Text>
          <Button mode="contained" onPress={handleUpgrade} style={styles.upgradeButton}>
            View Plans
          </Button>
        </Surface>
      )}

      {isActive && currentPeriodEnd && (
        <View style={styles.periodInfo}>
          <Text style={styles.periodText}>
            {cancelAtPeriodEnd
              ? `Your subscription will end on ${formatDate(currentPeriodEnd)}`
              : `Next billing date: ${formatDate(currentPeriodEnd)}`}
          </Text>
        </View>
      )}
    </View>
  );

  const renderUsageLimits = () => (
    <View style={styles.usageContainer}>
      <Title style={styles.sectionTitle}>Your Usage Limits</Title>
      <FeatureUsageList showTitle={false} />
    </View>
  );

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" />
      <Text style={styles.loadingText}>Loading subscription information...</Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>
        {error || 'Failed to load subscription information. Please try again.'}
      </Text>
      <Button mode="contained" onPress={() => fetchSubscription()} style={styles.retryButton}>
        Retry
      </Button>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {renderHeader()}

        {isLoading ? (
          renderLoading()
        ) : error ? (
          renderError()
        ) : (
          <>
            {renderSubscriptionDetails()}
            <Divider style={styles.divider} />
            {renderUsageLimits()}
          </>
        )}
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
  headerContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    opacity: 0.7,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 16,
  },
  detailsContainer: {
    marginBottom: 24,
  },
  periodInfo: {
    marginTop: 8,
    alignItems: 'center',
  },
  periodText: {
    fontSize: 14,
    opacity: 0.7,
  },
  upgradePrompt: {
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    backgroundColor: '#f5f5f5',
    elevation: 1,
  },
  upgradeText: {
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  upgradeButton: {
    marginTop: 8,
  },
  divider: {
    marginVertical: 16,
  },
  usageContainer: {
    marginBottom: 24,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    marginTop: 8,
  },
});

export default SubscriptionInfoScreen;
