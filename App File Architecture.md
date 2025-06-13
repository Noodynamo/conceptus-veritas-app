# Setarcos App File Architecture

This document outlines the complete file architecture for the Setarcos philosophy app, designed to be integrated with Cursor for optimal development workflow.

## Project Structure Overview

```
setarcos/
├── frontend/                  # React Native mobile app
│   ├── src/                   # Source code
│   ├── assets/                # Static assets
│   ├── __tests__/             # Test files
│   └── ...                    # Configuration files
├── backend/                   # FastAPI backend
│   ├── src/                   # Source code
│   ├── tests/                 # Test files
│   └── ...                    # Configuration files
├── shared/                    # Shared code and types
│   ├── types/                 # TypeScript type definitions
│   └── constants/             # Shared constants
└── docs/                      # Documentation
    ├── api/                   # API documentation
    ├── architecture/          # Architecture documentation
    └── features/              # Feature documentation
```

## Frontend Structure

```
frontend/
├── android/                   # Android-specific files
├── ios/                       # iOS-specific files
├── assets/
│   ├── fonts/                 # Custom fonts
│   ├── images/                # Image assets
│   │   ├── concepts/          # Concept-related images
│   │   ├── tones/             # Philosophical tone icons
│   │   └── ui/                # UI-related images
│   └── animations/            # Lottie animations
├── src/
│   ├── app.tsx               # App entry point
│   ├── navigation/           # Navigation configuration
│   │   ├── AppNavigator.tsx  # Main app navigator
│   │   ├── AuthNavigator.tsx # Authentication navigator
│   │   └── TabNavigator.tsx  # Main tab navigator
│   ├── screens/              # Screen components
│   │   ├── ask/              # Ask feature screens
│   │   ├── explore/          # Explore feature screens
│   │   ├── quest/            # Quest feature screens
│   │   ├── journal/          # Journal feature screens
│   │   ├── forum/            # Forum feature screens
│   │   ├── profile/          # Profile feature screens
│   │   └── auth/             # Authentication screens
│   ├── components/           # Shared components
│   │   ├── common/           # Common UI components
│   │   ├── ask/              # Ask feature components
│   │   ├── explore/          # Explore feature components
│   │   ├── quest/            # Quest feature components
│   │   ├── journal/          # Journal feature components
│   │   ├── forum/            # Forum feature components
│   │   └── profile/          # Profile feature components
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.ts        # Authentication hook
│   │   ├── useApi.ts         # API hook
│   │   └── feature-specific/ # Feature-specific hooks
│   ├── context/              # React context providers
│   │   ├── AuthContext.tsx   # Authentication context
│   │   ├── ThemeContext.tsx  # Theme context
│   │   └── feature-specific/ # Feature-specific contexts
│   ├── services/             # Service layer
│   │   ├── api/              # API service
│   │   ├── storage/          # Local storage service
│   │   └── feature-specific/ # Feature-specific services
│   ├── store/                # State management
│   │   ├── index.ts          # Store configuration
│   │   └── slices/           # Feature-specific slices
│   ├── utils/                # Utility functions
│   │   ├── formatting.ts     # Formatting utilities
│   │   ├── validation.ts     # Validation utilities
│   │   └── feature-specific/ # Feature-specific utilities
│   ├── types/                # TypeScript type definitions
│   │   ├── api.ts            # API types
│   │   └── feature-specific/ # Feature-specific types
│   ├── constants/            # Constants and configuration
│   │   ├── api.ts            # API constants
│   │   ├── theme.ts          # Theme constants
│   │   └── feature-specific/ # Feature-specific constants
│   └── i18n/                 # Internationalization
├── __tests__/                # Test files
│   ├── components/           # Component tests
│   ├── screens/              # Screen tests
│   └── services/             # Service tests
├── .env.development          # Development environment variables
├── .env.production           # Production environment variables
├── app.json                  # Expo configuration
├── babel.config.js           # Babel configuration
├── metro.config.js           # Metro bundler configuration
├── package.json              # Package dependencies
└── tsconfig.json             # TypeScript configuration
```

### Feature-Specific Frontend Structure

#### Ask Feature

