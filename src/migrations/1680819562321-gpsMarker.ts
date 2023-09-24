import { MigrationInterface, QueryRunner } from 'typeorm';

export class gpsMarker1680819562321 implements MigrationInterface {
  name = 'gpsMarker1680819562321';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "gps_markers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created" TIMESTAMP NOT NULL DEFAULT now(), "updated" TIMESTAMP NOT NULL DEFAULT now(), "date" TIMESTAMP NOT NULL, "coordinate" geography(point) NOT NULL, "country" character varying(2) NOT NULL, "city" character varying NOT NULL, "ownerId" uuid NOT NULL, CONSTRAINT "PK_c244f86d053d66d22ed6d19f7cd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "gps_markers" ADD CONSTRAINT "FK_7cce4c3c533871d1a20010213be" FOREIGN KEY ("ownerId") REFERENCES "sites"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gps_markers" DROP CONSTRAINT "FK_7cce4c3c533871d1a20010213be"`,
    );
    await queryRunner.query(`DROP TABLE "gps_markers"`);
  }
}
