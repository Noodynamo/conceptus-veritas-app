"""
Model Service

This service handles the interaction with AI models for generating responses.
It works with the AI Router to select appropriate models and the Prompt Service
to format prompts according to user preferences.
"""

import logging
import os
from typing import Dict, List, Optional, Any, Union
from uuid import UUID, uuid4

from fastapi import Depends, HTTPException, status
import openai
from openai import OpenAI
import anthropic
from anthropic import Anthropic

from backend.src.schemas.ai_router import (
    AiModelName,
    AiModelProvider,
    AiModelTier,
    PhilosophicalTone,
    ResponseLength,
    ToneBlendConfig,
    AiChatRequest,
    AiResponse,
    UsageInfo,
    AiResponseMetadata
)
from backend.src.services.ai.model_services.ai_router import AiRouterService, ai_router_service
from backend.src.services.ai.prompt_services.prompt_service import PromptService, prompt_service
from backend.src.services.analytics.analytics_service import AnalyticsService


logger = logging.getLogger(__name__)


class ModelService:
    """
    Service for interacting with AI models to generate responses.
    """

    def __init__(
        self,
        ai_router: AiRouterService = Depends(ai_router_service),
        prompt_service: PromptService = Depends(prompt_service),
        analytics: Optional[AnalyticsService] = None
    ):
        self.ai_router = ai_router
        self.prompt_service = prompt_service
        self.analytics = analytics

        # Initialize model clients
        self.openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", ""))
        self.anthropic_client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY", ""))

        # Track if clients are properly configured
        self.openai_available = bool(os.getenv("OPENAI_API_KEY", ""))
        self.anthropic_available = bool(os.getenv("ANTHROPIC_API_KEY", ""))

        if not self.openai_available:
            logger.warning("OpenAI API key not set, OpenAI models will not be available")
        if not self.anthropic_available:
            logger.warning("Anthropic API key not set, Anthropic models will not be available")

    async def generate_chat_response(self, request: AiChatRequest) -> AiResponse:
        """
        Generate a response using the appropriate AI model.

        Args:
            request: The AI chat request

        Returns:
            AiResponse: The AI response
        """
        model = request.model

        # If no model specified, use the router to select one
        if not model:
            # Determine the feature from the request
            # This is a simplification - in a real system, you'd have a more robust way to determine the feature
            feature_name = "basic_ask"  # Default
            if "feature" in request and request["feature"]:
                feature_name = request["feature"]

            # Extract user tier from request or get from subscription service
            user_tier = AiModelTier.FREE  # Default to free
            # In a real implementation, you'd get this from the subscription service

            # Create model selection request
            selection_request = {
                "user_id": request.user_id,
                "user_tier": user_tier,
                "feature_name": feature_name
            }

            # Add tone preferences if provided
            if request.tone_config:
                selection_request["tone_preference"] = request.tone_config.primary_tone
                selection_request["secondary_tone"] = request.tone_config.secondary_tone

            # Select model
            model_selection = self.ai_router.select_model(selection_request)
            model = model_selection.selected_model

        # Get provider for the selected model
        provider = self._get_provider_for_model(model)

        # Generate response based on provider
        if provider == AiModelProvider.OPENAI:
            return await self._generate_openai_response(request, model)
        elif provider == AiModelProvider.ANTHROPIC:
            return await self._generate_anthropic_response(request, model)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported model provider: {provider}"
            )

    async def _generate_openai_response(
        self,
        request: AiChatRequest,
        model: AiModelName
    ) -> AiResponse:
        """
        Generate a response using an OpenAI model.

        Args:
            request: The AI chat request
            model: The OpenAI model to use

        Returns:
            AiResponse: The AI response
        """
        if not self.openai_available:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="OpenAI API is not available"
            )

        try:
            # Convert messages to OpenAI format if needed
            messages = request.messages

            # Set parameters
            params = {
                "model": model.value,
                "messages": messages,
                "temperature": request.temperature if request.temperature is not None else 0.7,
                "stream": request.stream
            }

            if request.max_tokens:
                params["max_tokens"] = request.max_tokens

            # Make API call
            response = self.openai_client.chat.completions.create(**params)

            # Extract content
            content = response.choices[0].message.content

            # Create usage info
            usage = UsageInfo(
                prompt_tokens=response.usage.prompt_tokens,
                completion_tokens=response.usage.completion_tokens,
                total_tokens=response.usage.total_tokens,
                cost=self._calculate_cost(model, response.usage.total_tokens)
            )

            # Create metadata
            metadata = AiResponseMetadata(
                tone_used=request.tone_config.primary_tone if request.tone_config else None,
                finish_reason=response.choices[0].finish_reason
            )

            # Create and return response
            ai_response = AiResponse(
                content=content,
                model=model,
                usage=usage,
                metadata=metadata
            )

            # Track analytics
            if self.analytics:
                self.analytics.track(
                    user_id=str(request.user_id),
                    event="ai_response_generated",
                    properties={
                        "model": model.value,
                        "provider": AiModelProvider.OPENAI.value,
                        "total_tokens": usage.total_tokens,
                        "cost": usage.cost,
                        "feature": request.get("feature", "unknown")
                    }
                )

            return ai_response

        except openai.APIError as e:
            logger.error(f"OpenAI API error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"OpenAI API error: {str(e)}"
            )

    async def _generate_anthropic_response(
        self,
        request: AiChatRequest,
        model: AiModelName
    ) -> AiResponse:
        """
        Generate a response using an Anthropic model.

        Args:
            request: The AI chat request
            model: The Anthropic model to use

        Returns:
            AiResponse: The AI response
        """
        if not self.anthropic_available:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Anthropic API is not available"
            )

        try:
            # Convert messages to Anthropic format
            system_content = None
            messages = []

            for msg in request.messages:
                if msg["role"] == "system":
                    system_content = msg["content"]
                else:
                    messages.append({
                        "role": msg["role"],
                        "content": msg["content"]
                    })

            # Set parameters
            params = {
                "model": model.value,
                "messages": messages,
                "temperature": request.temperature if request.temperature is not None else 0.7,
                "stream": request.stream
            }

            if system_content:
                params["system"] = system_content

            if request.max_tokens:
                params["max_tokens"] = request.max_tokens

            # Make API call
            response = self.anthropic_client.messages.create(**params)

            # Extract content
            content = response.content[0].text

            # Estimate token usage (Anthropic doesn't provide this directly)
            # This is a rough estimate - in production you'd want to use a proper tokenizer
            prompt_tokens = sum(len(msg["content"].split()) * 1.3 for msg in request.messages)
            completion_tokens = len(content.split()) * 1.3
            total_tokens = prompt_tokens + completion_tokens

            # Create usage info
            usage = UsageInfo(
                prompt_tokens=int(prompt_tokens),
                completion_tokens=int(completion_tokens),
                total_tokens=int(total_tokens),
                cost=self._calculate_cost(model, int(total_tokens))
            )

            # Create metadata
            metadata = AiResponseMetadata(
                tone_used=request.tone_config.primary_tone if request.tone_config else None,
                finish_reason=response.stop_reason
            )

            # Create and return response
            ai_response = AiResponse(
                content=content,
                model=model,
                usage=usage,
                metadata=metadata
            )

            # Track analytics
            if self.analytics:
                self.analytics.track(
                    user_id=str(request.user_id),
                    event="ai_response_generated",
                    properties={
                        "model": model.value,
                        "provider": AiModelProvider.ANTHROPIC.value,
                        "estimated_tokens": usage.total_tokens,
                        "cost": usage.cost,
                        "feature": request.get("feature", "unknown")
                    }
                )

            return ai_response

        except anthropic.APIError as e:
            logger.error(f"Anthropic API error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Anthropic API error: {str(e)}"
            )

    def _get_provider_for_model(self, model: AiModelName) -> AiModelProvider:
        """
        Get the provider for a model.

        Args:
            model: The model name

        Returns:
            AiModelProvider: The model provider
        """
        model_config = self.ai_router.model_configs.get(model)
        if not model_config:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unknown model: {model}"
            )

        return model_config.provider

    def _calculate_cost(self, model: AiModelName, total_tokens: int) -> float:
        """
        Calculate the cost for a model and token count.

        Args:
            model: The model name
            total_tokens: The total number of tokens

        Returns:
            float: The cost in USD
        """
        model_config = self.ai_router.model_configs.get(model)
        if not model_config:
            return 0.0

        return model_config.cost_per_token * total_tokens


# Export singleton instance
model_service = ModelService()
