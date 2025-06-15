/**
 * Subscription Tier Structure
 *
 * This file defines the subscription tier structure, feature allocations, and pricing
 * for the Conceptus Veritas app based on the freemium business model.
 */

import { Feature } from './features';

/**
 * Subscription tier types
 */
export enum TierType {
  FREE = 'free',
  PREMIUM = 'premium',
  PRO = 'pro',
}

/**
 * Platform types for pricing
 */
export enum PlatformType {
  MOBILE = 'mobile',
  WEB = 'web',
}

/**
 * Billing cycle types
 */
export enum BillingCycle {
  MONTHLY = 'monthly',
  ANNUAL = 'annual',
}

/**
 * Interface for tier pricing
 */
export interface TierPricing {
  [PlatformType.MOBILE]: {
    [BillingCycle.MONTHLY]: number;
    [BillingCycle.ANNUAL]: number;
  };
  [PlatformType.WEB]: {
    [BillingCycle.MONTHLY]: number;
    [BillingCycle.ANNUAL]: number;
  };
}

/**
 * Interface for feature limits
 */
export interface FeatureLimit {
  limit: number;
  period: 'day' | 'month' | 'year' | 'unlimited';
}

/**
 * Interface for feature allocation
 */
export interface FeatureAllocation {
  [key: string]: FeatureLimit | boolean | string | string[];
}

/**
 * Interface for subscription tier
 */
export interface SubscriptionTier {
  id: TierType;
  name: string;
  description: string;
  features: FeatureAllocation;
  pricing: TierPricing;
  targetUsers: string;
  valueProposition: string;
  keyBenefits: string[];
}

/**
 * Subscription tiers configuration
 */
