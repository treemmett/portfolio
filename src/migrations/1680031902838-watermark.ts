import { MigrationInterface, QueryRunner } from 'typeorm';

export class watermark1680031902838 implements MigrationInterface {
  name = 'watermark1680031902838';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."sites_watermarkposition_enum" AS ENUM('0', '1', '2', '3')`
    );
    await queryRunner.query(
      `ALTER TABLE "sites" ADD "watermarkPosition" "public"."sites_watermarkposition_enum"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sites" DROP COLUMN "watermarkPosition"`);
    await queryRunner.query(`DROP TYPE "public"."sites_watermarkposition_enum"`);
  }
}
