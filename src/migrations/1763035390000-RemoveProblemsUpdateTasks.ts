import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveProblemsUpdateTasks1763035390000 implements MigrationInterface {
  name = 'RemoveProblemsUpdateTasks1763035390000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add problem fields to tasks table
    await (queryRunner as QueryRunner).query(`
      ALTER TABLE "tasks" 
      ADD COLUMN "client_id" uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
      ADD COLUMN "title" text NOT NULL DEFAULT '',
      ADD COLUMN "description" text
    `);

    // Add foreign key constraint for client_id
    await (queryRunner as QueryRunner).query(`
      ALTER TABLE "tasks" 
      ADD CONSTRAINT "fk_tasks_client" 
      FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE
    `);

    // Drop foreign key constraint to problems table
    await (queryRunner as QueryRunner).query(`ALTER TABLE "tasks" DROP CONSTRAINT IF EXISTS "fk_tasks_problem"`);
    
    // Drop problem_id column
    await (queryRunner as QueryRunner).query(`ALTER TABLE "tasks" DROP COLUMN "problem_id"`);

    // Drop problems table
    await (queryRunner as QueryRunner).query(`DROP TABLE IF EXISTS "problems"`);
    await (queryRunner as QueryRunner).query(`DROP TYPE IF EXISTS "public"."problems_status_enum"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate problems table and enum
    await (queryRunner as QueryRunner).query(`CREATE TYPE "public"."problems_status_enum" AS ENUM ('received','converted_to_task','closed')`);
    
    await (queryRunner as QueryRunner).query(`
      CREATE TABLE "problems" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "company_id" uuid NOT NULL,
        "client_id" uuid NOT NULL,
        "location_id" uuid NOT NULL,
        "title" text NOT NULL,
        "description" text,
        "status" "public"."problems_status_enum" NOT NULL DEFAULT 'received',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "fk_problems_company" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_problems_client" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_problems_location" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT
      )
    `);

    // Add problem_id back to tasks
    await (queryRunner as QueryRunner).query(`ALTER TABLE "tasks" ADD COLUMN "problem_id" uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'`);
    await (queryRunner as QueryRunner).query(`ALTER TABLE "tasks" ADD CONSTRAINT "fk_tasks_problem" FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE`);

    // Remove problem fields from tasks
    await (queryRunner as QueryRunner).query(`ALTER TABLE "tasks" DROP CONSTRAINT IF EXISTS "fk_tasks_client"`);
    await (queryRunner as QueryRunner).query(`ALTER TABLE "tasks" DROP COLUMN "client_id"`);
    await (queryRunner as QueryRunner).query(`ALTER TABLE "tasks" DROP COLUMN "title"`);
    await (queryRunner as QueryRunner).query(`ALTER TABLE "tasks" DROP COLUMN "description"`);
  }
}