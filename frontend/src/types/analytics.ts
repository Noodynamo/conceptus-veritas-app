/**
 * User property types for analytics tracking
 */
export interface UserProperties {
  // Standard properties
  email?: string;
  name?: string;
  createdAt?: string;
  app_version?: string;
  device_type?: string;

  // Custom properties
  wisdom_xp_total?: number;
  wisdom_xp_level?: string;
  subscription_tier?: 'free' | 'premium' | 'pro';
  current_streak_days?: number;
  longest_streak_days?: number;
  active_quests_count?: number;
  completed_quests_count?: number;
  concept_mastery?: Record<string, number>;
  preferred_philosophical_tone?: string;
  ask_interactions_count?: number;
  journal_entries_count?: number;
  forum_contributions_count?: number;
  last_seen_feature?: 'Ask' | 'Quest' | 'Explore' | 'Journal' | 'Forum' | 'Profile';
}

/**
 * Feature flag keys
 */
export enum FeatureFlag {
  AI_ROUTER_PHASE_2 = 'ai-router-phase-2-enabled',
  EXPLORE_VISUALIZATION_MODE = 'explore-visualization-mode',
  QUEST_SKILL_TREE_LAYOUT = 'quest-skill-tree-layout',
  ORGANIC_DISCOVERY_SYSTEM = 'organic-discovery-system-enabled',
  PATH_CREATOR_ACCESS = 'path-creator-access',
}

/**
 * Feature flag variants
 */
export type FeatureFlagVariants = {
  [FeatureFlag.AI_ROUTER_PHASE_2]: boolean;
  [FeatureFlag.EXPLORE_VISUALIZATION_MODE]: 'concept-map' | 'constellation-view' | 'solar-system';
  [FeatureFlag.QUEST_SKILL_TREE_LAYOUT]: 'spatial' | 'linear-list' | 'radial-graph';
  [FeatureFlag.ORGANIC_DISCOVERY_SYSTEM]: boolean;
  [FeatureFlag.PATH_CREATOR_ACCESS]: boolean;
};

/**
 * Event types for PostHog tracking
 */
export enum AnalyticsEvent {
  // Onboarding & Core Lifecycle
  USER_SIGNED_UP = 'ph_user_signed_up',
  ONBOARDING_COMPLETED = 'ph_onboarding_completed',
  SUBSCRIPTION_VIEWED = 'ph_subscription_viewed',
  SUBSCRIPTION_UPGRADED = 'ph_subscription_upgraded',

  // Ask Feature Events
  ASK_QUESTION_SUBMITTED = 'ph_ask_question_submitted',
  ASK_RESPONSE_RATED = 'ph_ask_response_rated',
  SEEK_CLARITY_PATHWAY_USED = 'ph_seek_clarity_pathway_used',
  ASK_INTERACTION_SAVED_TO_JOURNAL = 'ph_ask_interaction_saved_to_journal',
  ASK_INTERACTION_SHARED_TO_FORUM = 'ph_ask_interaction_shared_to_forum',

  // Quest Feature Events
  QUEST_STARTED = 'ph_quest_started',
  QUEST_STEP_COMPLETED = 'ph_quest_step_completed',
  QUEST_COMPLETED = 'ph_quest_completed',
  SKILL_TREE_NAVIGATED = 'ph_skill_tree_navigated',

  // Explore Feature Events
  CONCEPT_EXPLORED = 'ph_concept_explored',
  CONSTELLATION_VIEW_ACTIVATED = 'ph_constellation_view_activated',
  WISDOM_PATH_STARTED = 'ph_wisdom_path_started',
  WISDOM_PATH_CREATED = 'ph_wisdom_path_created',
  ORGANIC_NUDGE_INTERACTED = 'ph_organic_nudge_interacted',

  // Journal & Forum Events
  JOURNAL_ENTRY_CREATED = 'ph_journal_entry_created',
  FORUM_THREAD_CREATED = 'ph_forum_thread_created',
  FORUM_COMMENT_POSTED = 'ph_forum_comment_posted',

  // Wisdom XP & Gamification Events
  WISDOM_XP_EARNED = 'ph_wisdom_xp_earned',
  USER_LEVEL_UPGRADED = 'ph_user_level_upgraded',
  BADGE_AWARDED = 'ph_badge_awarded',
  STREAK_EXTENDED = 'ph_streak_extended',

  // Screen view events
  SCREEN_VIEW = 'ph_screen_view',
}
