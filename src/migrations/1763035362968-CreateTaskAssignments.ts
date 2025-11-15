import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTaskAssignments1763035362968 implements MigrationInterface {
  name = "CreateTaskAssignments1763035362968";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "task_assignments" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "task_id" uuid NOT NULL,
        "serviceman_id" uuid NOT NULL,
        "assigned_at" TIMESTAMPTZ NOT NULL,
        "accepted_at" TIMESTAMPTZ,
        "finished_at" TIMESTAMPTZ,
        "distance_meters" integer,
        "duration_seconds" integer,
        CONSTRAINT "fk_task_assignments_task" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_task_assignments_serviceman" FOREIGN KEY ("serviceman_id") REFERENCES "servicemen"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE UNIQUE INDEX "uq_task_assignments_task_serviceman" ON "task_assignments" ("task_id","serviceman_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "uq_task_assignments_task_serviceman"`);
    await queryRunner.query(`DROP TABLE "task_assignments"`);
  }
}
