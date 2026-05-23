import { MigrationInterface, QueryRunner } from 'typeorm';

export class CrmAdminRebuild20260523000000 implements MigrationInterface {
  name = 'CrmAdminRebuild20260523000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "master_weekly_schedules" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "master_id" uuid NOT NULL REFERENCES "masters"("id") ON DELETE CASCADE,
        "studio_id" uuid NOT NULL REFERENCES "studios"("id") ON DELETE CASCADE,
        "day_of_week" integer NOT NULL,
        "interval_index" integer NOT NULL DEFAULT 0,
        "is_working" boolean NOT NULL DEFAULT true,
        "start_time" varchar(5),
        "end_time" varchar(5),
        "break_start_time" varchar(5),
        "break_end_time" varchar(5),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_master_weekly_schedule_master_day" ON "master_weekly_schedules" ("master_id", "day_of_week")`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "idx_master_weekly_schedule_unique_interval" ON "master_weekly_schedules" ("master_id", "day_of_week", "interval_index")`);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "master_date_availability_status_enum" AS ENUM ('available', 'unavailable', 'custom', 'vacation', 'sick', 'other');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "master_date_availability" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "master_id" uuid NOT NULL REFERENCES "masters"("id") ON DELETE CASCADE,
        "studio_id" uuid REFERENCES "studios"("id") ON DELETE SET NULL,
        "date" date NOT NULL,
        "status" "master_date_availability_status_enum" NOT NULL DEFAULT 'unavailable',
        "start_time" varchar(5),
        "end_time" varchar(5),
        "reason" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_master_date_availability_master_date" ON "master_date_availability" ("master_id", "date")`);

    await queryRunner.query(`ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "short_description" text`);
    await queryRunner.query(`ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "subscription_price_rub" integer`);
    await queryRunner.query(`ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "image_url" text`);
    await queryRunner.query(`ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "gallery_urls" jsonb NOT NULL DEFAULT '[]'::jsonb`);
    await queryRunner.query(`ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "contraindications" text`);
    await queryRunner.query(`ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "benefits" text`);
    await queryRunner.query(`ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "rules" text`);
    await queryRunner.query(`ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "seo_title" text`);
    await queryRunner.query(`ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "seo_description" text`);

  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN IF EXISTS "seo_description"`);
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN IF EXISTS "seo_title"`);
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN IF EXISTS "rules"`);
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN IF EXISTS "benefits"`);
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN IF EXISTS "contraindications"`);
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN IF EXISTS "gallery_urls"`);
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN IF EXISTS "image_url"`);
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN IF EXISTS "subscription_price_rub"`);
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN IF EXISTS "short_description"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "master_date_availability"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "master_date_availability_status_enum"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "master_weekly_schedules"`);
  }
}
