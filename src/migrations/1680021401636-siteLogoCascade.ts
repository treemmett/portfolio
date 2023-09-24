import { MigrationInterface, QueryRunner } from 'typeorm';

export class siteLogoCascade1680021401636 implements MigrationInterface {
  name = 'siteLogoCascade1680021401636';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sites" DROP CONSTRAINT "FK_30a2845f272f4b824a171ecd3be"`);
    await queryRunner.query(
      `ALTER TABLE "sites_favicons_photos" DROP CONSTRAINT "FK_644cbd25b5502c11c9a4f4c37a4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites" ADD CONSTRAINT "FK_30a2845f272f4b824a171ecd3be" FOREIGN KEY ("logoId") REFERENCES "photos"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites_favicons_photos" ADD CONSTRAINT "FK_644cbd25b5502c11c9a4f4c37a4" FOREIGN KEY ("sitesId") REFERENCES "sites"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites_favicons_photos" DROP CONSTRAINT "FK_644cbd25b5502c11c9a4f4c37a4"`,
    );
    await queryRunner.query(`ALTER TABLE "sites" DROP CONSTRAINT "FK_30a2845f272f4b824a171ecd3be"`);
    await queryRunner.query(
      `ALTER TABLE "sites_favicons_photos" ADD CONSTRAINT "FK_644cbd25b5502c11c9a4f4c37a4" FOREIGN KEY ("sitesId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites" ADD CONSTRAINT "FK_30a2845f272f4b824a171ecd3be" FOREIGN KEY ("logoId") REFERENCES "photos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
