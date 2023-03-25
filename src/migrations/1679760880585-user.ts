import { MigrationInterface, QueryRunner } from 'typeorm';

export class user1679760880585 implements MigrationInterface {
  name = 'user1679760880585';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "githubId" integer, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_42148de213279d66bf94b363bf" ON "users" ("githubId") `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_42148de213279d66bf94b363bf"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
