import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Update Analytics Schema to version 1.1.0
 *
 * Adds new event schemas for user signup and content interaction
 */
export class UpdateAnalyticsSchemaToV1_1_020240715000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insert new version record
    await queryRunner.query(`
      INSERT INTO analytics_schema_versions (version, description, is_current, created_by)
      VALUES ('1.1.0', 'Added new event schemas for user signup and content interaction', TRUE, 'system')
    `);

    // Update previous version to not be current
    await queryRunner.query(`
      UPDATE analytics_schema_versions
      SET is_current = FALSE
      WHERE version != '1.1.0' AND is_current = TRUE
    `);

    // Insert new event schemas
    await queryRunner.query(`
      INSERT INTO analytics_event_schemas (
        schema_version_id,
        event_name,
        event_version,
        category,
        description,
        schema_definition,
        created_at
      )
      SELECT
        (SELECT id FROM analytics_schema_versions WHERE version = '1.1.0'),
        'ph_user_signup',
        '1',
        'user',
        'Schema for tracking user signup events',
        '{"name":"ph_user_signup","version":1,"description":"Schema for tracking user signup events","changes":"Initial version","category":"user","properties":{"userId":{"type":"string","description":"Unique identifier for the user","example":"user_12345"},"timestamp":{"type":"string","format":"date-time","description":"When the signup occurred","example":"2023-06-01T15:30:45Z"},"method":{"type":"string","description":"The signup method used","enum":["email","google","apple","facebook"],"example":"email"},"referrer":{"type":"string","description":"Where the user came from","example":"homepage"},"device_info":{"type":"object","description":"Information about the user''s device","properties":{"type":{"type":"string","description":"Device type (mobile, tablet, desktop)","example":"mobile"},"os":{"type":"string","description":"Operating system","example":"iOS 15.4"},"browser":{"type":"string","description":"Browser information","example":"Safari 15.4"}}},"initial_preferences":{"type":"object","description":"User''s initial preferences during signup","properties":{"notifications_enabled":{"type":"boolean","description":"Whether notifications are enabled","example":true},"theme":{"type":"string","description":"User''s selected theme","enum":["light","dark","system"],"example":"system"},"language":{"type":"string","description":"User''s selected language","example":"en-US"}}},"utm_parameters":{"type":"object","description":"UTM parameters for tracking marketing campaigns","properties":{"utm_source":{"type":"string","description":"The source of the traffic","example":"google"},"utm_medium":{"type":"string","description":"The marketing medium","example":"cpc"},"utm_campaign":{"type":"string","description":"The specific campaign name","example":"spring_launch"},"utm_term":{"type":"string","description":"Keywords associated with the campaign","example":"ai assistant"},"utm_content":{"type":"string","description":"Content identifier for A/B testing","example":"logolink"}}}},"required":["userId","timestamp","method"]}',
        NOW()
    `);

    await queryRunner.query(`
      INSERT INTO analytics_event_schemas (
        schema_version_id,
        event_name,
        event_version,
        category,
        description,
        schema_definition,
        created_at
      )
      SELECT
        (SELECT id FROM analytics_schema_versions WHERE version = '1.1.0'),
        'ph_content_interaction',
        '1',
        'content',
        'Schema for tracking user interactions with content',
        '{"name":"ph_content_interaction","version":1,"description":"Schema for tracking user interactions with content","changes":"Initial version","category":"content","properties":{"userId":{"type":"string","description":"Unique identifier for the user","example":"user_12345"},"contentId":{"type":"string","description":"Unique identifier for the content","example":"article_789"},"contentType":{"type":"string","description":"Type of content being interacted with","enum":["article","video","image","audio","quiz","concept","path"],"example":"article"},"interactionType":{"type":"string","description":"Type of interaction","enum":["view","like","share","comment","save","complete","rate"],"example":"view"},"timestamp":{"type":"string","format":"date-time","description":"When the interaction occurred","example":"2023-06-01T15:30:45Z"},"duration":{"type":"number","description":"Duration of the interaction in seconds (for time-based interactions)","example":120},"metadata":{"type":"object","description":"Additional metadata about the interaction","properties":{"scrollDepth":{"type":"number","description":"How far the user scrolled through the content (percentage)","example":75},"rating":{"type":"number","description":"User rating (1-5)","example":4},"commentText":{"type":"string","description":"Text of a comment (if interaction type is comment)","example":"Great article!"},"sharedTo":{"type":"string","description":"Platform where content was shared (if interaction type is share)","example":"twitter"}}},"source":{"type":"string","description":"Source of the content interaction","example":"feed"},"context":{"type":"object","description":"Contextual information about the interaction","properties":{"page":{"type":"string","description":"Page where the interaction occurred","example":"home"},"section":{"type":"string","description":"Section of the app where the interaction occurred","example":"recommended"},"referrer":{"type":"string","description":"How the user arrived at the content","example":"search"}}},"device_info":{"type":"object","description":"Information about the user''s device","properties":{"type":{"type":"string","description":"Device type (mobile, tablet, desktop)","example":"mobile"},"os":{"type":"string","description":"Operating system","example":"iOS 15.4"},"browser":{"type":"string","description":"Browser information","example":"Safari 15.4"}}}},"required":["userId","contentId","contentType","interactionType","timestamp"]}',
        NOW()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Delete the new event schemas
    await queryRunner.query(`
      DELETE FROM analytics_event_schemas
      WHERE event_name IN ('ph_user_signup', 'ph_content_interaction')
    `);

    // Delete the new version record
    await queryRunner.query(`
      DELETE FROM analytics_schema_versions
      WHERE version = '1.1.0'
    `);

    // Set the previous version back to current
    await queryRunner.query(`
      UPDATE analytics_schema_versions
      SET is_current = TRUE
      WHERE version = '1.0.0'
    `);
  }
}
