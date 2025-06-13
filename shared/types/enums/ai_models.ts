/**
 * AI model enums and types
 *
 * This file defines the enums and types for AI models, tiers, and tone settings
 * used by the AI Router to dynamically select and configure models.
 */

export enum AiModelTier {
  FREE = 'free', // Basic models for free users
  PREMIUM = 'premium', // Enhanced models for premium users
  PRO = 'pro', // Advanced models for pro users
}

export enum AiModelProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  COHERE = 'cohere',
  LLAMA = 'llama',
  MISTRAL = 'mistral',
  CUSTOM = 'custom',
}

export enum AiModelName {
  // Free tier models
  GPT_3_5_TURBO = 'gpt-3.5-turbo',
  LLAMA_2_7B = 'llama-2-7b',
  MISTRAL_7B = 'mistral-7b',

  // Premium tier models
  GPT_4 = 'gpt-4',
  CLAUDE_2 = 'claude-2',
  LLAMA_2_13B = 'llama-2-13b',

  // Pro tier models (most capable)
  GPT_4_TURBO = 'gpt-4-turbo',
  GPT_4_32K = 'gpt-4-32k',
  CLAUDE_OPUS = 'claude-opus',
  LLAMA_2_70B = 'llama-2-70b',
  COMMAND_R = 'command-r',
}

export enum PhilosophicalTone {
  STOIC = 'stoic', // Calm, rational, focused on virtue ethics
  EXISTENTIALIST = 'existentialist', // Deep, questioning, focused on meaning
  ANALYTICAL = 'analytical', // Logical, precise, focused on clarity
  PRAGMATIC = 'pragmatic', // Practical, solutions-oriented
  SOCRATIC = 'socratic', // Questioning, dialectical
  MYSTICAL = 'mystical', // Spiritual, transcendent
  POSTMODERN = 'postmodern', // Deconstructive, skeptical of grand narratives
  NATURALISTIC = 'naturalistic', // Science-based, evolutionary perspective
}

export enum ResponseLength {
  CONCISE = 'concise', // Brief responses
  BALANCED = 'balanced', // Moderate length
  DETAILED = 'detailed', // In-depth explanations
  EXPANSIVE = 'expansive', // Comprehensive analysis
}

// Interface for model capabilities
export interface ModelCapability {
  maxTokens: number;
  supportsTone: boolean;
  supportsStreaming: boolean;
  supportsAttachments: boolean;
  supportsCitations: boolean;
  supportsCustomization: boolean;
}

// Interface for tone blend configuration
export interface ToneBlendConfig {
  primaryTone: PhilosophicalTone;
  secondaryTone?: PhilosophicalTone;
  blendRatio?: number; // 0-1, where 0.5 is equal blend
  responseLength: ResponseLength;
  isCustomized: boolean;
}
