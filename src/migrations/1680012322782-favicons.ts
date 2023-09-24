import { MigrationInterface, QueryRunner } from 'typeorm';

export class favicons1680012322782 implements MigrationInterface {
  name = 'favicons1680012322782';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "sites_favicons_photos" ("sitesId" uuid NOT NULL, "photosId" uuid NOT NULL, CONSTRAINT "PK_0c1914a234ab0a8474933f67af3" PRIMARY KEY ("sitesId", "photosId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_644cbd25b5502c11c9a4f4c37a" ON "sites_favicons_photos" ("sitesId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9266cd2ed6671dd63050807ddc" ON "sites_favicons_photos" ("photosId") `,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."photos_type_enum" RENAME TO "photos_type_enum_old"`,
    );
    await queryRunner.query(`CREATE TYPE "public"."photos_type_enum" AS ENUM('0', '1', '2')`);
    await queryRunner.query(
      `ALTER TABLE "photos" ALTER COLUMN "type" TYPE "public"."photos_type_enum" USING "type"::"text"::"public"."photos_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."photos_type_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "sites_favicons_photos" ADD CONSTRAINT "FK_644cbd25b5502c11c9a4f4c37a4" FOREIGN KEY ("sitesId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites_favicons_photos" ADD CONSTRAINT "FK_9266cd2ed6671dd63050807ddc8" FOREIGN KEY ("photosId") REFERENCES "photos"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites_favicons_photos" DROP CONSTRAINT "FK_9266cd2ed6671dd63050807ddc8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites_favicons_photos" DROP CONSTRAINT "FK_644cbd25b5502c11c9a4f4c37a4"`,
    );
    await queryRunner.query(`CREATE TYPE "public"."photos_type_enum_old" AS ENUM('0', '1')`);
    await queryRunner.query(
      `ALTER TABLE "photos" ALTER COLUMN "type" TYPE "public"."photos_type_enum_old" USING "type"::"text"::"public"."photos_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."photos_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."photos_type_enum_old" RENAME TO "photos_type_enum"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_9266cd2ed6671dd63050807ddc"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_644cbd25b5502c11c9a4f4c37a"`);
    await queryRunner.query(`DROP TABLE "sites_favicons_photos"`);
  }
}
