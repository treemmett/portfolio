import { MigrationInterface, QueryRunner } from 'typeorm';

export class domain1679867824621 implements MigrationInterface {
  name = 'domain1679867824621';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sites" ADD "domain" text`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_4578b679503e1b86cc1c2531b9" ON "sites" ("domain") `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_4578b679503e1b86cc1c2531b9"`);
    await queryRunner.query(`ALTER TABLE "sites" DROP COLUMN "domain"`);
  }
}
