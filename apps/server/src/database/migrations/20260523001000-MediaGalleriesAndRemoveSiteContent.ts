import { MigrationInterface, QueryRunner } from 'typeorm';

export class MediaGalleriesAndRemoveSiteContent20260523001000 implements MigrationInterface {
  name = 'MediaGalleriesAndRemoveSiteContent20260523001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "studios" ADD COLUMN IF NOT EXISTS "photo_urls" jsonb NOT NULL DEFAULT '[]'::jsonb`);
    await queryRunner.query(`ALTER TABLE "masters" ADD COLUMN IF NOT EXISTS "photo_urls" jsonb NOT NULL DEFAULT '[]'::jsonb`);
    await queryRunner.query(`DROP TABLE IF EXISTS "site_content"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "site_content_type_enum"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "masters" DROP COLUMN IF EXISTS "photo_urls"`);
    await queryRunner.query(`ALTER TABLE "studios" DROP COLUMN IF EXISTS "photo_urls"`);
  }
}
