import { MigrationInterface, QueryRunner } from 'typeorm';

export class siteLogo1680006548188 implements MigrationInterface {
  name = 'siteLogo1680006548188';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sites" ADD "logoId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "sites" ADD CONSTRAINT "UQ_30a2845f272f4b824a171ecd3be" UNIQUE ("logoId")`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."photos_type_enum" RENAME TO "photos_type_enum_old"`,
    );
    await queryRunner.query(`CREATE TYPE "public"."photos_type_enum" AS ENUM('0', '1')`);
    await queryRunner.query(
      `ALTER TABLE "photos" ALTER COLUMN "type" TYPE "public"."photos_type_enum" USING "type"::"text"::"public"."photos_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."photos_type_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "sites" ADD CONSTRAINT "FK_30a2845f272f4b824a171ecd3be" FOREIGN KEY ("logoId") REFERENCES "photos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sites" DROP CONSTRAINT "FK_30a2845f272f4b824a171ecd3be"`);
    await queryRunner.query(`CREATE TYPE "public"."photos_type_enum_old" AS ENUM('0')`);
    await queryRunner.query(
      `ALTER TABLE "photos" ALTER COLUMN "type" TYPE "public"."photos_type_enum_old" USING "type"::"text"::"public"."photos_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."photos_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."photos_type_enum_old" RENAME TO "photos_type_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "sites" DROP CONSTRAINT "UQ_30a2845f272f4b824a171ecd3be"`);
    await queryRunner.query(`ALTER TABLE "sites" DROP COLUMN "logoId"`);
  }
}
