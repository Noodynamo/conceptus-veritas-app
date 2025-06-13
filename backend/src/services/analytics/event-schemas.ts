import { EventCategory } from './analytics.constants';
import { EventSchema, PropertyType } from './schema-registry';

/**
 * Event Schema Definitions
 * 
 * This file contains the schema definitions for all analytics events.
 * 
 * Change log:
 * - v1.0.0 (2024-07-01): Initial version with core event schemas
 */

/**
 * User-related event schemas
 */
export const userSchemas: EventSchema[] = [
  new EventSchema({
    name: 'ph_user-signup',
    version: '1.0.0',
    description: 'Fired when a user completes the signup process',
    category: EventCategory.USER,
    properties: {
      method: {
        type: PropertyType.STRING,
        required: true,
        enum: ['email', 'google', 'apple', 'facebook'],
        description: 'The signup method used'
      },
      referrer: {
        type: PropertyType.STRING,
        description: 'Where the user came from'
      },
      user_id: {
        type: PropertyType.STRING,
        required: true,
        description: 'Unique identifier for the user'
      },
      has_completed_onboarding: {
        type: PropertyType.BOOLEAN,
        description: 'Whether the user completed the onboarding flow'
      }
    }
  }),
  
  new EventSchema({
    name: 'ph_user-login',
    version: '1.0.0',
    description: 'Fired when a user logs in',
    category: EventCategory.USER,
    properties: {
      method: {
        type: PropertyType.STRING,
        required: true,
        enum: ['email', 'google', 'apple', 'facebook'],
        description: 'The login method used'
      },
      user_id: {
        type: PropertyType.STRING,
        required: true,
        description: 'Unique identifier for the user'
      },
      success: {
        type: PropertyType.BOOLEAN,
        required: true,
        description: 'Whether the login was successful'
      },
      error_type: {
        type: PropertyType.STRING,
        description: 'Type of error if login failed'
      }
    }
  }),
  
  new EventSchema({
    name: 'ph_user-logout',
    version: '1.0.0',
    description: 'Fired when a user logs out',
    category: EventCategory.USER,
    properties: {
      user_id: {
        type: PropertyType.STRING,
        required: true,
        description: 'Unique identifier for the user'
      },
      session_duration_seconds: {
        type: PropertyType.NUMBER,
        description: 'Duration of the user session in seconds'
      }
    }
  })
];

/**
 * Content-related event schemas
 */
export const contentSchemas: EventSchema[] = [
  new EventSchema({
    name: 'ph_content-view',
    version: '1.0.0',
    description: 'Fired when a user views content',
    category: EventCategory.CONTENT,
    properties: {
      content_id: {
        type: PropertyType.STRING,
        required: true,
        description: 'Unique identifier for the content'
      },
      content_type: {
        type: PropertyType.STRING,
        required: true,
        enum: ['concept', 'article', 'video', 'quest', 'journal'],
        description: 'Type of content viewed'
      },
      content_category: {
        type: PropertyType.STRING,
        description: 'Category of the content'
      },
      source: {
        type: PropertyType.STRING,
        description: 'Source of the content view (e.g., search, recommendation)'
      },
      user_id: {
        type: PropertyType.STRING,
        required: true,
        description: 'Unique identifier for the user'
      },
      duration_seconds: {
        type: PropertyType.NUMBER,
        description: 'Duration spent viewing the content in seconds'
      }
    }
  }),
  
  new EventSchema({
    name: 'ph_content-interaction',
    version: '1.0.0',
    description: 'Fired when a user interacts with content',
    category: EventCategory.CONTENT,
    properties: {
      content_id: {
        type: PropertyType.STRING,
        required: true,
        description: 'Unique identifier for the content'
      },
      content_type: {
        type: PropertyType.STRING,
        required: true,
        enum: ['concept', 'article', 'video', 'quest', 'journal'],
        description: 'Type of content interacted with'
      },
      interaction_type: {
        type: PropertyType.STRING,
        required: true,
        enum: ['like', 'share', 'save', 'comment', 'download'],
        description: 'Type of interaction'
      },
      user_id: {
        type: PropertyType.STRING,
        required: true,
        description: 'Unique identifier for the user'
      }
    }
  })
];

/**
 * Navigation-related event schemas
 */
export const navigationSchemas: EventSchema[] = [
  new EventSchema({
    name: 'ph_navigation-screen-view',
    version: '1.0.0',
    description: 'Fired when a user navigates to a new screen',
    category: EventCategory.NAVIGATION,
    properties: {
      screen_name: {
        type: PropertyType.STRING,
        required: true,
        description: 'Name of the screen viewed'
      },
      previous_screen: {
        type: PropertyType.STRING,
        description: 'Name of the previous screen'
      },
      user_id: {
        type: PropertyType.STRING,
        required: true,
        description: 'Unique identifier for the user'
      },
      navigation_method: {
        type: PropertyType.STRING,
        description: 'How the user navigated to this screen',
        enum: ['button', 'menu', 'link', 'back', 'search', 'deeplink']
      }
    }
  }),
  
  new EventSchema({
    name: 'ph_navigation-search',
    version: '1.0.0',
    description: 'Fired when a user performs a search',
    category: EventCategory.NAVIGATION,
    properties: {
      query: {
        type: PropertyType.STRING,
        required: true,
        description: 'Search query text'
      },
      category: {
        type: PropertyType.STRING,
        description: 'Category being searched'
      },
      filters: {
        type: PropertyType.OBJECT,
        description: 'Search filters applied'
      },
      result_count: {
        type: PropertyType.NUMBER,
        description: 'Number of results returned'
      },
      user_id: {
        type: PropertyType.STRING,
        required: true,
        description: 'Unique identifier for the user'
      }
    }
  })
];

/**
 * System-related event schemas
 */
export const systemSchemas: EventSchema[] = [
  new EventSchema({
    name: 'ph_system-error',
    version: '1.0.0',
    description: 'Fired when a system error occurs',
    category: EventCategory.SYSTEM,
    properties: {
      error_code: {
        type: PropertyType.STRING,
        required: true,
        description: 'Error code'
      },
      error_message: {
        type: PropertyType.STRING,
        required: true,
        description: 'Error message'
      },
      error_context: {
        type: PropertyType.OBJECT,
        description: 'Context of the error'
      },
      user_id: {
        type: PropertyType.STRING,
        description: 'Unique identifier for the user'
      },
      component: {
        type: PropertyType.STRING,
        description: 'Component where the error occurred'
      },
      is_fatal: {
        type: PropertyType.BOOLEAN,
        description: 'Whether the error was fatal'
      }
    }
  }),
  
  new EventSchema({
    name: 'ph_system-performance',
    version: '1.0.0',
    description: 'Fired to track system performance metrics',
    category: EventCategory.PERFORMANCE,
    properties: {
      metric_name: {
        type: PropertyType.STRING,
        required: true,
        description: 'Name of the performance metric'
      },
      value: {
        type: PropertyType.NUMBER,
        required: true,
        description: 'Value of the metric'
      },
      unit: {
        type: PropertyType.STRING,
        required: true,
        description: 'Unit of the metric (ms, bytes, etc.)'
      },
      component: {
        type: PropertyType.STRING,
        description: 'Component being measured'
      },
      user_id: {
        type: PropertyType.STRING,
        description: 'Unique identifier for the user'
      }
    }
  })
];

/**
 * Export all schemas
 */
export const allSchemas: EventSchema[] = [
  ...userSchemas,
  ...contentSchemas,
  ...navigationSchemas,
  ...systemSchemas
]; 