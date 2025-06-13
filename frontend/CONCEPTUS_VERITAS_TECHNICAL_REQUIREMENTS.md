# Conceptus Veritas Technical Requirements

## Overview

This document provides comprehensive technical requirements for the Conceptus Veritas philosophy application. It serves as an enforceable guide for design, API structure, component naming, and implementation details across the entire application.

## 1. API Requirements

### 1.1 API Design Principles

All Conceptus Veritas APIs must adhere to the following principles:

- **RESTful Design**: Resource-oriented endpoints following REST conventions
- **Versioning**: All endpoints prefixed with `/api/v1/`
- **JSON Format**: All requests and responses must use JSON
- **Consistent Patterns**: Follow established patterns for similar operations
- **Pagination**: Collection endpoints must support `limit` and `offset` parameters
- **Authentication**: JWT-based authentication via Supabase Auth
- **Authorization**: Role-based access (Anonymous, Free, Premium, Pro, Admin)
- **Rate Limiting**: Enforce tier-specific daily usage limits

### 1.2 Required API Endpoints

All endpoints must follow the specified HTTP methods, paths, and response formats.

#### 1.2.1 Authentication & User Management

| HTTP Method | Endpoint Path                  | Description              | Auth Required       | Tier Restrictions |
| ----------- | ------------------------------ | ------------------------ | ------------------- | ----------------- |
| POST        | `/api/v1/auth/register`        | Register new user        | No                  | None              |
| POST        | `/api/v1/auth/login`           | Log in existing user     | No                  | None              |
| POST        | `/api/v1/auth/refresh`         | Refresh expired JWT      | Yes (Refresh Token) | None              |
| POST        | `/api/v1/auth/logout`          | Invalidate refresh token | Yes                 | None              |
| POST        | `/api/v1/auth/password/reset`  | Request password reset   | No                  | None              |
| POST        | `/api/v1/auth/password/change` | Change password          | Yes                 | None              |

#### 1.2.2 Ask Feature

| HTTP Method | Endpoint Path                                      | Description                      | Auth Required | Tier Restrictions                                |
| ----------- | -------------------------------------------------- | -------------------------------- | ------------- | ------------------------------------------------ |
| POST        | `/api/v1/ai/ask`                                   | Submit question, get AI response | Yes           | Free (10/day), Premium (50/day), Pro (Unlimited) |
| GET         | `/api/v1/ai/interactions`                          | Get interaction history          | Yes           | None                                             |
| GET         | `/api/v1/ask/tones`                                | Get philosophical tones          | Yes           | None                                             |
| POST        | `/api/v1/ask/tone-preview`                         | Preview tone sample              | Yes           | None                                             |
| POST        | `/api/v1/ask/interactions/{interaction_id}/save`   | Save to journal                  | Yes           | None                                             |
| POST        | `/api/v1/ask/interactions/{interaction_id}/expand` | Expand insight                   | Yes           | Premium, Pro                                     |
| GET         | `/api/v1/ask/suggestions`                          | Get question suggestions         | Yes           | None                                             |

#### 1.2.3 Seek Clarity Feature

| HTTP Method | Endpoint Path                                       | Description              | Auth Required | Tier Restrictions |
| ----------- | --------------------------------------------------- | ------------------------ | ------------- | ----------------- |
| POST        | `/api/v1/seek-clarity/practical-examples`           | Request examples         | Yes           | None              |
| GET         | `/api/v1/seek-clarity/practical-examples/{task_id}` | Retrieve examples        | Yes           | None              |
| POST        | `/api/v1/seek-clarity/practical-rephrasing`         | Request rephrasing       | Yes           | None              |
| POST        | `/api/v1/seek-clarity/journal-challenge`            | Create challenge         | Yes           | None              |
| POST        | `/api/v1/seek-clarity/wisdom-sharing`               | Generate sharing options | Yes           | None              |
| POST        | `/api/v1/seek-clarity/learning-path`                | Generate learning path   | Yes           | None              |

#### 1.2.4 Quest Feature