```
src/
├── screens/ask/
│   ├── AskScreen.tsx         # Main Ask screen
│   ├── ToneSelectionScreen.tsx # Tone selection screen
│   └── ResponseDetailScreen.tsx # Detailed response view
├── components/ask/
│   ├── QuestionInput.tsx     # Question input component
│   ├── ToneSelector.tsx      # Tone selection component
│   ├── ResponseCard.tsx      # Response display component
│   ├── ConceptBadge.tsx      # Concept badge component
│   ├── SaveButton.tsx        # Save to journal button
│   ├── ShareButton.tsx       # Share button
│   ├── Expand.tsx            # Expand insight button
│   ├── SeekClarity.tsx       # Seek clarity button
│   ├── ContemplativeOrb.tsx  # Rating component
│   ├── TonePreviewModal.tsx  # Tone preview modal
│   ├── ReflectionPrompt.tsx  # Reflection prompt component
│   ├── ProgressIndicator.tsx # Loading indicator
│   └── ToneExplorationGallery.tsx # Tone gallery component
├── hooks/feature-specific/ask/
│   ├── useTones.ts           # Hook for tone management
│   ├── useQuestionHistory.ts # Hook for question history
│   └── useConceptExtraction.ts # Hook for concept extraction
├── context/feature-specific/ask/
│   └── AskContext.tsx        # Ask feature context
├── services/feature-specific/ask/
│   ├── askService.ts         # Ask API service
│   ├── toneService.ts        # Tone management service
│   └── conceptService.ts     # Concept service for Ask
├── store/slices/ask/
│   ├── askSlice.ts           # Ask feature state slice
│   └── tonesSlice.ts         # Tones state slice
└── types/feature-specific/ask/
    ├── ask.ts                # Ask feature types
    ├── tones.ts              # Tone types
    └── concepts.ts           # Concept types for Ask
```

#### Explore Feature

```
src/
├── screens/explore/
│   ├── ExploreScreen.tsx     # Main Explore screen
│   ├── ConceptDetailScreen.tsx # Concept detail screen
│   ├── ConceptMapScreen.tsx  # Concept map visualization
│   └── PathwayScreen.tsx     # Learning pathway screen
├── components/explore/
│   ├── ConceptMap.tsx        # Concept map visualization
│   ├── ConceptDetail.tsx     # Concept detail component
│   ├── ConceptSearch.tsx     # Search component
│   ├── ConceptFilter.tsx     # Filter component
│   ├── PathwaySelector.tsx   # Pathway selection component
│   ├── ConstellationView.tsx # Constellation visualization
│   ├── RelatedConceptsList.tsx # Related concepts list
│   ├── ConceptHistoryTracker.tsx # History tracking component
│   └── NotificationBanner.tsx # Notification component
├── hooks/feature-specific/explore/
│   ├── useConceptMap.ts      # Hook for concept map
│   ├── useExplorationHistory.ts # Hook for exploration history
│   └── useConceptMastery.ts  # Hook for concept mastery
├── context/feature-specific/explore/
│   └── ExploreContext.tsx    # Explore feature context
├── services/feature-specific/explore/
│   ├── conceptService.ts     # Concept API service
│   ├── visualizationService.ts # Visualization service
│   └── masteryService.ts     # Mastery tracking service
├── store/slices/explore/
│   ├── conceptsSlice.ts      # Concepts state slice
│   ├── explorationSlice.ts   # Exploration state slice
│   └── masterySlice.ts       # Mastery state slice
└── types/feature-specific/explore/
    ├── concepts.ts           # Concept types
    ├── visualization.ts      # Visualization types
    └── mastery.ts            # Mastery types
```

#### Quest Feature

```
src/
├── screens/quest/
│   ├── QuestScreen.tsx       # Main Quest screen
│   ├── QuestDetailScreen.tsx # Quest detail screen
│   ├── SkillTreeScreen.tsx   # Skill tree visualization
│   └── QuestStepScreen.tsx   # Quest step screen
├── components/quest/
│   ├── QuestProgress.tsx     # Progress indicator
│   ├── SkillTreeView.tsx     # Skill tree visualization
│   ├── QuestStep.tsx         # Quest step component
│   ├── QuestNodeComponent.tsx # Skill tree node
│   └── ConceptMiniTree.tsx   # Mini concept visualization
├── hooks/feature-specific/quest/
│   ├── useQuestProgress.ts   # Hook for quest progress
│   └── useSkillTree.ts       # Hook for skill tree
├── context/feature-specific/quest/
│   └── QuestContext.tsx      # Quest feature context
├── services/feature-specific/quest/
│   ├── questService.ts       # Quest API service
│   └── skillTreeService.ts   # Skill tree service
├── store/slices/quest/
│   ├── questsSlice.ts        # Quests state slice
│   └── progressSlice.ts      # Progress state slice
└── types/feature-specific/quest/
    ├── quests.ts             # Quest types
    ├── steps.ts              # Step types
    └── skillTree.ts          # Skill tree types
```

