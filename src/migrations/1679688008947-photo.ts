import { MigrationInterface, QueryRunner } from 'typeorm';

export class photo1679688008947 implements MigrationInterface {
  name = 'photo1679688008947';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."photos_type_enum" AS ENUM('0')`);
    await queryRunner.query(
      `CREATE TABLE "photos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "height" integer NOT NULL, "size" integer NOT NULL, "thumbnailURL" character varying NOT NULL, "type" "public"."photos_type_enum" NOT NULL, "width" integer NOT NULL, CONSTRAINT "PK_5220c45b8e32d49d767b9b3d725" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`ALTER TABLE "sites" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
    await queryRunner.query(`ALTER TABLE "sites" DROP COLUMN "description"`);
    await queryRunner.query(`ALTER TABLE "sites" ADD "description" character varying`);
    await queryRunner.query(`ALTER TABLE "sites" DROP COLUMN "name"`);
    await queryRunner.query(`ALTER TABLE "sites" ADD "name" character varying`);
    await queryRunner.query(`ALTER TABLE "sites" DROP COLUMN "title"`);
    await queryRunner.query(`ALTER TABLE "sites" ADD "title" character varying`);
    await queryRunner.query(`ALTER TABLE "sites" DROP COLUMN "imdb"`);
    await queryRunner.query(`ALTER TABLE "sites" ADD "imdb" character varying`);
    await queryRunner.query(`ALTER TABLE "sites" DROP COLUMN "twitter"`);
    await queryRunner.query(`ALTER TABLE "sites" ADD "twitter" character varying`);
    await queryRunner.query(`ALTER TABLE "sites" DROP COLUMN "linkedIn"`);
    await queryRunner.query(`ALTER TABLE "sites" ADD "linkedIn" character varying`);
    await queryRunner.query(`ALTER TABLE "sites" DROP COLUMN "instagram"`);
    await queryRunner.query(`ALTER TABLE "sites" ADD "instagram" character varying`);
    await queryRunner.query(`ALTER TABLE "sites" DROP COLUMN "github"`);
    await queryRunner.query(`ALTER TABLE "sites" ADD "github" character varying`);
    await queryRunner.query(`ALTER TABLE "sites" DROP COLUMN "facebook"`);
    await queryRunner.query(`ALTER TABLE "sites" ADD "facebook" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sites" DROP COLUMN "facebook"`);
    await queryRunner.query(`ALTER TABLE "sites" ADD "facebook" text`);
    await queryRunner.query(`ALTER TABLE "sites" DROP COLUMN "github"`);
    await queryRunner.query(`ALTER TABLE "sites" ADD "github" text`);
    await queryRunner.query(`ALTER TABLE "sites" DROP COLUMN "instagram"`);
    await queryRunner.query(`ALTER TABLE "sites" ADD "instagram" text`);
    await queryRunner.query(`ALTER TABLE "sites" DROP COLUMN "linkedIn"`);
    await queryRunner.query(`ALTER TABLE "sites" ADD "linkedIn" text`);
    await queryRunner.query(`ALTER TABLE "sites" DROP COLUMN "twitter"`);
    await queryRunner.query(`ALTER TABLE "sites" ADD "twitter" text`);
    await queryRunner.query(`ALTER TABLE "sites" DROP COLUMN "imdb"`);
    await queryRunner.query(`ALTER TABLE "sites" ADD "imdb" text`);
    await queryRunner.query(`ALTER TABLE "sites" DROP COLUMN "title"`);
    await queryRunner.query(`ALTER TABLE "sites" ADD "title" text`);
    await queryRunner.query(`ALTER TABLE "sites" DROP COLUMN "name"`);
    await queryRunner.query(`ALTER TABLE "sites" ADD "name" text`);
    await queryRunner.query(`ALTER TABLE "sites" DROP COLUMN "description"`);
    await queryRunner.query(`ALTER TABLE "sites" ADD "description" text`);
    await queryRunner.query(`ALTER TABLE "sites" ALTER COLUMN "id" DROP DEFAULT`);
    await queryRunner.query(`DROP TABLE "photos"`);
    await queryRunner.query(`DROP TYPE "public"."photos_type_enum"`);
  }
}
