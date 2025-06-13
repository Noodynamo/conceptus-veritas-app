import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

/**
 * Analytics Schema Tracking Migration
 * 
 * Creates tables for tracking analytics schema versions and changes
 */
export class CreateAnalyticsSchemaTracking20240701000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create analytics_schema_versions table
    await queryRunner.createTable(
      new Table({
        name: 'analytics_schema_versions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()'
          },
          {
            name: 'version',
            type: 'varchar',
            length: '20',
            isNullable: false
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true
          },
          {
            name: 'is_current',
            type: 'boolean',
            default: false
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()'
          },
          {
            name: 'created_by',
            type: 'varchar',
            length: '255',
            isNullable: true
          }
        ]
      }),
      true
    );

    // Create index on version
    await queryRunner.createIndex(
      'analytics_schema_versions',
      new TableIndex({
        name: 'IDX_analytics_schema_versions_version',
        columnNames: ['version']
      })
    );

    // Create analytics_event_schemas table
    await queryRunner.createTable(
      new Table({
        name: 'analytics_event_schemas',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()'
          },
          {
            name: 'schema_version_id',
            type: 'uuid',
            isNullable: false
          },
          {
            name: 'event_name',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'event_version',
            type: 'varchar',
            length: '20',
            isNullable: false
          },
          {
            name: 'category',
            type: 'varchar',
            length: '50',
            isNullable: false
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true
          },
          {
            name: 'schema_definition',
            type: 'jsonb',
            isNullable: false
          },
          {
            name: 'is_deprecated',
            type: 'boolean',
            default: false
          },
          {
            name: 'deprecated_reason',
            type: 'text',
            isNullable: true
          },
          {
            name: 'replaced_by',
            type: 'varchar',
            length: '100',
            isNullable: true
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()'
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()'
          }
        ],
        foreignKeys: [
          {
            columnNames: ['schema_version_id'],
            referencedTableName: 'analytics_schema_versions',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE'
          }
        ]
      }),
      true
    );

    // Create indices
    await queryRunner.createIndex(
      'analytics_event_schemas',
      new TableIndex({
        name: 'IDX_analytics_event_schemas_event_name',
        columnNames: ['event_name']
      })
    );

    await queryRunner.createIndex(
      'analytics_event_schemas',
      new TableIndex({
        name: 'IDX_analytics_event_schemas_category',
        columnNames: ['category']
      })
    );

    // Create analytics_schema_changes table
    await queryRunner.createTable(
      new Table({
        name: 'analytics_schema_changes',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()'
          },
          {
            name: 'event_schema_id',
            type: 'uuid',
            isNullable: false
          },
          {
            name: 'change_type',
            type: 'varchar',
            length: '50',
            isNullable: false
          },
          {
            name: 'description',
            type: 'text',
            isNullable: false
          },
          {
            name: 'previous_value',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'new_value',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()'
          },
          {
            name: 'created_by',
            type: 'varchar',
            length: '255',
            isNullable: true
          }
        ],
        foreignKeys: [
          {
            columnNames: ['event_schema_id'],
            referencedTableName: 'analytics_event_schemas',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE'
          }
        ]
      }),
      true
    );

    // Insert initial version record
    await queryRunner.query(`
      INSERT INTO analytics_schema_versions (version, description, is_current, created_by)
      VALUES ('1.0.0', 'Initial version with core event schemas', TRUE, 'system')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('analytics_schema_changes', true);
    await queryRunner.dropTable('analytics_event_schemas', true);
    await queryRunner.dropTable('analytics_schema_versions', true);
  }
} 