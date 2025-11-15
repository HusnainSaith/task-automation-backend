import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLocationConstraints1763035380000 implements MigrationInterface {
  name = 'AddLocationConstraints1763035380000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await (queryRunner as QueryRunner).query(`
      ALTER TABLE "clients" 
      ADD CONSTRAINT "fk_clients_default_location" 
      FOREIGN KEY ("default_location_id") REFERENCES "locations"("id") ON DELETE SET NULL
    `);

    await (queryRunner as QueryRunner).query(`
      ALTER TABLE "servicemen" 
      ADD CONSTRAINT "fk_servicemen_home_base_location" 
      FOREIGN KEY ("home_base_location_id") REFERENCES "locations"("id") ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await (queryRunner as QueryRunner).query(`ALTER TABLE "servicemen" DROP CONSTRAINT IF EXISTS "fk_servicemen_home_base_location"`);
    await (queryRunner as QueryRunner).query(`ALTER TABLE "clients" DROP CONSTRAINT IF EXISTS "fk_clients_default_location"`);
  }
}