/**
 * Initial database schema migration
 * Creates the core tables for the Conceptus Veritas application
 */

/**
 * @param {import('knex')} knex - The Knex instance
 * @returns {Promise} A promise that resolves when migration is complete
 */
exports.up = function(knex) {
  return knex.transaction(async (trx) => {
    // Create users table
    await trx.schema.createTable('users', (table) => {
      table.uuid('id').primary().defaultTo(trx.raw('gen_random_uuid()'));
      table.string('email').notNullable().unique();
      table.string('username').notNullable().unique();
      table.string('password_hash').notNullable();
      table.string('full_name');
      table.text('bio');
      table.string('avatar_url');
      table.boolean('email_verified').defaultTo(false);
      table.jsonb('preferences').defaultTo('{}');
      table.timestamps(true, true);
    });

    // Create user_auth table for authentication data
    await trx.schema.createTable('user_auth', (table) => {
      table.uuid('id').primary().defaultTo(trx.raw('gen_random_uuid()'));
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.string('refresh_token_hash');
      table.timestamp('refresh_token_expires_at');
      table.string('reset_password_token_hash');
      table.timestamp('reset_password_expires_at');
      table.string('email_verification_token_hash');
      table.timestamp('email_verification_expires_at');
      table.timestamps(true, true);
    });

    // Create journals table
    await trx.schema.createTable('journals', (table) => {
      table.uuid('id').primary().defaultTo(trx.raw('gen_random_uuid()'));
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.string('title').notNullable();
      table.text('description');
      table.boolean('is_private').defaultTo(true);
      table.timestamps(true, true);
    });

    // Create journal_entries table
    await trx.schema.createTable('journal_entries', (table) => {
      table.uuid('id').primary().defaultTo(trx.raw('gen_random_uuid()'));
      table.uuid('journal_id').notNullable().references('id').inTable('journals').onDelete('CASCADE');
      table.string('title').notNullable();
      table.text('content').notNullable();
      table.jsonb('metadata').defaultTo('{}');
      table.timestamps(true, true);
      
      // Add a GIN index for full-text search on content
      table.specificType('content_vector', 'tsvector').index(null, 'GIN');
    });

    // Create concepts table
    await trx.schema.createTable('concepts', (table) => {
      table.uuid('id').primary().defaultTo(trx.raw('gen_random_uuid()'));
      table.string('name').notNullable().unique();
      table.text('description').notNullable();
      table.jsonb('metadata').defaultTo('{}');
      table.timestamps(true, true);
      
      // Add a GIN index for full-text search on description
      table.specificType('description_vector', 'tsvector').index(null, 'GIN');
    });

    // Create user_concepts table (for user's saved/favorited concepts)
    await trx.schema.createTable('user_concepts', (table) => {
      table.uuid('id').primary().defaultTo(trx.raw('gen_random_uuid()'));
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.uuid('concept_id').notNullable().references('id').inTable('concepts').onDelete('CASCADE');
      table.boolean('is_favorite').defaultTo(false);
      table.text('personal_notes');
      table.timestamps(true, true);
      
      // Unique constraint to prevent duplicate entries
      table.unique(['user_id', 'concept_id']);
    });

    // Create forum_categories table
    await trx.schema.createTable('forum_categories', (table) => {
      table.uuid('id').primary().defaultTo(trx.raw('gen_random_uuid()'));
      table.string('name').notNullable().unique();
      table.text('description');
      table.string('icon_url');
      table.integer('display_order').notNullable().defaultTo(0);
      table.timestamps(true, true);
    });

    // Create forum_topics table
    await trx.schema.createTable('forum_topics', (table) => {
      table.uuid('id').primary().defaultTo(trx.raw('gen_random_uuid()'));
      table.uuid('category_id').notNullable().references('id').inTable('forum_categories').onDelete('CASCADE');
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.string('title').notNullable();
      table.text('content').notNullable();
      table.boolean('is_pinned').defaultTo(false);
      table.boolean('is_locked').defaultTo(false);
      table.integer('view_count').defaultTo(0);
      table.timestamps(true, true);
      
      // Add a GIN index for full-text search on title and content
      table.specificType('topic_vector', 'tsvector').index(null, 'GIN');
    });

    // Create forum_posts table
    await trx.schema.createTable('forum_posts', (table) => {
      table.uuid('id').primary().defaultTo(trx.raw('gen_random_uuid()'));
      table.uuid('topic_id').notNullable().references('id').inTable('forum_topics').onDelete('CASCADE');
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.uuid('parent_post_id').references('id').inTable('forum_posts').onDelete('SET NULL');
      table.text('content').notNullable();
      table.boolean('is_solution').defaultTo(false);
      table.timestamps(true, true);
    });

    // Create quests table
    await trx.schema.createTable('quests', (table) => {
      table.uuid('id').primary().defaultTo(trx.raw('gen_random_uuid()'));
      table.string('title').notNullable();
      table.text('description').notNullable();
      table.string('difficulty').notNullable();
      table.integer('xp_reward').notNullable();
      table.jsonb('requirements').defaultTo('{}');
      table.timestamps(true, true);
    });

    // Create user_quests table
    await trx.schema.createTable('user_quests', (table) => {
      table.uuid('id').primary().defaultTo(trx.raw('gen_random_uuid()'));
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.uuid('quest_id').notNullable().references('id').inTable('quests').onDelete('CASCADE');
      table.string('status').notNullable().defaultTo('in_progress');
      table.jsonb('progress').defaultTo('{}');
      table.timestamp('completed_at');
      table.timestamps(true, true);
      
      // Unique constraint to prevent duplicate entries
      table.unique(['user_id', 'quest_id']);
    });

    // Create user_achievements table
    await trx.schema.createTable('user_achievements', (table) => {
      table.uuid('id').primary().defaultTo(trx.raw('gen_random_uuid()'));
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.string('achievement_type').notNullable();
      table.string('achievement_name').notNullable();
      table.text('description');
      table.jsonb('metadata').defaultTo('{}');
      table.timestamp('earned_at').notNullable().defaultTo(trx.fn.now());
      table.timestamps(true, true);
    });

    // Create notifications table
    await trx.schema.createTable('notifications', (table) => {
      table.uuid('id').primary().defaultTo(trx.raw('gen_random_uuid()'));
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.string('type').notNullable();
      table.string('title').notNullable();
      table.text('message');
      table.jsonb('data').defaultTo('{}');
      table.boolean('is_read').defaultTo(false);
      table.timestamps(true, true);
    });

    // Create functions and triggers for full-text search
    
    // Function to update content vector for journal entries
    await trx.raw(`
      CREATE OR REPLACE FUNCTION update_journal_entry_vector() RETURNS trigger AS $$
      BEGIN
        NEW.content_vector = to_tsvector('english', NEW.title || ' ' || NEW.content);
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    // Trigger for journal entries
    await trx.raw(`
      CREATE TRIGGER journal_entry_vector_update
      BEFORE INSERT OR UPDATE ON journal_entries
      FOR EACH ROW EXECUTE FUNCTION update_journal_entry_vector();
    `);
    
    // Function to update content vector for concepts
    await trx.raw(`
      CREATE OR REPLACE FUNCTION update_concept_vector() RETURNS trigger AS $$
      BEGIN
        NEW.description_vector = to_tsvector('english', NEW.name || ' ' || NEW.description);
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    // Trigger for concepts
    await trx.raw(`
      CREATE TRIGGER concept_vector_update
      BEFORE INSERT OR UPDATE ON concepts
      FOR EACH ROW EXECUTE FUNCTION update_concept_vector();
    `);
    
    // Function to update content vector for forum topics
    await trx.raw(`
      CREATE OR REPLACE FUNCTION update_forum_topic_vector() RETURNS trigger AS $$
      BEGIN
        NEW.topic_vector = to_tsvector('english', NEW.title || ' ' || NEW.content);
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    // Trigger for forum topics
    await trx.raw(`
      CREATE TRIGGER forum_topic_vector_update
      BEFORE INSERT OR UPDATE ON forum_topics
      FOR EACH ROW EXECUTE FUNCTION update_forum_topic_vector();
    `);
  });
};

/**
 * @param {import('knex')} knex - The Knex instance
 * @returns {Promise} A promise that resolves when rollback is complete
 */
exports.down = function(knex) {
  return knex.transaction(async (trx) => {
    // Drop triggers
    await trx.raw('DROP TRIGGER IF EXISTS forum_topic_vector_update ON forum_topics');
    await trx.raw('DROP TRIGGER IF EXISTS concept_vector_update ON concepts');
    await trx.raw('DROP TRIGGER IF EXISTS journal_entry_vector_update ON journal_entries');
    
    // Drop functions
    await trx.raw('DROP FUNCTION IF EXISTS update_forum_topic_vector');
    await trx.raw('DROP FUNCTION IF EXISTS update_concept_vector');
    await trx.raw('DROP FUNCTION IF EXISTS update_journal_entry_vector');
    
    // Drop tables in reverse order of creation (to handle foreign key constraints)
    await trx.schema.dropTableIfExists('notifications');
    await trx.schema.dropTableIfExists('user_achievements');
    await trx.schema.dropTableIfExists('user_quests');
    await trx.schema.dropTableIfExists('quests');
    await trx.schema.dropTableIfExists('forum_posts');
    await trx.schema.dropTableIfExists('forum_topics');
    await trx.schema.dropTableIfExists('forum_categories');
    await trx.schema.dropTableIfExists('user_concepts');
    await trx.schema.dropTableIfExists('concepts');
    await trx.schema.dropTableIfExists('journal_entries');
    await trx.schema.dropTableIfExists('journals');
    await trx.schema.dropTableIfExists('user_auth');
    await trx.schema.dropTableIfExists('users');
  });
}; 