import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdminStudiosAndCertificateCancel20260524003000 implements MigrationInterface {
  name = 'AdminStudiosAndCertificateCancel20260524003000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "admin_studios" (
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "studio_id" uuid NOT NULL REFERENCES "studios"("id") ON DELETE CASCADE,
        CONSTRAINT "pk_admin_studios" PRIMARY KEY ("user_id", "studio_id")
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_admin_studios_user" ON "admin_studios" ("user_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_admin_studios_studio" ON "admin_studios" ("studio_id")`);
    await queryRunner.query(`
      ALTER TYPE "gift_certificates_status_enum" ADD VALUE IF NOT EXISTS 'CANCELLED'
    `);
    await queryRunner.query(`
      ALTER TYPE "payments_status_enum" ADD VALUE IF NOT EXISTS 'CANCELLED'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "admin_studios"`);
  }
}
