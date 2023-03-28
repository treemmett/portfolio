import { MigrationInterface, QueryRunner } from 'typeorm';

export class postPhotoCascade1680020863290 implements MigrationInterface {
  name = 'postPhotoCascade1680020863290';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_c0e6e8c4bd59e6e015fe7cb307e"`);
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_c0e6e8c4bd59e6e015fe7cb307e" FOREIGN KEY ("photoId") REFERENCES "photos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_c0e6e8c4bd59e6e015fe7cb307e"`);
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_c0e6e8c4bd59e6e015fe7cb307e" FOREIGN KEY ("photoId") REFERENCES "photos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }
}
