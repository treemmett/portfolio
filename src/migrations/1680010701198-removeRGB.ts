import { MigrationInterface, QueryRunner } from 'typeorm';

export class removeRGB1680010701198 implements MigrationInterface {
  name = 'removeRGB1680010701198';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "red"`);
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "green"`);
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "blue"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "posts" ADD "blue" smallint NOT NULL`);
    await queryRunner.query(`ALTER TABLE "posts" ADD "green" smallint NOT NULL`);
    await queryRunner.query(`ALTER TABLE "posts" ADD "red" smallint NOT NULL`);
  }
}