#### Journal Feature

```
src/
├── screens/journal/
│   ├── JournalScreen.tsx     # Main Journal screen
│   ├── EntryDetailScreen.tsx # Entry detail screen
│   └── EntryEditorScreen.tsx # Entry editor screen
├── components/journal/
│   ├── EntryList.tsx         # Journal entry list
│   ├── EntryCard.tsx         # Journal entry card
│   ├── EntryEditor.tsx       # Journal entry editor
│   └── ConceptTagger.tsx     # Concept tagging component
├── hooks/feature-specific/journal/
│   └── useJournalEntries.ts  # Hook for journal entries
├── context/feature-specific/journal/
│   └── JournalContext.tsx    # Journal feature context
├── services/feature-specific/journal/
│   └── journalService.ts     # Journal API service
├── store/slices/journal/
│   └── journalSlice.ts       # Journal state slice
└── types/feature-specific/journal/
    └── journal.ts            # Journal types
```

#### Forum Feature

```
src/
├── screens/forum/
│   ├── ForumScreen.tsx       # Main Forum screen
│   ├── ThreadScreen.tsx      # Thread detail screen
│   └── CreatePostScreen.tsx  # Create post screen
├── components/forum/
│   ├── ThreadList.tsx        # Thread list component
│   ├── PostCard.tsx          # Post card component
│   ├── CommentSection.tsx    # Comment section component
│   └── RichTextEditor.tsx    # Rich text editor component
├── hooks/feature-specific/forum/
│   └── useForumThreads.ts    # Hook for forum threads
├── context/feature-specific/forum/
│   └── ForumContext.tsx      # Forum feature context
├── services/feature-specific/forum/
│   └── forumService.ts       # Forum API service
├── store/slices/forum/
│   └── forumSlice.ts         # Forum state slice
└── types/feature-specific/forum/
    └── forum.ts              # Forum types
```

#### Profile Feature

```
src/
├── screens/profile/
│   ├── ProfileScreen.tsx     # Main Profile screen
│   ├── SettingsScreen.tsx    # Settings screen
│   └── AchievementsScreen.tsx # Achievements screen
├── components/profile/
│   ├── ProfileHeader.tsx     # Profile header component
│   ├── XpProgressBar.tsx     # XP progress bar
│   ├── BadgeCollection.tsx   # Badge collection component
│   └── SettingsItem.tsx      # Settings item component
├── hooks/feature-specific/profile/
│   └── useUserProfile.ts     # Hook for user profile
├── context/feature-specific/profile/
│   └── ProfileContext.tsx    # Profile feature context
├── services/feature-specific/profile/
│   └── profileService.ts     # Profile API service
├── store/slices/profile/
│   └── profileSlice.ts       # Profile state slice
└── types/feature-specific/profile/
    └── profile.ts            # Profile types
```

## Backend Structure

