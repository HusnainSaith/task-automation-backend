import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTaskEvents1763035367691 implements MigrationInterface {
  name = "CreateTaskEvents1763035367691";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."task_events_type_enum" AS ENUM ('created','assigned','accepted','started','completed','cancelled','message','upload')`);

    await queryRunner.query(`
      CREATE TABLE "task_events" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "task_id" uuid NOT NULL,
        "actor_user_id" uuid,
        "type" "public"."task_events_type_enum" NOT NULL,
        "message" text,
        "meta" jsonb,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "fk_task_events_task" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_task_events_actor_user" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "task_events"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."task_events_type_enum"`);
  }
}


