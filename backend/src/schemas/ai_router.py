"""
Pydantic schemas for the AI router system.

This module defines the Pydantic schemas for AI model selection and routing.
"""

from enum import Enum
from typing import List, Optional, Dict, Any
from uuid import UUID

from pydantic import BaseModel, Field


# Enums
class AiModelTier(str, Enum):
    """Subscription tier levels for AI model access."""
    FREE = "free"
    PREMIUM = "premium"
    PRO = "pro"


class AiModelProvider(str, Enum):
    """AI model providers."""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    COHERE = "cohere"
    LLAMA = "llama"
    MISTRAL = "mistral"
    CUSTOM = "custom"


class AiModelName(str, Enum):
    """Supported AI model names."""
    # Free tier models
    GPT_3_5_TURBO = "gpt-3.5-turbo"
    LLAMA_2_7B = "llama-2-7b"
    MISTRAL_7B = "mistral-7b"

    # Premium tier models
    GPT_4 = "gpt-4"
    CLAUDE_2 = "claude-2"
    LLAMA_2_13B = "llama-2-13b"

    # Pro tier models
    GPT_4_TURBO = "gpt-4-turbo"
    GPT_4_32K = "gpt-4-32k"
    CLAUDE_OPUS = "claude-opus"
    LLAMA_2_70B = "llama-2-70b"
    COMMAND_R = "command-r"


class PhilosophicalTone(str, Enum):
    """Philosophical tones for AI responses."""
    STOIC = "stoic"
    EXISTENTIALIST = "existentialist"
    ANALYTICAL = "analytical"
    PRAGMATIC = "pragmatic"
    SOCRATIC = "socratic"
    MYSTICAL = "mystical"
    POSTMODERN = "postmodern"
    NATURALISTIC = "naturalistic"


class ResponseLength(str, Enum):
    """Response length preferences."""
    CONCISE = "concise"
    BALANCED = "balanced"
    DETAILED = "detailed"
    EXPANSIVE = "expansive"


# Base schemas
class ModelCapability(BaseModel):
    """Model capability specifications."""
    max_tokens: int = Field(..., description="Maximum context window size")
    supports_tone: bool = Field(True, description="Whether the model supports tone customization")
    supports_streaming: bool = Field(True, description="Whether the model supports streaming responses")
    supports_attachments: bool = Field(False, description="Whether the model supports file attachments")
    supports_citations: bool = Field(False, description="Whether the model supports citations")
    supports_customization: bool = Field(False, description="Whether the model supports fine-tuning")


class ToneBlendConfig(BaseModel):
    """Configuration for tone blending in responses."""
    primary_tone: PhilosophicalTone = Field(..., description="Primary philosophical tone")
    secondary_tone: Optional[PhilosophicalTone] = Field(None, description="Secondary philosophical tone to blend")
    blend_ratio: Optional[float] = Field(0.5, description="Blend ratio between primary and secondary tone (0-1)")
    response_length: ResponseLength = Field(ResponseLength.BALANCED, description="Preferred response length")
    is_customized: bool = Field(False, description="Whether this is a custom tone configuration")


class AiModelConfig(BaseModel):
    """AI model configuration."""
    name: AiModelName = Field(..., description="Model name")
    provider: AiModelProvider = Field(..., description="Model provider")
    tier: AiModelTier = Field(..., description="Subscription tier required")
    max_tokens: int = Field(..., description="Maximum context window size")
    cost_per_token: float = Field(..., description="Cost per token in USD")
    features: List[str] = Field(default_factory=list, description="Supported features")
    supported_tones: List[PhilosophicalTone] = Field(default_factory=list, description="Supported tones")


# Request/Response schemas
class ModelSelectionRequest(BaseModel):
    """Request for AI model selection."""
    user_id: UUID = Field(..., description="User ID")
    user_tier: AiModelTier = Field(..., description="User's subscription tier")
    feature_name: str = Field(..., description="Feature being accessed")
    tone_preference: Optional[PhilosophicalTone] = Field(None, description="Preferred philosophical tone")
    secondary_tone: Optional[PhilosophicalTone] = Field(None, description="Secondary tone for blending")
    response_length: Optional[ResponseLength] = Field(None, description="Preferred response length")
    context_size: Optional[int] = Field(None, description="Required context size in tokens")
    custom_model_override: Optional[AiModelName] = Field(None, description="Specific model request override")


