import { MigrationInterface, QueryRunner } from 'typeorm';

export class post1679706585667 implements MigrationInterface {
  name = 'post1679706585667';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      // cspell:disable-next
      `CREATE TABLE "posts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created" TIMESTAMP NOT NULL DEFAULT now(), "location" character varying, "updated" TIMESTAMP NOT NULL DEFAULT now(), "red" smallint NOT NULL, "green" smallint NOT NULL, "blue" smallint NOT NULL, "title" character varying, "photoId" uuid, CONSTRAINT "REL_c0e6e8c4bd59e6e015fe7cb307" UNIQUE ("photoId"), CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_c0e6e8c4bd59e6e015fe7cb307e" FOREIGN KEY ("photoId") REFERENCES "photos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_c0e6e8c4bd59e6e015fe7cb307e"`);
    await queryRunner.query(`DROP TABLE "posts"`);
  }
}
