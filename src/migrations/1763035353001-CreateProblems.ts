import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProblems1763035353001 implements MigrationInterface {
  name = "CreateProblems1763035353001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."problems_status_enum" AS ENUM ('received','converted_to_task','closed')`);

    await queryRunner.query(`
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "problems"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."problems_status_enum"`);
  }
}