class ModelSelectionResponse(BaseModel):
    """Response from AI model selection."""
    selected_model: AiModelName = Field(..., description="Selected AI model")
    fallback_models: List[AiModelName] = Field(default_factory=list, description="Fallback models if primary fails")
    supported_tones: List[PhilosophicalTone] = Field(default_factory=list, description="Supported tones for this model")
    max_tokens: int = Field(..., description="Maximum tokens for this model")
    tier: AiModelTier = Field(..., description="Tier of the selected model")
    is_tier_limited: bool = Field(False, description="Whether user is limited by their tier")


class MessageContent(BaseModel):
    """Content of a message in a conversation."""
    role: str = Field(..., description="Role (system, user, assistant)")
    content: str = Field(..., description="Message content")


class ContextItem(BaseModel):
    """Context item for AI requests."""
    type: str = Field(..., description="Context type (e.g., 'concept', 'journal_entry')")
    content: str = Field(..., description="Content text")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")


class BaseAiRequest(BaseModel):
    """Base schema for AI requests."""
    user_id: UUID = Field(..., description="User ID")
    session_id: str = Field(..., description="Session ID")
    prompt: str = Field(..., description="Prompt text")
    model: Optional[AiModelName] = Field(None, description="Requested model (optional)")
    temperature: Optional[float] = Field(0.7, description="Temperature for response generation")
    max_tokens: Optional[int] = Field(None, description="Maximum tokens to generate")
    tone_config: Optional[ToneBlendConfig] = Field(None, description="Tone configuration")
    stream: bool = Field(False, description="Whether to stream the response")


class AiChatRequest(BaseAiRequest):
    """Chat-based AI request."""
    messages: List[MessageContent] = Field(..., description="Conversation messages")
    conversation_id: Optional[str] = Field(None, description="Conversation ID for continuing chats")
    context_items: Optional[List[ContextItem]] = Field(None, description="Additional context items")


class CitationInfo(BaseModel):
    """Citation information."""
    text: str = Field(..., description="Cited text")
    source: str = Field(..., description="Source of the citation")
    url: Optional[str] = Field(None, description="URL for the source")


class UsageInfo(BaseModel):
    """Token usage information."""
    prompt_tokens: int = Field(..., description="Tokens used in the prompt")
    completion_tokens: int = Field(..., description="Tokens used in the completion")
    total_tokens: int = Field(..., description="Total tokens used")
    cost: float = Field(..., description="Cost in USD")


class AiResponseMetadata(BaseModel):
    """Metadata for AI responses."""
    tone_used: Optional[PhilosophicalTone] = Field(None, description="Tone used in the response")
    citations: Optional[List[CitationInfo]] = Field(None, description="Citations in the response")
    concepts: Optional[List[str]] = Field(None, description="Concepts mentioned in the response")
    finish_reason: Optional[str] = Field(None, description="Reason for finishing (e.g., 'stop', 'length')")


class AiResponse(BaseModel):
    """AI response schema."""
    content: str = Field(..., description="Response content")
    model: AiModelName = Field(..., description="Model used for the response")
    usage: UsageInfo = Field(..., description="Token usage information")
    metadata: Optional[AiResponseMetadata] = Field(None, description="Response metadata")


# User preference schemas
class UserAiPreferences(BaseModel):
    """User preferences for AI interactions."""
    preferred_tone: PhilosophicalTone = Field(PhilosophicalTone.ANALYTICAL, description="Preferred philosophical tone")
    secondary_tone: Optional[PhilosophicalTone] = Field(None, description="Secondary tone for blending")
    blend_ratio: Optional[float] = Field(0.5, description="Blend ratio between tones")
    preferred_response_length: ResponseLength = Field(ResponseLength.BALANCED, description="Preferred response length")
    preferred_model: Optional[AiModelName] = Field(None, description="Preferred AI model")
    ai_history_enabled: bool = Field(True, description="Whether to store AI conversation history")
    custom_prompt_templates: Optional[Dict[str, str]] = Field(None, description="Custom prompt templates")
    saved_conversations: Optional[List[str]] = Field(None, description="Saved conversation IDs")
