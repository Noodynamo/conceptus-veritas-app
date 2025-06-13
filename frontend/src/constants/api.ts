/**
 * API Constants
 */

// Base URL for API calls
export const API_BASE_URL = '/api/v1';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH_TOKEN: '/auth/refresh',
  LOGOUT: '/auth/logout',

  // User & Profile
  USER_PROFILE: '/users/me',
  USER_SETTINGS: '/users/me/settings',
  USER_BADGES: '/users/me/badges',

  // Subscription
  SUBSCRIPTION: '/subscriptions/me',
  SUBSCRIPTION_SUMMARY: '/subscriptions/summary',
  SUBSCRIPTION_UPGRADE: '/subscriptions/upgrade',
  SUBSCRIPTION_CANCEL: '/subscriptions/cancel',
  SUBSCRIPTION_FEATURES: '/subscriptions/features',
  SUBSCRIPTION_TIER_LIMITS: '/subscriptions/tier-limits',

  // Feature-specific endpoints
  ASK_QUESTION: '/ai/ask',
  ASK_INTERACTIONS: '/ai/interactions',
  ASK_TONES: '/ask/tones',

  JOURNAL: '/journal',

  QUESTS: '/quests',
  QUESTS_SKILL_TREE: '/quests/skill-tree',
  QUESTS_DAILY: '/quests/daily',

  CONCEPTS: '/concepts',
  EXPLORE_VISUALIZE: '/explore/visualize',

  FORUM_THREADS: '/forum/threads',

  XP: '/xp',
  XP_HISTORY: '/xp/history',
  XP_CHECK_IN: '/xp/check-in',
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};
