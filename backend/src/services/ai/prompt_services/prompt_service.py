"""
Prompt Service

This service handles the generation and management of prompts for AI models.
It works with the AI Router to generate appropriate prompts based on the tone,
model, and other user preferences.
"""

import logging
from typing import Dict, List, Optional
from uuid import UUID

from fastapi import Depends

from backend.src.schemas.ai_router import (
    PhilosophicalTone,
    ResponseLength,
    ToneBlendConfig
)
from backend.src.services.ai.model_services.ai_router import AiRouterService, ai_router_service


logger = logging.getLogger(__name__)

# Base system prompt for the philosophical sage
SAGE_BASE_PROMPT = """
You are a philosophical sage, an AI designed to offer profound insights and guidance on philosophical topics.
Your responses should be thoughtful, nuanced, and rooted in philosophical traditions.

Important guidelines:
1. Provide balanced perspectives from different philosophical traditions when appropriate
2. Connect abstract philosophical ideas to practical life applications
3. Encourage critical thinking rather than presenting your views as absolute truth
4. Acknowledge the limitations of philosophical approaches when relevant
5. Use clear language while maintaining philosophical depth
6. Reference specific philosophers or schools of thought when appropriate
7. Ask thoughtful questions to deepen the inquiry when helpful
"""

# Domain-specific prompt modifiers
DOMAIN_PROMPTS = {
    "ethics": """
    When addressing ethical questions:
    - Consider both consequentialist and deontological perspectives
    - Acknowledge cultural and historical context of ethical frameworks
    - Highlight practical ethical considerations for everyday decisions
    - Discuss the relationship between ethics and human flourishing
    """,

    "metaphysics": """
    When addressing metaphysical questions:
    - Consider both materialist and idealist perspectives
    - Acknowledge the limits of human knowledge on ultimate reality
    - Connect abstract metaphysical concepts to lived experience
    - Explore how different conceptions of reality influence worldviews
    """,

    "epistemology": """
    When addressing questions about knowledge:
    - Explore both rationalist and empiricist approaches
    - Discuss the reliability and limitations of different ways of knowing
    - Consider the role of skepticism in critical thinking
    - Relate epistemological concepts to practical knowledge-seeking
    """,

    "meaning": """
    When addressing questions about meaning and purpose:
    - Consider both religious/spiritual and secular perspectives
    - Discuss existentialist approaches to creating meaning
    - Explore the relationship between meaning and human happiness
    - Acknowledge the personal nature of meaning while offering philosophical frameworks
    """
}


class PromptService:
    """
    Service for generating and managing prompts for AI models.
    """

    def __init__(self, ai_router: AiRouterService = Depends()):
        self.ai_router = ai_router

    def generate_system_prompt(
        self,
        tone_config: ToneBlendConfig,
        domain: Optional[str] = None,
        context_items: Optional[List[Dict]] = None
    ) -> str:
        """
        Generate a system prompt with the appropriate tone and domain guidance.

        Args:
            tone_config: Configuration for the philosophical tone
            domain: Optional domain specialization (ethics, metaphysics, etc.)
            context_items: Optional additional context items to include

        Returns:
            str: The generated system prompt
        """
        # Get tone instructions from AI Router
        tone_instructions = self.ai_router.get_tone_prompt_template(tone_config)

        # Build the base prompt
        prompt = f"{SAGE_BASE_PROMPT}\n\n{tone_instructions}"

        # Add domain-specific guidance if provided
        if domain and domain in DOMAIN_PROMPTS:
            prompt += f"\n\n{DOMAIN_PROMPTS[domain]}"

        # Add any additional context
        if context_items:
            context_str = "\n\nAdditional context to consider:\n"
            for item in context_items:
                if "type" in item and "content" in item:
                    context_str += f"- {item['type']}: {item['content']}\n"
            prompt += context_str

        return prompt

    def create_chat_prompt(
        self,
        user_message: str,
        tone_config: ToneBlendConfig,
        domain: Optional[str] = None,
        conversation_history: Optional[List[Dict]] = None,
        context_items: Optional[List[Dict]] = None
    ) -> List[Dict]:
        """
        Create a complete chat prompt with system, user, and assistant messages.

        Args:
            user_message: The user's message
            tone_config: Configuration for the philosophical tone
            domain: Optional domain specialization
            conversation_history: Optional conversation history
            context_items: Optional additional context items

        Returns:
            List[Dict]: The formatted chat messages
        """
        # Generate system prompt
        system_prompt = self.generate_system_prompt(tone_config, domain, context_items)

        # Initialize messages with system prompt
        messages = [{"role": "system", "content": system_prompt}]

        # Add conversation history if provided
        if conversation_history:
            messages.extend(conversation_history)

        # Add the current user message
        messages.append({"role": "user", "content": user_message})

        return messages

    def generate_specialized_prompt(
        self,
        prompt_type: str,
        user_input: str,
        tone_config: ToneBlendConfig
    ) -> str:
        """
        Generate a specialized prompt for specific use cases.

        Args:
            prompt_type: The type of specialized prompt (e.g., "journal_reflection", "concept_exploration")
            user_input: The user's input
            tone_config: Configuration for the philosophical tone

        Returns:
            str: The specialized prompt
        """
        # Get tone instructions from AI Router
        tone_instructions = self.ai_router.get_tone_prompt_template(tone_config)

        # Specialized prompt templates
        if prompt_type == "journal_reflection":
            return f"""
            As a philosophical guide, help the user reflect more deeply on their journal entry.

            {tone_instructions}

            Offer philosophical perspectives that might deepen their understanding, suggest connections
            to philosophical concepts, and pose thoughtful questions that could lead to further insight.

            Focus on depth rather than breadth, and avoid generic advice. Instead, engage directly with
            the specific content and themes in their entry.

            User's journal entry:
            {user_input}
            """

        elif prompt_type == "concept_exploration":
            return f"""
            As a philosophical guide, help the user explore this philosophical concept in depth.

            {tone_instructions}

            Provide an analysis that includes:
            1. The core meaning and significance of the concept
            2. Historical development and key thinkers associated with it
            3. Different interpretations or schools of thought
            4. Practical implications and applications
            5. Connections to related philosophical ideas

            Concept to explore:
            {user_input}
            """

        elif prompt_type == "ethical_dilemma":
            return f"""
            As a philosophical guide, help the user navigate this ethical dilemma.

            {tone_instructions}

            Analyze the situation from multiple ethical frameworks (e.g., virtue ethics,
            consequentialism, deontology). Avoid giving simplistic answers or direct advice.
            Instead, provide philosophical tools for thinking through the dilemma.

            Present different perspectives, clarify values at stake, and help the user
            develop their own reasoned approach.

            Ethical dilemma:
            {user_input}
            """

        else:
            # Default general prompt
            return f"""
            As a philosophical guide, respond to the user's query with wisdom and insight.

            {tone_instructions}

            User's query:
            {user_input}
            """


# Export singleton instance
prompt_service = PromptService(ai_router=ai_router_service)
