import { MigrationInterface, QueryRunner } from 'typeorm';

export class SoftDeleteAdminEntities20260523002000 implements MigrationInterface {
  name = 'SoftDeleteAdminEntities20260523002000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "masters" ADD COLUMN IF NOT EXISTS "deleted_at" timestamptz`);
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "deleted_at" timestamptz`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "masters" DROP COLUMN IF EXISTS "deleted_at"`);
  }
}
