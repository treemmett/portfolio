import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'sites' })
export class Site extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ nullable: true })
  public description?: string;

  @Column({ nullable: true })
  public name?: string;

  @Column({ nullable: true })
  public title?: string;

  @Column({ nullable: true })
  public imdb?: string;

  @Column({ nullable: true })
  public twitter?: string;

  @Column({ nullable: true })
  public linkedIn?: string;

  @Column({ nullable: true })
  public instagram?: string;

  @Column({ nullable: true })
  public github?: string;

  @Column({ nullable: true })
  public facebook?: string;
}

export type ISite = Omit<Site, keyof BaseEntity>;
