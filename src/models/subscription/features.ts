/**
 * Subscription Features
 *
 * This file defines the features available in the subscription system
 * and their categorization for the Conceptus Veritas app.
 */

/**
 * Feature categories
 */
export enum FeatureCategory {
  ASK_AI = 'ask_ai',
  JOURNAL = 'journal',
  QUEST = 'quest',
  EXPLORE = 'explore',
  FORUM = 'forum',
  PROFILE = 'profile',
  GENERAL = 'general',
}

/**
 * Feature interface
 */
export interface Feature {
  id: string;
  name: string;
  description: string;
  category: FeatureCategory;
  isLimitable: boolean;
  isToggleable: boolean;
  hasQualitativeLevels: boolean;
}

/**
 * All available features in the app
 */
export const FEATURES: Feature[] = [
  // Ask AI Features
  {
    id: 'dailyQuestions',
    name: 'Daily Questions',
    description: 'Number of questions that can be asked to the AI per day',
    category: FeatureCategory.ASK_AI,
    isLimitable: true,
    isToggleable: false,
    hasQualitativeLevels: false,
  },
  {
    id: 'philosophicalTones',
    name: 'Philosophical Tones',
    description: 'Available philosophical tones for AI conversations',
    category: FeatureCategory.ASK_AI,
    isLimitable: false,
    isToggleable: false,
    hasQualitativeLevels: true,
  },
  {
    id: 'responseLength',
    name: 'Response Length',
    description: 'Maximum length of AI responses',
    category: FeatureCategory.ASK_AI,
    isLimitable: false,
    isToggleable: false,
    hasQualitativeLevels: true,
  },
  {
    id: 'insightExpansion',
    name: 'Insight Expansion',
    description: 'Ability to request deeper insights on AI responses',
    category: FeatureCategory.ASK_AI,
    isLimitable: true,
    isToggleable: true,
    hasQualitativeLevels: false,
  },
  {
    id: 'aiModelQuality',
    name: 'AI Model Quality',
    description: 'Quality level of AI models used for responses',
    category: FeatureCategory.ASK_AI,
    isLimitable: false,
    isToggleable: false,
    hasQualitativeLevels: true,
  },
  {
    id: 'saveToJournal',
    name: 'Save to Journal',
    description: 'Ability to save AI conversations to journal',
    category: FeatureCategory.ASK_AI,
    isLimitable: true,
    isToggleable: false,
    hasQualitativeLevels: false,
  },

  // Journal Features
  {
    id: 'journalEntries',
    name: 'Journal Entries',
    description: 'Number of journal entries that can be created per day',
    category: FeatureCategory.JOURNAL,
    isLimitable: true,
    isToggleable: false,
    hasQualitativeLevels: false,
  },
  {
    id: 'entryTypes',
    name: 'Entry Types',
    description: 'Types of journal entries available',
    category: FeatureCategory.JOURNAL,
    isLimitable: false,
    isToggleable: false,
    hasQualitativeLevels: true,
  },
  {
    id: 'mediaAttachments',
    name: 'Media Attachments',
    description: 'Number and types of media that can be attached to journal entries',
    category: FeatureCategory.JOURNAL,
    isLimitable: true,
    isToggleable: false,
    hasQualitativeLevels: false,
  },
  {
    id: 'conceptTagging',
    name: 'Concept Tagging',
    description: 'Number of concept tags that can be added to journal entries',
    category: FeatureCategory.JOURNAL,
    isLimitable: true,
    isToggleable: false,
    hasQualitativeLevels: false,
  },
  {
    id: 'journalPrompts',
    name: 'Journal Prompts',
    description: 'Quality and personalization of journal prompts',
    category: FeatureCategory.JOURNAL,
    isLimitable: false,
    isToggleable: false,
    hasQualitativeLevels: true,
  },
  {
    id: 'exportOptions',
    name: 'Export Options',
    description: 'Ability to export journal entries in various formats',
    category: FeatureCategory.JOURNAL,
    isLimitable: false,
    isToggleable: true,
    hasQualitativeLevels: true,
  },

  // Quest Features
  {
    id: 'availableQuests',
    name: 'Available Quests',
    description: 'Types of quests available to the user',
    category: FeatureCategory.QUEST,
    isLimitable: false,
    isToggleable: false,
    hasQualitativeLevels: true,
  },
  {
    id: 'dailyQuests',
    name: 'Daily Quests',
    description: 'Number of daily quests available',
    category: FeatureCategory.QUEST,
    isLimitable: true,
    isToggleable: false,
    hasQualitativeLevels: false,
  },
  {
    id: 'questDifficultyLevels',
    name: 'Quest Difficulty Levels',
    description: 'Available difficulty levels for quests',
    category: FeatureCategory.QUEST,
    isLimitable: false,
    isToggleable: false,
    hasQualitativeLevels: true,
  },
  {
    id: 'skillTreeAccess',
    name: 'Skill Tree Access',
    description: 'Level of access to the skill tree',
    category: FeatureCategory.QUEST,
    isLimitable: false,
    isToggleable: false,
    hasQualitativeLevels: true,
  },
  {
    id: 'questRewardsBonus',
    name: 'Quest Rewards Bonus',
    description: 'Bonus percentage for quest rewards',
    category: FeatureCategory.QUEST,
    isLimitable: false,
    isToggleable: false,
    hasQualitativeLevels: false,
  },

  // Explore Features
  {
    id: 'conceptAccess',
    name: 'Concept Access',
    description: 'Level of access to philosophical concepts',
    category: FeatureCategory.EXPLORE,
    isLimitable: false,
    isToggleable: false,
    hasQualitativeLevels: true,
  },
  {
    id: 'visualizationTools',
    name: 'Visualization Tools',
    description: 'Quality of concept visualization tools',
    category: FeatureCategory.EXPLORE,
    isLimitable: false,
    isToggleable: false,
    hasQualitativeLevels: true,
  },
  {
    id: 'conceptRelationships',
    name: 'Concept Relationships',
    description: 'Types of concept relationships visible',
    category: FeatureCategory.EXPLORE,
    isLimitable: false,
    isToggleable: false,
    hasQualitativeLevels: true,
  },
  {
    id: 'learningPathways',
    name: 'Learning Pathways',
    description: 'Number of learning pathways that can be active simultaneously',
    category: FeatureCategory.EXPLORE,
    isLimitable: true,
    isToggleable: false,
    hasQualitativeLevels: false,
  },
  {
    id: 'createCustomPathways',
    name: 'Create Custom Pathways',
    description: 'Ability to create custom learning pathways',
    category: FeatureCategory.EXPLORE,
    isLimitable: false,
    isToggleable: true,
    hasQualitativeLevels: false,
  },
  {
    id: 'connectConcepts',
    name: 'Connect Concepts',
    description: 'Ability to create connections between concepts',
    category: FeatureCategory.EXPLORE,
    isLimitable: true,
    isToggleable: false,
    hasQualitativeLevels: true,
  },

  // Forum Features
  {
    id: 'createThreads',
    name: 'Create Threads',
    description: 'Number of forum threads that can be created per day',
    category: FeatureCategory.FORUM,
    isLimitable: true,
    isToggleable: false,
    hasQualitativeLevels: false,
  },
  {
    id: 'postComments',
    name: 'Post Comments',
    description: 'Number of comments that can be posted per day',
    category: FeatureCategory.FORUM,
    isLimitable: true,
    isToggleable: false,
    hasQualitativeLevels: false,
  },
  {
    id: 'upvoteDownvote',
    name: 'Upvote/Downvote',
    description: 'Number of votes that can be cast per day',
    category: FeatureCategory.FORUM,
    isLimitable: true,
    isToggleable: false,
    hasQualitativeLevels: false,
  },
  {
    id: 'specialForumBadge',
    name: 'Special Forum Badge',
    description: 'Special badge displayed in the forum',
    category: FeatureCategory.FORUM,
    isLimitable: false,
    isToggleable: true,
    hasQualitativeLevels: true,
  },

  // Profile & Gamification Features
  {
    id: 'wisdomXpEarningBonus',
    name: 'Wisdom XP Earning Bonus',
    description: 'Bonus percentage for earning Wisdom XP',
    category: FeatureCategory.PROFILE,
    isLimitable: false,
    isToggleable: false,
    hasQualitativeLevels: false,
  },
  {
    id: 'streakFreeze',
    name: 'Streak Freeze',
    description: 'Number of streak freezes available per month',
    category: FeatureCategory.PROFILE,
    isLimitable: true,
    isToggleable: false,
    hasQualitativeLevels: false,
  },
  {
    id: 'profileCustomization',
    name: 'Profile Customization',
    description: 'Level of profile customization options',
    category: FeatureCategory.PROFILE,
    isLimitable: false,
    isToggleable: false,
    hasQualitativeLevels: true,
  },
  {
    id: 'badges',
    name: 'Badges',
    description: 'Types of badges available',
    category: FeatureCategory.PROFILE,
    isLimitable: false,
    isToggleable: false,
    hasQualitativeLevels: true,
  },
  {
    id: 'leaderboardParticipation',
    name: 'Leaderboard Participation',
    description: 'Level of participation in leaderboards',
    category: FeatureCategory.PROFILE,
    isLimitable: false,
    isToggleable: false,
    hasQualitativeLevels: true,
  },

  // General Features
  {
    id: 'ads',
    name: 'Advertisements',
    description: 'Whether advertisements are shown',
    category: FeatureCategory.GENERAL,
    isLimitable: false,
    isToggleable: true,
    hasQualitativeLevels: false,
  },
  {
    id: 'customerSupport',
    name: 'Customer Support',
    description: 'Level of customer support available',
    category: FeatureCategory.GENERAL,
    isLimitable: false,
    isToggleable: false,
    hasQualitativeLevels: true,
  },
  {
    id: 'offlineAccess',
    name: 'Offline Access',
    description: 'Level of offline access to app features',
    category: FeatureCategory.GENERAL,
    isLimitable: false,
    isToggleable: false,
    hasQualitativeLevels: true,
  },
];

/**
 * Get a feature by its ID
 * @param featureId The feature ID
 * @returns The feature or undefined if not found
 */
export function getFeatureById(featureId: string): Feature | undefined {
  return FEATURES.find(feature => feature.id === featureId);
}

/**
 * Get features by category
 * @param category The feature category
 * @returns Array of features in the specified category
 */
export function getFeaturesByCategory(category: FeatureCategory): Feature[] {
  return FEATURES.filter(feature => feature.category === category);
}

/**
 * Get all limitable features
 * @returns Array of features that have usage limits
 */
export function getLimitableFeatures(): Feature[] {
  return FEATURES.filter(feature => feature.isLimitable);
}

/**
 * Get all toggleable features
 * @returns Array of features that can be toggled on/off
 */
export function getToggleableFeatures(): Feature[] {
  return FEATURES.filter(feature => feature.isToggleable);
}

/**
 * Get all features with qualitative levels
 * @returns Array of features that have qualitative levels
 */
export function getFeaturesWithQualitativeLevels(): Feature[] {
  return FEATURES.filter(feature => feature.hasQualitativeLevels);
}
