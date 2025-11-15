import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsers1763035326949 implements MigrationInterface {
  name = "CreateUsers1763035326949";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM ('owner','serviceman','client')`);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "company_id" uuid NOT NULL,
        "email" citext NOT NULL,
        "password_hash" text NOT NULL,
        "role" "public"."users_role_enum" NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "fk_users_company" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE UNIQUE INDEX "uq_users_company_email" ON "users" ("company_id","email")`);
    await queryRunner.query(`CREATE INDEX "idx_users_company_role" ON "users" ("company_id","role")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_users_company_role"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "uq_users_company_email"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."users_role_enum"`);
  }
}
