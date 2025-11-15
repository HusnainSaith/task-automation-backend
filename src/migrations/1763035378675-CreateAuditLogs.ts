import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuditLogs1763035378675 implements MigrationInterface {
  name = 'CreateAuditLogs1763035378675';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await (queryRunner as QueryRunner).query(`
      CREATE TABLE "audit_logs" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "company_id" uuid,
        "user_id" uuid,
        "action" text NOT NULL,
        "entity" text,
        "entity_id" uuid,
        "ip" inet,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "fk_audit_logs_company" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL,
        CONSTRAINT "fk_audit_logs_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await (queryRunner as QueryRunner).query(
      `CREATE INDEX "idx_audit_logs_company_created" ON "audit_logs" ("company_id","created_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await (queryRunner as QueryRunner).query(
      `DROP INDEX IF EXISTS "idx_audit_logs_company_created"`,
    );
    await (queryRunner as QueryRunner).query(`DROP TABLE "audit_logs"`);
  }
}