export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: TierType.FREE,
    name: 'Free',
    description: 'Begin your philosophical journey with core features and daily guidance',
    targetUsers: 'New users, casual explorers, students',
    valueProposition: 'Begin your philosophical journey with core features and daily guidance',
    keyBenefits: [
      'Full access to core philosophical concepts and exploration tools',
      'Daily AI conversations to explore philosophical ideas',
      'Personal philosophical journal with basic features',
      'Community participation with moderated limits',
      'Wisdom XP system participation for gamification',
    ],
    features: {
      // Ask AI
      dailyQuestions: { limit: 10, period: 'day' },
      philosophicalTones: { limit: 5, period: 'day' },
      responseLength: 'standard',
      insightExpansion: false,
      aiModelQuality: 'standard',
      saveToJournal: { limit: 5, period: 'day' },

      // Journal
      journalEntries: { limit: 5, period: 'day' },
      entryTypes: 'basic',
      mediaAttachments: { limit: 2, period: 'day' },
      conceptTagging: { limit: 3, period: 'day' },
      journalPrompts: 'basic',
      exportOptions: false,

      // Quest
      availableQuests: 'foundational',
      dailyQuests: { limit: 1, period: 'day' },
      questDifficultyLevels: ['beginner', 'intermediate'],
      skillTreeAccess: 'basic',
      questRewardsBonus: 0,

      // Explore
      conceptAccess: 'core',
      visualizationTools: 'basic',
      conceptRelationships: 'primary',
      learningPathways: { limit: 1, period: 'day' },
      createCustomPathways: false,
      connectConcepts: 'view',

      // Forum
      createThreads: { limit: 3, period: 'day' },
      postComments: { limit: 10, period: 'day' },
      upvoteDownvote: { limit: 20, period: 'day' },
      specialForumBadge: false,

      // Profile & Gamification
      wisdomXpEarningBonus: 0,
      streakFreeze: { limit: 1, period: 'month' },
      profileCustomization: 'basic',
      badges: 'common',
      leaderboardParticipation: 'view',

      // General
      ads: true,
      customerSupport: 'community',
      offlineAccess: 'limited',
    },
    pricing: {
      [PlatformType.MOBILE]: {
        [BillingCycle.MONTHLY]: 0,
        [BillingCycle.ANNUAL]: 0,
      },
      [PlatformType.WEB]: {
        [BillingCycle.MONTHLY]: 0,
        [BillingCycle.ANNUAL]: 0,
      },
    },
  },
  {
    id: TierType.PREMIUM,
    name: 'Premium',
    description: 'Deepen your philosophical practice with expanded access and advanced features',
    targetUsers: 'Regular users, enthusiasts, self-improvers',
    valueProposition:
      'Deepen your philosophical practice with expanded access and advanced features',
    keyBenefits: [
      'Significantly higher usage limits across all features',
      'Access to all philosophical tones and conversation styles',
      'Insight expansion for deeper philosophical analysis',
      'Unlimited journaling for comprehensive self-reflection',
      'Enhanced community participation',
      'Priority access to new concepts and features',
    ],
    features: {
      // Ask AI
      dailyQuestions: { limit: 50, period: 'day' },
      philosophicalTones: 'all standard',
      responseLength: 'extended',
      insightExpansion: { limit: 5, period: 'day' },
      aiModelQuality: 'enhanced',
      saveToJournal: { limit: 25, period: 'day' },

      // Journal
      journalEntries: { limit: 0, period: 'unlimited' },
      entryTypes: 'all',
      mediaAttachments: { limit: 5, period: 'day' },
      conceptTagging: { limit: 10, period: 'day' },
      journalPrompts: 'advanced',
      exportOptions: 'basic',

      // Quest
      availableQuests: 'all standard',
      dailyQuests: { limit: 3, period: 'day' },
      questDifficultyLevels: 'all',
      skillTreeAccess: 'full',
      questRewardsBonus: 25,

      // Explore
      conceptAccess: 'all',
      visualizationTools: 'advanced',
      conceptRelationships: 'all',
      learningPathways: { limit: 3, period: 'day' },
      createCustomPathways: false,
      connectConcepts: { limit: 5, period: 'day' },

      // Forum
      createThreads: { limit: 10, period: 'day' },
      postComments: { limit: 30, period: 'day' },
      upvoteDownvote: { limit: 50, period: 'day' },
      specialForumBadge: true,

      // Profile & Gamification
      wisdomXpEarningBonus: 20,
      streakFreeze: { limit: 3, period: 'month' },
      profileCustomization: 'advanced',
      badges: 'all standard',
      leaderboardParticipation: 'participate',

      // General
      ads: false,
      customerSupport: 'priority email',
      offlineAccess: 'enhanced',
    },
    pricing: {
      [PlatformType.MOBILE]: {
        [BillingCycle.MONTHLY]: 7.99,
        [BillingCycle.ANNUAL]: 59.99,
      },
      [PlatformType.WEB]: {
        [BillingCycle.MONTHLY]: 9.99,
        [BillingCycle.ANNUAL]: 79.99,
      },
    },
  },
  {
    id: TierType.PRO,
    name: 'Pro',
    description: 'Experience unlimited philosophical exploration with exclusive features',
    targetUsers: 'Dedicated practitioners, educators, philosophy enthusiasts',
    valueProposition: 'Experience unlimited philosophical exploration with exclusive features',
    keyBenefits: [
      'Unlimited usage across all features',
      'Full access to all current and future philosophical tones',
      'Create and share custom wisdom paths',
      'Advanced AI models for deeper philosophical discourse',
      'Exclusive early access to new features',
      'Community recognition and special badges',
    ],
    features: {
      // Ask AI
      dailyQuestions: { limit: 0, period: 'unlimited' },
      philosophicalTones: 'all plus exclusives',
      responseLength: 'maximum',
      insightExpansion: { limit: 0, period: 'unlimited' },
      aiModelQuality: 'premium',
      saveToJournal: { limit: 0, period: 'unlimited' },

      // Journal
      journalEntries: { limit: 0, period: 'unlimited' },
      entryTypes: 'all plus exclusives',
      mediaAttachments: { limit: 0, period: 'unlimited' },
      conceptTagging: { limit: 0, period: 'unlimited' },
      journalPrompts: 'premium',
      exportOptions: 'advanced',

      // Quest
      availableQuests: 'all plus exclusives',
      dailyQuests: { limit: 5, period: 'day' },
      questDifficultyLevels: 'all plus mastery',
      skillTreeAccess: 'full plus exclusive',
      questRewardsBonus: 50,

      // Explore
      conceptAccess: 'all plus early access',
      visualizationTools: 'premium',
      conceptRelationships: 'all plus custom',
      learningPathways: { limit: 0, period: 'unlimited' },
      createCustomPathways: true,
      connectConcepts: { limit: 0, period: 'unlimited' },

      // Forum
      createThreads: { limit: 0, period: 'unlimited' },
      postComments: { limit: 0, period: 'unlimited' },
      upvoteDownvote: { limit: 0, period: 'unlimited' },
      specialForumBadge: 'premium',

      // Profile & Gamification
      wisdomXpEarningBonus: 40,
      streakFreeze: { limit: 7, period: 'month' },
      profileCustomization: 'premium',
      badges: 'all plus exclusives',
      leaderboardParticipation: 'highlighted',

      // General
      ads: false,
      customerSupport: 'priority live',
      offlineAccess: 'comprehensive',
    },
    pricing: {
      [PlatformType.MOBILE]: {
        [BillingCycle.MONTHLY]: 14.99,
        [BillingCycle.ANNUAL]: 119.99,
      },
      [PlatformType.WEB]: {
        [BillingCycle.MONTHLY]: 19.99,
        [BillingCycle.ANNUAL]: 159.99,
      },
    },
  },
];