```
backend/
├── src/
│   ├── main.py               # Application entry point
│   ├── config/               # Configuration
│   │   ├── settings.py       # Application settings
│   │   ├── database.py       # Database configuration
│   │   └── security.py       # Security configuration
│   ├── api/                  # API endpoints
│   │   ├── v1/               # API version 1
│   │   │   ├── router.py     # Main API router
│   │   │   ├── ask/          # Ask feature endpoints
│   │   │   ├── explore/      # Explore feature endpoints
│   │   │   ├── quest/        # Quest feature endpoints
│   │   │   ├── journal/      # Journal feature endpoints
│   │   │   ├── forum/        # Forum feature endpoints
│   │   │   ├── profile/      # Profile feature endpoints
│   │   │   └── auth/         # Authentication endpoints
│   │   └── dependencies.py   # API dependencies
│   ├── core/                 # Core application code
│   │   ├── security.py       # Security utilities
│   │   ├── exceptions.py     # Custom exceptions
│   │   └── config.py         # Configuration utilities
│   ├── db/                   # Database
│   │   ├── session.py        # Database session
│   │   ├── base.py           # Base model
│   │   └── init_db.py        # Database initialization
│   ├── models/               # Database models
│   │   ├── user.py           # User model
│   │   ├── ask.py            # Ask feature models
│   │   ├── explore.py        # Explore feature models
│   │   ├── quest.py          # Quest feature models
│   │   ├── journal.py        # Journal feature models
│   │   ├── forum.py          # Forum feature models
│   │   └── profile.py        # Profile feature models
│   ├── schemas/              # Pydantic schemas
│   │   ├── user.py           # User schemas
│   │   ├── ask.py            # Ask feature schemas
│   │   ├── explore.py        # Explore feature schemas
│   │   ├── quest.py          # Quest feature schemas
│   │   ├── journal.py        # Journal feature schemas
│   │   ├── forum.py          # Forum feature schemas
│   │   └── profile.py        # Profile feature schemas
│   ├── services/             # Business logic
│   │   ├── ask/              # Ask feature services
│   │   ├── explore/          # Explore feature services
│   │   ├── quest/            # Quest feature services
│   │   ├── journal/          # Journal feature services
│   │   ├── forum/            # Forum feature services
│   │   ├── profile/          # Profile feature services
│   │   └── ai/               # AI services
│   ├── tasks/                # Celery tasks
│   │   ├── worker.py         # Celery worker configuration
│   │   ├── ask_tasks.py      # Ask feature tasks
│   │   ├── explore_tasks.py  # Explore feature tasks
│   │   ├── quest_tasks.py    # Quest feature tasks
│   │   └── notification_tasks.py # Notification tasks
│   └── utils/                # Utility functions
│       ├── logging.py        # Logging utilities
│       └── helpers.py        # Helper functions
├── tests/                    # Test files
│   ├── conftest.py           # Test configuration
│   ├── api/                  # API tests
│   ├── services/             # Service tests
│   └── tasks/                # Task tests
├── alembic/                  # Database migrations
│   ├── versions/             # Migration versions
│   └── env.py                # Alembic environment
├── .env.example              # Example environment variables
├── requirements.txt          # Package dependencies
├── requirements-dev.txt      # Development dependencies
├── Dockerfile                # Docker configuration
└── docker-compose.yml        # Docker Compose configuration
```

### Feature-Specific Backend Structure

#### Ask Feature Backend

```
src/
├── api/v1/ask/
│   ├── router.py             # Ask API router
│   ├── endpoints.py          # Ask endpoints
│   └── dependencies.py       # Ask dependencies
├── models/ask.py             # Ask database models
├── schemas/ask.py            # Ask Pydantic schemas
├── services/ask/
│   ├── ask_service.py        # Core Ask service
│   ├── ai_service.py         # AI integration service
│   ├── concept_service.py    # Concept extraction service
│   └── tone_service.py       # Tone management service
└── tasks/ask_tasks.py        # Ask Celery tasks
```

#### Explore Feature Backend

```
src/
├── api/v1/explore/
│   ├── router.py             # Explore API router
│   ├── endpoints.py          # Explore endpoints
│   └── dependencies.py       # Explore dependencies
├── models/explore.py         # Explore database models
├── schemas/explore.py        # Explore Pydantic schemas
├── services/explore/
│   ├── concept_service.py    # Concept service
│   ├── concept_relationship_service.py # Relationship service
│   ├── exploration_history_service.py # History service
│   ├── recommendation_service.py # Recommendation service
│   └── visualization_service.py # Visualization service
└── tasks/explore_tasks.py    # Explore Celery tasks
```

#### Quest Feature Backend

```
src/
├── api/v1/quest/
│   ├── router.py             # Quest API router
│   ├── endpoints.py          # Quest endpoints
│   └── dependencies.py       # Quest dependencies
├── models/quest.py           # Quest database models
├── schemas/quest.py          # Quest Pydantic schemas
├── services/quest/
│   ├── quest_service.py      # Core Quest service
│   ├── skill_tree_service.py # Skill tree service
│   └── xp_service.py         # XP service
└── tasks/quest_tasks.py      # Quest Celery tasks
```

#### Journal Feature Backend

```
src/
├── api/v1/journal/
│   ├── router.py             # Journal API router
│   ├── endpoints.py          # Journal endpoints
│   └── dependencies.py       # Journal dependencies
├── models/journal.py         # Journal database models
├── schemas/journal.py        # Journal Pydantic schemas
├── services/journal/
│   └── journal_service.py    # Journal service
└── tasks/journal_tasks.py    # Journal Celery tasks
```