| HTTP Method | Endpoint Path                                       | Description               | Auth Required | Tier Restrictions   |
| ----------- | --------------------------------------------------- | ------------------------- | ------------- | ------------------- |
| GET         | `/api/v1/quests`                                    | Get available quests      | Yes           | None                |
| GET         | `/api/v1/quests/{id}`                               | Get quest details         | Yes           | None                |
| GET         | `/api/v1/quests/skill-tree`                         | Get skill tree data       | Yes           | None                |
| POST        | `/api/v1/quests/{id}/start`                         | Start/resume quest        | Yes           | None (some Premium) |
| POST        | `/api/v1/quests/{id}/steps/{step_id}/complete`      | Complete quest step       | Yes           | None                |
| GET         | `/api/v1/quests/recommended`                        | Get quest recommendations | Yes           | None                |
| POST        | `/api/v1/quests/{id}/concepts/{concept_id}/explore` | Track concept exploration | Yes           | None                |
| GET         | `/api/v1/quests/daily`                              | Get daily quest           | Yes           | None                |

## 2. Frontend Component Requirements

### 2.1 Core Architecture

- Use React Native for cross-platform mobile development
- Use Zustand for state management
- Use React Navigation for routing
- Use NativeWind for styling (based on Tailwind CSS)
- Use Axios/Fetch for API calls

### 2.2 Component Organization

Components must be organized in the following structure:

- **Common Components**: Reusable UI elements in `src/components/common/`
- **Core Components**: App structure elements in `src/components/core/`
- **Feature Components**: Feature-specific components in their respective directories

### 2.3 Required Components by Feature

#### 2.3.1 Core Components

| Component Name      | Required Props                   | Description                  |
| ------------------- | -------------------------------- | ---------------------------- |
| `App.tsx`           | -                                | Main application entry point |
| `AppNavigator.tsx`  | -                                | Main navigation structure    |
| `AuthNavigator.tsx` | -                                | Authentication flows         |
| `Button/`           | `onPress, label, variant`        | Reusable button components   |
| `Card/`             | `children, style`                | Reusable card containers     |
| `Input/`            | `value, onChange, label`         | Form input components        |
| `Modal/`            | `visible, onClose, children`     | Modal dialog components      |
| `Typography/`       | `variant, children`              | Text display components      |
| `AppHeader/`        | `title, leftAction, rightAction` | Application header           |
| `BottomNav/`        | -                                | Bottom tab navigation        |
| `ErrorBoundary/`    | `fallback`                       | Error handling container     |
| `LoadingState/`     | `message`                        | Loading indicators           |

#### 2.3.2 Ask Feature Components

| Component Name                | Required Props                    | Description                  |
| ----------------------------- | --------------------------------- | ---------------------------- |
| `AskScreen.tsx`               | -                                 | Main screen for AI dialogues |
| `QuestionInput.tsx`           | `value, onChange, onSubmit`       | Text input for questions     |
| `QuestionAssistancePanel.tsx` | `suggestions, onSelectSuggestion` | Question suggestion panel    |
| `ReflectionPrompt.tsx`        | `prompt, onDismiss`               | Pre-question prompt          |
| `ToneSelector.tsx`            | `tones, selectedTone, onSelect`   | Tone selection component     |
| `TonePreviewModal.tsx`        | `tone, sampleResponse, onClose`   | Tone preview dialog          |
| `ProgressIndicator.tsx`       | `isLoading, tone`                 | Loading indicator            |
| `ResponseCard.tsx`            | `response, concepts, actions`     | AI response display          |
| `ConceptBadgeStrip.tsx`       | `concepts, onPress`               | Horizontal concept strip     |
| `ConceptBadge.tsx`            | `concept, onPress`                | Clickable concept tag        |
| `ActionButtonGroup.tsx`       | `actions, onAction`               | Response action buttons      |
| `ContemplativeOrb.tsx`        | `onRate, size`                    | Rating component             |

## 3. Backend Component Requirements

### 3.1 Core Architecture

- Use FastAPI as the primary web framework
- Use Uvicorn as the ASGI server
- Use Pydantic for data validation
- Use SQLAlchemy for ORM
- Use Celery for asynchronous processing
- Use Redis for caching and as Celery broker
- Use JWT for authentication via Supabase Auth

### 3.2 Backend Module Organization

Modules must be organized in the following structure:

- **API Versioning**: `/src/api/v1/`
- **Routes**: `/src/api/v1/routes/`
- **Schemas**: `/src/api/v1/schemas/`
- **Core Logic**: `/src/core/`
- **Database Models**: `/src/database/`
- **Services**: `/src/services/`
- **Background Tasks**: `/src/tasks/`
- **Utilities**: `/src/utils/`

### 3.3 Required Backend Components by Feature