/**
 * Special offer types
 */
export enum SpecialOfferType {
  STUDENT = 'student',
  EDUCATOR = 'educator',
  FOUNDING_MEMBER = 'founding_member',
  GROUP = 'group',
}

/**
 * Interface for special offers
 */
export interface SpecialOffer {
  id: SpecialOfferType;
  name: string;
  description: string;
  discountPercentage: number;
  applicableTiers: TierType[];
  requiresVerification: boolean;
}

/**
 * Special offers configuration
 */
export const SPECIAL_OFFERS: SpecialOffer[] = [
  {
    id: SpecialOfferType.STUDENT,
    name: 'Student Discount',
    description: '20% off Premium and Pro tiers with verified student status',
    discountPercentage: 20,
    applicableTiers: [TierType.PREMIUM, TierType.PRO],
    requiresVerification: true,
  },
  {
    id: SpecialOfferType.EDUCATOR,
    name: 'Educator Discount',
    description: '25% off Pro tier with verified educator status',
    discountPercentage: 25,
    applicableTiers: [TierType.PRO],
    requiresVerification: true,
  },
  {
    id: SpecialOfferType.FOUNDING_MEMBER,
    name: 'Founding Member',
    description: 'Early adopters who join during the first 3 months receive lifetime 15% discount',
    discountPercentage: 15,
    applicableTiers: [TierType.PREMIUM, TierType.PRO],
    requiresVerification: false,
  },
  {
    id: SpecialOfferType.GROUP,
    name: 'Group/Institutional',
    description: 'Custom pricing available for educational institutions and philosophy groups',
    discountPercentage: 0, // Custom pricing
    applicableTiers: [TierType.PREMIUM, TierType.PRO],
    requiresVerification: true,
  },
];

/**
 * Get tier by ID
 * @param tierId The tier ID
 * @returns The subscription tier or undefined if not found
 */
export function getTierById(tierId: TierType): SubscriptionTier | undefined {
  return SUBSCRIPTION_TIERS.find(tier => tier.id === tierId);
}

/**
 * Calculate the price for a given tier, platform, and billing cycle
 * @param tierId The tier ID
 * @param platform The platform type
 * @param billingCycle The billing cycle
 * @param specialOfferId Optional special offer ID
 * @returns The calculated price
 */
export function calculatePrice(
  tierId: TierType,
  platform: PlatformType,
  billingCycle: BillingCycle,
  specialOfferId?: SpecialOfferType
): number {
  const tier = getTierById(tierId);
  if (!tier) {
    return 0;
  }

  let price = tier.pricing[platform][billingCycle];

  // Apply special offer discount if applicable
  if (specialOfferId) {
    const offer = SPECIAL_OFFERS.find(o => o.id === specialOfferId);
    if (offer && offer.applicableTiers.includes(tierId)) {
      price = price * (1 - offer.discountPercentage / 100);
    }
  }

  return price;
}

