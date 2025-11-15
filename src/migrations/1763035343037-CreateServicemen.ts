import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateServicemen1763035343037 implements MigrationInterface {
  name = "CreateServicemen1763035343037";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "servicemen" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL UNIQUE,
        "current_active_tasks" integer NOT NULL DEFAULT 0,
        "max_concurrent_tasks" integer NOT NULL DEFAULT 2,
        "home_base_location_id" uuid,
        "skills" text[],
        "is_online" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "fk_servicemen_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_servicemen_is_online" ON "servicemen" ("is_online")`);
    await queryRunner.query(`CREATE INDEX "idx_servicemen_active_tasks" ON "servicemen" ("current_active_tasks")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_servicemen_active_tasks"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_servicemen_is_online"`);
    await queryRunner.query(`DROP TABLE "servicemen"`);
  }
}
