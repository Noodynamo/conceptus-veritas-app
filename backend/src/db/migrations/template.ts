import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Example migration template that demonstrates the standard structure
 * Replace YYYYMMDD_HHMMSS with the actual timestamp
 * Replace DescriptiveName with a descriptive name for the migration
 * 
 * Naming convention: YYYYMMDD_HHMMSS_descriptive_name.ts
 * Example: 20230615_143022_add_user_preferences_table.ts
 */
export class YYYYMMDD_HHMMSS_DescriptiveName implements MigrationInterface {
  /**
   * Migration name - automatically generated from class name
   * Do not modify this as it's used for tracking applied migrations
   */
  public name = 'YYYYMMDD_HHMMSS_DescriptiveName';

  /**
   * Applies the migration
   * @param queryRunner The query runner to use
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Implement the forward migration logic here
    // Example: Creating a new table
    await queryRunner.query(`
      CREATE TABLE "example_table" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_example_table_id" PRIMARY KEY ("id")
      )
    `);

    // Example: Adding a column to an existing table
    // await queryRunner.query(`ALTER TABLE "existing_table" ADD "new_column" character varying`);

    // Example: Creating an index
    // await queryRunner.query(`CREATE INDEX "IDX_example_name" ON "example_table" ("name") `);

    // Example: Adding a foreign key
    // await queryRunner.query(`
    //   ALTER TABLE "example_table" 
    //   ADD CONSTRAINT "FK_example_other_table" 
    //   FOREIGN KEY ("other_id") 
    //   REFERENCES "other_table"("id") 
    //   ON DELETE NO ACTION 
    //   ON UPDATE NO ACTION
    // `);
  }

  /**
   * Reverts the migration
   * @param queryRunner The query runner to use
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Implement the rollback logic here
    // IMPORTANT: This should precisely undo what the up method does, in reverse order

    // Example: Dropping foreign keys first (if they exist in the up method)
    // await queryRunner.query(`ALTER TABLE "example_table" DROP CONSTRAINT "FK_example_other_table"`);

    // Example: Dropping indexes
    // await queryRunner.query(`DROP INDEX "IDX_example_name"`);

    // Example: Removing columns
    // await queryRunner.query(`ALTER TABLE "existing_table" DROP COLUMN "new_column"`);

    // Example: Dropping the table created in the up method
    await queryRunner.query(`DROP TABLE "example_table"`);
  }
} 