import { MigrationInterface, QueryRunner } from 'typeorm';

export class enumRename1693817754134 implements MigrationInterface {
  name = 'enumRename1693817754134';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."photos_type_enum" RENAME VALUE '0' TO 'ORIGINAL'`
    );
    await queryRunner.query(`ALTER TYPE "public"."photos_type_enum" RENAME VALUE '1' TO 'LOGO'`);
    await queryRunner.query(`ALTER TYPE "public"."photos_type_enum" RENAME VALUE '2' TO 'FAVICON'`);

    await queryRunner.query(
      `ALTER TYPE "public"."sites_watermarkposition_enum" RENAME VALUE '0' TO 'TOP_LEFT'`
    );
    await queryRunner.query(
      `ALTER TYPE "public"."sites_watermarkposition_enum" RENAME VALUE '1' TO 'TOP_RIGHT'`
    );
    await queryRunner.query(
      `ALTER TYPE "public"."sites_watermarkposition_enum" RENAME VALUE '2' TO 'BOTTOM_LEFT'`
    );
    await queryRunner.query(
      `ALTER TYPE "public"."sites_watermarkposition_enum" RENAME VALUE '3' TO 'BOTTOM_RIGHT'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."photos_type_enum" RENAME VALUE 'ORIGINAL' TO '0'`
    );
    await queryRunner.query(`ALTER TYPE "public"."photos_type_enum" RENAME VALUE 'LOGO' TO '1'`);
    await queryRunner.query(`ALTER TYPE "public"."photos_type_enum" RENAME VALUE 'FAVICON' TO '2'`);

    await queryRunner.query(
      `ALTER TYPE "public"."sites_watermarkposition_enum" RENAME VALUE 'TOP_LEFT' TO '0'`
    );
    await queryRunner.query(
      `ALTER TYPE "public"."sites_watermarkposition_enum" RENAME VALUE 'TOP_RIGHT' TO '1'`
    );
    await queryRunner.query(
      `ALTER TYPE "public"."sites_watermarkposition_enum" RENAME VALUE 'BOTTOM_LEFT' TO '2'`
    );
    await queryRunner.query(
      `ALTER TYPE "public"."sites_watermarkposition_enum" RENAME VALUE 'BOTTOM_RIGHT' TO '3'`
    );
  }
}