/**
 * Check if a user has access to a specific feature based on their tier
 * @param tierId The user's tier ID
 * @param featureKey The feature key to check
 * @returns True if the user has access to the feature, false otherwise
 */
export function hasFeatureAccess(tierId: TierType, featureKey: string): boolean {
  const tier = getTierById(tierId);
  if (!tier || !tier.features[featureKey]) {
    return false;
  }

  const feature = tier.features[featureKey];

  // If feature is a boolean, return it directly
  if (typeof feature === 'boolean') {
    return feature;
  }

  // If feature has unlimited period, user has access
  if (typeof feature === 'object' && 'period' in feature && feature.period === 'unlimited') {
    return true;
  }

  // For all other cases, user has some form of access (with potential limits)
  return true;
}

/**
 * Get the usage limit for a specific feature based on user's tier
 * @param tierId The user's tier ID
 * @param featureKey The feature key to check
 * @returns The usage limit or undefined if no limit exists
 */
export function getFeatureLimit(tierId: TierType, featureKey: string): FeatureLimit | undefined {
  const tier = getTierById(tierId);
  if (!tier || !tier.features[featureKey]) {
    return undefined;
  }

  const feature = tier.features[featureKey];

  // Return limit only if feature has a limit property
  if (typeof feature === 'object' && 'limit' in feature) {
    return feature as FeatureLimit;
  }

  return undefined;
}

/**
 * Check if a user has reached their usage limit for a specific feature
 * @param tierId The user's tier ID
 * @param featureKey The feature key to check
 * @param currentUsage The current usage count
 * @returns True if the user has reached their limit, false otherwise
 */
export function hasReachedFeatureLimit(
  tierId: TierType,
  featureKey: string,
  currentUsage: number
): boolean {
  const limit = getFeatureLimit(tierId, featureKey);

  // If no limit exists or period is unlimited, user hasn't reached limit
  if (!limit || limit.period === 'unlimited' || limit.limit === 0) {
    return false;
  }

  // Check if current usage has reached or exceeded the limit
  return currentUsage >= limit.limit;
}

/**
 * Get upgrade suggestions when a user hits a feature limit
 * @param currentTierId The user's current tier ID
 * @param featureKey The feature key that hit a limit
 * @returns An array of suggested tiers to upgrade to
 */
export function getUpgradeSuggestions(
  currentTierId: TierType,
  featureKey: string
): SubscriptionTier[] {
  // If user is already on the highest tier, no upgrade suggestions
  if (currentTierId === TierType.PRO) {
    return [];
  }

  // Get current tier index
  const currentTierIndex = SUBSCRIPTION_TIERS.findIndex(tier => tier.id === currentTierId);
  if (currentTierIndex === -1) {
    return [];
  }

  // Return tiers that have better access to the feature
  return SUBSCRIPTION_TIERS.slice(currentTierIndex + 1).filter(tier => {
    const currentFeature = SUBSCRIPTION_TIERS[currentTierIndex].features[featureKey];
    const upgradedFeature = tier.features[featureKey];

    // If feature doesn't exist in either tier, no upgrade benefit
    if (!currentFeature || !upgradedFeature) {
      return false;
    }

    // If current feature is boolean false and upgraded is true, suggest upgrade
    if (typeof currentFeature === 'boolean' && typeof upgradedFeature === 'boolean') {
      return !currentFeature && upgradedFeature;
    }

    // If both have limits, suggest upgrade if the new limit is higher
    if (
      typeof currentFeature === 'object' &&
      'limit' in currentFeature &&
      typeof upgradedFeature === 'object' &&
      'limit' in upgradedFeature
    ) {
      // If upgraded tier has unlimited period, definitely suggest
      if (upgradedFeature.period === 'unlimited') {
        return true;
      }

      // If both have the same period, suggest if limit is higher
      if (currentFeature.period === upgradedFeature.period) {
        return upgradedFeature.limit > currentFeature.limit;
      }
    }

    // For other cases (like string values), assume the higher tier is better
    return true;
  });
}
