/**
 * AI Service Interfaces
 *
 * This file defines the interfaces for the AI service, including:
 * - Request and response interfaces for AI operations
 * - User preference interfaces for AI models and tones
 * - Model configuration interfaces
 */

import {
  AiModelName,
  AiModelTier,
  PhilosophicalTone,
  ResponseLength,
  ToneBlendConfig,
} from '../enums/ai_models';

/**
 * User AI preferences saved in the user profile
 */
export interface UserAiPreferences {
  preferredTone: PhilosophicalTone;
  secondaryTone?: PhilosophicalTone;
  blendRatio?: number;
  preferredResponseLength: ResponseLength;
  preferredModel?: AiModelName;
  aiHistoryEnabled: boolean;
  customPromptTemplates?: Record<string, string>;
  savedConversations?: string[];
}

/**
 * AI model configuration
 */
export interface AiModelConfig {
  name: AiModelName;
  provider: string;
  tier: AiModelTier;
  maxTokens: number;
  costPerToken: number;
  features: string[];
  supportedTones: PhilosophicalTone[];
}

/**
 * AI model selection request
 */
export interface ModelSelectionRequest {
  userId: string;
  userTier: AiModelTier;
  featureName: string;
  tonePreference?: PhilosophicalTone;
  secondaryTone?: PhilosophicalTone;
  responseLength?: ResponseLength;
  contextSize?: number;
  customModelOverride?: AiModelName;
}

/**
 * AI model selection response
 */
export interface ModelSelectionResponse {
  selectedModel: AiModelName;
  fallbackModels: AiModelName[];
  supportedTones: PhilosophicalTone[];
  maxTokens: number;
  tier: AiModelTier;
  isTierLimited: boolean;
}

/**
 * Base AI Request
 */
export interface BaseAiRequest {
  userId: string;
  sessionId: string;
  prompt: string;
  model?: AiModelName;
  temperature?: number;
  maxTokens?: number;
  toneConfig?: ToneBlendConfig;
  stream?: boolean;
}

/**
 * AI Chat Request (extends BaseAiRequest)
 */
export interface AiChatRequest extends BaseAiRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  conversationId?: string;
  contextItems?: Array<{
    type: string;
    content: string;
    metadata?: Record<string, any>;
  }>;
}

/**
 * AI Response
 */
export interface AiResponse {
  content: string;
  model: AiModelName;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost: number;
  };
  metadata?: {
    toneUsed?: PhilosophicalTone;
    citations?: Array<{
      text: string;
      source: string;
      url?: string;
    }>;
    concepts?: string[];
    finishReason?: string;
  };
}
