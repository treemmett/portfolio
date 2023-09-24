import { MigrationInterface, QueryRunner } from 'typeorm';

export class owner1679762581596 implements MigrationInterface {
  name = 'owner1679762581596';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "photos" ADD "ownerId" uuid NOT NULL`);
    await queryRunner.query(
      // cspell:disable-next
      `ALTER TABLE "photos" ADD CONSTRAINT "UQ_556eedea27ffaf50a4ee0c0a058" UNIQUE ("ownerId")`,
    );
    await queryRunner.query(`ALTER TABLE "posts" ADD "ownerId" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "UQ_0e33434a2d18c89a149c8ad6d86" UNIQUE ("ownerId")`,
    );
    await queryRunner.query(`ALTER TABLE "sites" ADD "ownerId" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "sites" ADD CONSTRAINT "UQ_b00408635dde2a3b0cb6e57de17" UNIQUE ("ownerId")`,
    );
    await queryRunner.query(
      // cspell:disable-next
      `ALTER TABLE "photos" ADD CONSTRAINT "FK_556eedea27ffaf50a4ee0c0a058" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_0e33434a2d18c89a149c8ad6d86" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites" ADD CONSTRAINT "FK_b00408635dde2a3b0cb6e57de17" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sites" DROP CONSTRAINT "FK_b00408635dde2a3b0cb6e57de17"`);
    await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_0e33434a2d18c89a149c8ad6d86"`);
    await queryRunner.query(
      // cspell:disable-next
      `ALTER TABLE "photos" DROP CONSTRAINT "FK_556eedea27ffaf50a4ee0c0a058"`,
    );
    await queryRunner.query(`ALTER TABLE "sites" DROP CONSTRAINT "UQ_b00408635dde2a3b0cb6e57de17"`);
    await queryRunner.query(`ALTER TABLE "sites" DROP COLUMN "ownerId"`);
    await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "UQ_0e33434a2d18c89a149c8ad6d86"`);
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "ownerId"`);
    await queryRunner.query(
      // cspell:disable-next
      `ALTER TABLE "photos" DROP CONSTRAINT "UQ_556eedea27ffaf50a4ee0c0a058"`,
    );
    await queryRunner.query(`ALTER TABLE "photos" DROP COLUMN "ownerId"`);
  }
}
