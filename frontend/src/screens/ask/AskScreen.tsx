import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useAnalytics } from '../../hooks/useAnalytics';
import { AnalyticsEvent } from '../../types/analytics';
import { ScreenTracker } from '../../components/common/ScreenTracker';
import { EVENT_PARAMS } from '../../constants/analytics';

/**
 * Ask Screen Component
 * Demonstrates how to integrate analytics tracking in a screen
 */
const AskScreen: React.FC = () => {
  const [question, setQuestion] = useState('');
  const { trackEvent, isFeatureEnabled } = useAnalytics();

  // Example of using feature flags
  const isAdvancedRouterEnabled = isFeatureEnabled('ai-router-phase-2-enabled');

  const handleSubmitQuestion = () => {
    if (!question.trim()) return;

    // Track the question submission event
    trackEvent(AnalyticsEvent.ASK_QUESTION_SUBMITTED, {
      [EVENT_PARAMS.QUESTION_LENGTH]: question.length,
      // You would determine these values from your actual implementation
      [EVENT_PARAMS.TONE_ID]: 'analytical',
      [EVENT_PARAMS.AI_MODEL_USED]: isAdvancedRouterEnabled ? 'advanced_router' : 'basic_router',
    });

    // Handle the actual question submission logic here
    console.log('Submitting question:', question);
    setQuestion('');
  };

  const handleRateResponse = (rating: number, responseId: string) => {
    // Track the response rating event
    trackEvent(AnalyticsEvent.ASK_RESPONSE_RATED, {
      [EVENT_PARAMS.RATING_VALUE]: rating,
      [EVENT_PARAMS.RESPONSE_ID]: responseId,
    });

    // Handle the actual rating logic here
    console.log(`Rating response ${responseId} with ${rating}`);
  };

  return (
    <View style={styles.container}>
      {/* Include the ScreenTracker component to automatically track screen views */}
      <ScreenTracker />

      <Text style={styles.title}>Ask the Sage</Text>

      <TextInput
        style={styles.input}
        value={question}
        onChangeText={setQuestion}
        placeholder="What philosophical question is on your mind?"
        multiline
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmitQuestion}
        disabled={!question.trim()}
      >
        <Text style={styles.buttonText}>Submit Question</Text>
      </TouchableOpacity>

      {/* Example of response rating UI */}
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingTitle}>Rate the last response:</Text>

        <View style={styles.ratingButtons}>
          <TouchableOpacity
            style={[styles.ratingButton, styles.negativeButton]}
            onPress={() => handleRateResponse(-1, 'sample-response-id')}
          >
            <Text style={styles.ratingButtonText}>👎</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.ratingButton, styles.positiveButton]}
            onPress={() => handleRateResponse(1, 'sample-response-id')}
          >
            <Text style={styles.ratingButtonText}>👍</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.ratingButton, styles.insightfulButton]}
            onPress={() => handleRateResponse(2, 'sample-response-id')}
          >
            <Text style={styles.ratingButtonText}>💡</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#4A6FA5',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  ratingContainer: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  ratingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  ratingButton: {
    padding: 10,
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  negativeButton: {
    backgroundColor: '#FFE8E8',
  },
  positiveButton: {
    backgroundColor: '#E8FFE8',
  },
  insightfulButton: {
    backgroundColor: '#E8F4FF',
  },
  ratingButtonText: {
    fontSize: 24,
  },
});

export default AskScreen;
