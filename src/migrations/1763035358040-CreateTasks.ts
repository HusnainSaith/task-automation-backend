import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTasks1763035358040 implements MigrationInterface {
  name = "CreateTasks1763035358040";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."tasks_status_enum" AS ENUM ('pending','assigned','in_progress','completed','cancelled')`);

    await queryRunner.query(`
      CREATE TABLE "tasks" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "company_id" uuid NOT NULL,
        "problem_id" uuid NOT NULL,
        "location_id" uuid NOT NULL,
        "status" "public"."tasks_status_enum" NOT NULL DEFAULT 'pending',
        "priority" integer NOT NULL DEFAULT 0,
        "scheduled_at" TIMESTAMPTZ,
        "completed_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "fk_tasks_company" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_tasks_problem" FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_tasks_location" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_tasks_company_status" ON "tasks" ("company_id","status")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_tasks_company_status"`);
    await queryRunner.query(`DROP TABLE "tasks"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."tasks_status_enum"`);
  }
}
