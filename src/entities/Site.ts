import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { User } from './User';
import { SiteNotFoundError } from '@utils/errors';

@Entity({ name: 'sites' })
export class Site extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @OneToOne('users', 'site', { nullable: false })
  @JoinColumn()
  public owner: User;

  @Column({ nullable: true, type: 'text' })
  @Index({ unique: true })
  public domain?: string | null;

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

  public logoFile?: File;

  public static async getByDomain(domain: string): Promise<Site> {
    const site = await Site.createQueryBuilder('site')
      .select()
      .leftJoin('site.owner', 'user')
      .addSelect('user.id')
      .addSelect('user.username')
      .where('site.domain = :domain', { domain })
      .getOne();

    if (!site) throw new SiteNotFoundError();

    return site;
  }

  public static async getByUsername(username: string): Promise<Site> {
    const site = await Site.createQueryBuilder('site')
      .select()
      .leftJoin('site.owner', 'user')
      .addSelect('user.id')
      .addSelect('user.username')
      .where('user.username = :username', { username })
      .getOne();

    if (!site) throw new SiteNotFoundError();

    return site;
  }
}

export type ISite = Omit<Site, keyof BaseEntity>;