#### Forum Feature Backend

```
src/
├── api/v1/forum/
│   ├── router.py             # Forum API router
│   ├── endpoints.py          # Forum endpoints
│   └── dependencies.py       # Forum dependencies
├── models/forum.py           # Forum database models
├── schemas/forum.py          # Forum Pydantic schemas
├── services/forum/
│   └── forum_service.py      # Forum service
└── tasks/forum_tasks.py      # Forum Celery tasks
```

#### Profile Feature Backend

```
src/
├── api/v1/profile/
│   ├── router.py             # Profile API router
│   ├── endpoints.py          # Profile endpoints
│   └── dependencies.py       # Profile dependencies
├── models/profile.py         # Profile database models
├── schemas/profile.py        # Profile Pydantic schemas
├── services/profile/
│   └── profile_service.py    # Profile service
└── tasks/profile_tasks.py    # Profile Celery tasks
```

## AI Services Structure

```
src/
├── services/ai/
│   ├── ai_router.py          # AI Router service
│   ├── model_services/
│   │   ├── claude_service.py # Claude API integration
│   │   ├── grok_service.py   # Grok API integration
│   │   ├── gemini_service.py # Gemini API integration
│   │   └── chatgpt_service.py # ChatGPT API integration
│   ├── prompt_services/
│   │   ├── dynamic_prompt_service.py # Dynamic prompt service
│   │   ├── tone_template_manager.py # Tone template manager
│   │   ├── context_analyzer.py # Context analyzer
│   │   └── question_classifier.py # Question classifier
│   └── evaluation/
│       ├── response_quality_service.py # Quality evaluation
│       └── cost_optimization_service.py # Cost optimization
└── tasks/ai_tasks.py         # AI-related Celery tasks
```

## Shared Types Structure

```
shared/
├── types/
│   ├── api/
│   │   ├── responses.ts      # Common API response types
│   │   └── requests.ts       # Common API request types
│   ├── models/
│   │   ├── user.ts           # User model types
│   │   ├── ask.ts            # Ask model types
│   │   ├── explore.ts        # Explore model types
│   │   ├── quest.ts          # Quest model types
│   │   ├── journal.ts        # Journal model types
│   │   ├── forum.ts          # Forum model types
│   │   └── profile.ts        # Profile model types
│   └── enums/
│       ├── status.ts         # Status enums
│       └── feature-specific/ # Feature-specific enums
└── constants/
    ├── api.ts                # API constants
    ├── routes.ts             # Route constants
    └── feature-specific/     # Feature-specific constants
```

## Database Schema Structure

```
backend/
├── alembic/
│   └── versions/
│       ├── 001_create_users_table.py
│       ├── 002_create_ask_tables.py
│       ├── 003_create_explore_tables.py
│       ├── 004_create_quest_tables.py
│       ├── 005_create_journal_tables.py
│       ├── 006_create_forum_tables.py
│       └── 007_create_profile_tables.py
└── src/
    └── models/
        ├── user.py           # User models
        ├── ask.py            # Ask models
        │   ├── ask_interactions
        │   ├── philosophical_tones
        │   ├── user_tone_preferences
        │   ├── ask_interaction_concepts
        │   ├── question_suggestions
        │   └── user_question_suggestions
        ├── explore.py        # Explore models
        │   ├── concepts
        │   ├── concept_relationships
        │   ├── user_concept_interactions
        │   ├── user_exploration_history
        │   ├── concept_mastery
        │   ├── exploration_notifications
        │   ├── concept_learning_pathways
        │   └── user_pathway_progress
        ├── quest.py          # Quest models
        │   ├── quests
        │   ├── quest_steps
        │   ├── user_quests
        │   ├── user_quest_steps
        │   ├── quest_badges
        │   └── user_quest_badges
        ├── journal.py        # Journal models
        │   ├── journal_entries
        │   ├── journal_tags
        │   └── journal_entry_concepts
        ├── forum.py          # Forum models
        │   ├── forum_categories
        │   ├── forum_threads
        │   ├── forum_posts
        │   └── forum_reactions
        └── profile.py        # Profile models
            ├── user_profiles
            ├── user_achievements
            ├── user_settings
            └── user_statistics
```

## Celery Tasks Structure

