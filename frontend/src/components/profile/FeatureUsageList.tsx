import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { List, Text, ProgressBar, Divider, Title } from 'react-native-paper';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { FeatureUsageSummary, FEATURE_NAMES } from '../../types/subscription';
import { formatDuration } from '../../utils/dateUtils';

interface FeatureUsageListProps {
  showTitle?: boolean;
}

const FeatureUsageList: React.FC<FeatureUsageListProps> = ({ showTitle = true }) => {
  const { featureUsage } = useSubscriptionStore();

  // Convert feature usage object to array for FlatList
  const usageItems = Object.values(featureUsage).sort((a, b) =>
    a.feature_name.localeCompare(b.feature_name),
  );

  // Render a single feature usage item
  const renderUsageItem = ({ item }: { item: FeatureUsageSummary }) => {
    const displayName = FEATURE_NAMES[item.feature_name] || item.feature_name;
    const progress = item.daily_limit > 0 ? item.used_today / item.daily_limit : 0;
    const unlimited = item.daily_limit >= 99999;

    return (
      <View style={styles.itemContainer}>
        <List.Item
          title={displayName}
          description={
            <View style={styles.usageInfo}>
              <Text style={styles.usageText}>
                {unlimited
                  ? `Used today: ${item.used_today}`
                  : `${item.used_today} / ${item.daily_limit} used`}
              </Text>
              {!unlimited && <Text style={styles.remainingText}>{item.remaining} remaining</Text>}
              {item.reset_time && <Text style={styles.resetText}>Resets in {item.reset_time}</Text>}
            </View>
          }
          left={props => <List.Icon {...props} icon={getIconForFeature(item.feature_name)} />}
        />

        {!unlimited && (
          <View style={styles.progressContainer}>
            <ProgressBar
              progress={progress}
              color={getProgressColor(progress)}
              style={styles.progressBar}
            />
          </View>
        )}

        <Divider />
      </View>
    );
  };

  // Helper to get icon for feature type
  const getIconForFeature = (featureName: string): string => {
    if (featureName === 'ask_questions') return 'chat-question';
    if (featureName === 'journal_entries') return 'notebook';
    if (featureName === 'quest_daily') return 'compass';
    if (featureName === 'forum_threads') return 'forum';
    if (featureName === 'forum_comments') return 'comment';
    if (featureName === 'forum_votes') return 'thumb-up';
    if (featureName === 'insight_expansion') return 'lightbulb-on';
    if (featureName === 'save_to_journal') return 'content-save';
    if (featureName === 'concept_tagging') return 'tag';
    if (featureName === 'media_attachments') return 'attachment';
    return 'star';
  };

  // Helper to get color based on usage percentage
  const getProgressColor = (progress: number): string => {
    if (progress >= 0.9) return '#f44336'; // Red for high usage
    if (progress >= 0.7) return '#ff9800'; // Orange for medium usage
    return '#4caf50'; // Green for low usage
  };

  if (usageItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No feature usage data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showTitle && <Title style={styles.title}>Daily Feature Usage</Title>}

      <FlatList
        data={usageItems}
        renderItem={renderUsageItem}
        keyExtractor={item => item.feature_name}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  title: {
    marginBottom: 8,
    marginLeft: 8,
  },
  itemContainer: {
    marginBottom: 4,
  },
  usageInfo: {
    marginTop: 4,
  },
  usageText: {
    fontSize: 14,
  },
  remainingText: {
    fontSize: 14,
    marginTop: 2,
  },
  resetText: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.7,
  },
  progressContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  emptyText: {
    opacity: 0.6,
  },
});

export default FeatureUsageList;
