import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class site1679621988878 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        columns: [
          {
            isPrimary: true,
            name: 'id',
            type: 'uuid',
          },
          {
            isNullable: true,
            name: 'description',
            type: 'text',
          },
          {
            isNullable: true,
            name: 'name',
            type: 'text',
          },
          {
            isNullable: true,
            name: 'title',
            type: 'text',
          },
          {
            isNullable: true,
            name: 'imdb',
            type: 'text',
          },
          {
            isNullable: true,
            name: 'twitter',
            type: 'text',
          },
          {
            isNullable: true,
            name: 'linkedIn',
            type: 'text',
          },
          {
            isNullable: true,
            name: 'instagram',
            type: 'text',
          },
          {
            isNullable: true,
            name: 'github',
            type: 'text',
          },
          {
            isNullable: true,
            name: 'facebook',
            type: 'text',
          },
        ],
        name: 'sites',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('sites');
  }
}