```
backend/
└── src/
    └── tasks/
        ├── worker.py         # Celery worker configuration
        ├── ask_tasks.py      # Ask feature tasks
        │   ├── process_ask_question
        │   ├── extract_concepts_from_response
        │   ├── generate_personalized_suggestions
        │   └── cache_tone_previews
        ├── explore_tasks.py  # Explore feature tasks
        │   ├── process_concept_relationships
        │   ├── generate_exploration_recommendations
        │   ├── update_concept_mastery
        │   ├── generate_exploration_notifications
        │   ├── cache_concept_visualizations
        │   ├── analyze_exploration_patterns
        │   └── sync_offline_exploration_data
        ├── quest_tasks.py    # Quest feature tasks
        │   ├── award_quest_xp
        │   └── check_quest_badge_eligibility
        ├── notification_tasks.py # Notification tasks
        │   ├── send_push_notification
        │   ├── process_notification_queue
        │   └── clean_old_notifications
        └── ai_tasks.py       # AI-related tasks
            ├── optimize_prompt_templates
            ├── evaluate_response_quality
            └── update_model_performance_metrics
```

## Configuration Files

```
frontend/
├── .env.development          # Development environment variables
├── .env.production           # Production environment variables
├── app.json                  # Expo configuration
├── babel.config.js           # Babel configuration
├── metro.config.js           # Metro bundler configuration
├── package.json              # Package dependencies
└── tsconfig.json             # TypeScript configuration

backend/
├── .env.example              # Example environment variables
├── requirements.txt          # Package dependencies
├── requirements-dev.txt      # Development dependencies
├── Dockerfile                # Docker configuration
└── docker-compose.yml        # Docker Compose configuration
```

## Testing Structure

```
frontend/
└── __tests__/
    ├── components/           # Component tests
    │   ├── common/           # Common component tests
    │   ├── ask/              # Ask component tests
    │   ├── explore/          # Explore component tests
    │   └── ...               # Other feature component tests
    ├── screens/              # Screen tests
    │   ├── ask/              # Ask screen tests
    │   ├── explore/          # Explore screen tests
    │   └── ...               # Other feature screen tests
    ├── hooks/                # Hook tests
    └── services/             # Service tests

backend/
└── tests/
    ├── conftest.py           # Test configuration
    ├── api/                  # API tests
    │   ├── test_ask.py       # Ask API tests
    │   ├── test_explore.py   # Explore API tests
    │   └── ...               # Other feature API tests
    ├── services/             # Service tests
    │   ├── test_ask_service.py # Ask service tests
    │   ├── test_explore_service.py # Explore service tests
    │   └── ...               # Other service tests
    └── tasks/                # Task tests
        ├── test_ask_tasks.py # Ask task tests
        ├── test_explore_tasks.py # Explore task tests
        └── ...               # Other task tests
```

## Documentation Structure

```
docs/
├── api/                      # API documentation
│   ├── v1/                   # API v1 documentation
│   │   ├── ask.md            # Ask API documentation
│   │   ├── explore.md        # Explore API documentation
│   │   └── ...               # Other feature API documentation
│   └── openapi.yaml          # OpenAPI specification
├── architecture/             # Architecture documentation
│   ├── overview.md           # Architecture overview
│   ├── frontend.md           # Frontend architecture
│   ├── backend.md            # Backend architecture
│   └── database.md           # Database architecture
└── features/                 # Feature documentation
    ├── ask.md                # Ask feature documentation
    ├── explore.md            # Explore feature documentation
    └── ...                   # Other feature documentation
```

## Integration with Cursor

This file architecture is designed to be easily integrated with Cursor for optimal development workflow:

1. **Project Structure**: Clear separation of frontend, backend, and shared code for easy navigation
2. **Feature Organization**: Feature-specific code is organized in dedicated directories
3. **Consistent Naming**: Consistent naming conventions across the codebase
4. **Type Definitions**: Comprehensive TypeScript type definitions for better code completion
5. **Documentation**: Extensive documentation for all features and components
6. **Testing**: Well-organized test structure for all components and services

To integrate with Cursor:

1. Import this file architecture into Cursor
2. Configure Cursor to recognize the project structure
3. Set up code completion for TypeScript and Python
4. Configure linting and formatting rules
5. Set up test runners for frontend and backend tests

This architecture provides a solid foundation for developing the Setarcos philosophy app, with clear organization, separation of concerns, and comprehensive documentation.
