import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLocations1763035347967 implements MigrationInterface {
  name = "CreateLocations1763035347967";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "locations" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "company_id" uuid,
        "address_line" text,
        "city" text,
        "country" text,
        "lat" numeric(9,6),
        "lng" numeric(9,6),
        "place_id" text,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "fk_locations_company" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`CREATE UNIQUE INDEX "uq_locations_place_id" ON "locations" ("place_id")`);
    await queryRunner.query(`CREATE INDEX "idx_locations_lat_lng" ON "locations" ("lat","lng")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_locations_lat_lng"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "uq_locations_place_id"`);
    await queryRunner.query(`DROP TABLE "locations"`);
  }
}