#### 3.3.1 Core Components

| Component Name    | Purpose                     | Key Functionality               |
| ----------------- | --------------------------- | ------------------------------- |
| `main.py`         | Application entry point     | Initialize FastAPI app          |
| `celery_app.py`   | Celery configuration        | Configure task queue            |
| `dependencies.py` | Dependency injection        | Provide service dependencies    |
| `settings.py`     | Application settings        | Configure environment variables |
| `middlewares.py`  | Request/response processing | Authentication, logging, etc.   |
| `database.py`     | Database connection         | SQLAlchemy session management   |

## 4. Database Schema Requirements

### 4.1 Core Tables

| Table Name           | Primary Purpose      | Key Columns                              |
| -------------------- | -------------------- | ---------------------------------------- |
| `users`              | Core user accounts   | `id (PK), auth_id, username, email`      |
| `user_settings`      | User preferences     | `id (PK), user_id (FK)`                  |
| `user_subscriptions` | Subscription details | `id (PK), user_id (FK), tier`            |
| `user_badges`        | Earned badges        | `id (PK), user_id (FK), badge_id`        |
| `user_xp`            | XP tracking          | `id (PK), user_id (FK), total_xp, level` |
| `xp_transactions`    | XP history           | `id (PK), user_id (FK), amount, source`  |
| `user_streaks`       | Streak tracking      | `id (PK), user_id (FK), current_streak`  |

### 4.2 Content Tables

| Table Name              | Primary Purpose        | Key Columns                                  |
| ----------------------- | ---------------------- | -------------------------------------------- |
| `concepts`              | Concept definitions    | `concept_id (PK), name, description`         |
| `concept_relationships` | Concept connections    | `relationship_id (PK), source_id, target_id` |
| `philosophical_tones`   | Tone attributes        | `id (PK), name, description, tier`           |
| `wisdom_paths`          | Learning paths         | `id (PK), name, description, creator_id`     |
| `organic_nudges`        | User-generated content | `id (PK), content, creator_id`               |

### 4.3 Feature-Specific Tables

| Table Name                 | Primary Purpose   | Key Columns                                 |
| -------------------------- | ----------------- | ------------------------------------------- |
| `ai_interactions`          | Ask interactions  | `id (PK), user_id (FK), question, response` |
| `ask_interaction_concepts` | Concept linking   | `interaction_id (FK), concept_id (FK)`      |
| `quests`                   | Quest definitions | `id (PK), title, description, difficulty`   |
| `user_quests`              | Quest progress    | `id (PK), user_id (FK), quest_id (FK)`      |
| `journal_entries`          | Journal entries   | `id (PK), user_id (FK), title, content`     |
| `forum_threads`            | Forum threads     | `id (PK), user_id (FK), title, content`     |
| `user_rating_interactions` | User ratings      | `id (PK), response_id (FK), rating_value`   |

## 5. Implementation Requirements

### 5.1 API Response Time Requirements

- API responses must complete within the following time limits:
  - **Fast operations** (e.g., GET requests): 200ms
  - **Standard operations** (e.g., simple POST): 500ms
  - **Complex operations** (e.g., AI interactions): 3-5 seconds initial response
  - **Background tasks** (e.g., concept extraction): Max 30 seconds

### 5.2 Code Quality Requirements

- All code must follow language-specific best practices
- Frontend components must include PropTypes or TypeScript definitions
- Backend services must include input validation via Pydantic
- Unit test coverage must exceed 80% for critical components
- All API endpoints must include OpenAPI documentation

### 5.3 AI Integration Requirements

- The AI Router must follow phased development approach:
  - **Phase 1**: Rule-based selection by tone
  - **Phase 2**: Dynamic selection based on question context
  - **Phase 3**: ML-enhanced selection with continuous learning
- All AI models must be accessible through standardized interfaces
- Fallback mechanisms must be implemented for model unavailability
- User feedback must be collected via the Contemplative Orb

## 6. Cross-Feature Integration Requirements

- Concepts extracted from AI responses must be clickable and navigate to Explore
- Ask interactions must be savable to Journal
- Ask interactions must be shareable to Forum
- Quest completion must award XP and update user progress
- Notifications must be triggered for key milestones
- Rating data must feed into AI model optimization

This document serves as the definitive technical requirements for the Conceptus Veritas application. All implementation must conform to these specifications to ensure consistency, quality, and integration across the entire system.
