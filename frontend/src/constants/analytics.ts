/**
 * Analytics constants for the Conceptus Veritas app
 */

/**
 * User wisdom level mapping
 */
export const WISDOM_LEVELS = {
  1: 'Seeker',
  5: 'Explorer',
  10: 'Thinker',
  15: 'Philosopher',
  20: 'Sage',
};

/**
 * XP thresholds for each level
 */
export const XP_THRESHOLDS = {
  Seeker: 0,
  Explorer: 500,
  Thinker: 2000,
  Philosopher: 5000,
  Sage: 10000,
};

/**
 * Event parameter keys
 * Using constants to ensure consistency in analytics tracking
 */
export const EVENT_PARAMS = {
  // Common parameters
  SCREEN_NAME: 'screen_name',
  PREVIOUS_SCREEN: 'previous_screen',

  // User parameters
  USER_ID: 'user_id',
  EMAIL: 'email',
  NAME: 'name',
  CREATED_AT: 'created_at',
  SUBSCRIPTION_TIER: 'subscription_tier',

  // Ask feature parameters
  TONE_ID: 'tone_id',
  AI_MODEL_USED: 'ai_model_used',
  QUESTION_LENGTH: 'question_length',
  QUESTION_COMPLEXITY: 'question_complexity_score',
  RATING_VALUE: 'rating_value',
  RESPONSE_ID: 'response_id',
  PATHWAY_TYPE: 'pathway_type',

  // Quest parameters
  QUEST_ID: 'quest_id',
  STEP_NUMBER: 'step_number',
  STEP_TYPE: 'step_type',
  IS_CHALLENGE_NODE: 'is_challenge_node',
  TIME_TO_COMPLETE: 'time_to_complete',

  // Explore parameters
  CONCEPT_ID: 'concept_id',
  SOURCE_FEATURE: 'source_feature',
  PATH_ID: 'path_id',
  IS_USER_CREATED: 'is_user_created',
  NUDGE_TYPE: 'nudge_type',

  // Journal parameters
  ENTRY_LENGTH: 'entry_length',

  // Forum parameters
  CATEGORY_ID: 'category_id',
  THREAD_ID: 'thread_id',

  // Gamification parameters
  AMOUNT: 'amount',
  SOURCE_ACTION: 'source_action',
  NEW_LEVEL: 'new_level',
  BADGE_ID: 'badge_id',
  STREAK_DAYS: 'streak_days',
};
