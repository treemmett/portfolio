import { Type } from 'class-transformer';
import { transformAndValidate } from 'class-transformer-validator';
import { IsOptional, ValidateNested } from 'class-validator';
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Photo } from './Photo';
import type { User } from './User';
import { SiteNotFoundError } from '@utils/errors';

@Entity({ name: 'sites' })
export class Site extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @OneToOne('users', 'site', { nullable: false })
  @JoinColumn()
  public owner: User;

  @Type(() => Photo)
  @ValidateNested()
  @OneToOne('photos', { nullable: true })
  @IsOptional()
  @JoinColumn()
  public logo?: Photo | null;

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
      .leftJoinAndSelect('site.logo', 'logo')
      .addSelect('user.id')
      .addSelect('user.username')
      .where('site.domain = :domain', { domain })
      .getOne();

    if (!site) throw new SiteNotFoundError();

    return transformAndValidate(Site, site);
  }

  public static async getByUsername(username: string): Promise<Site> {
    const site = await Site.createQueryBuilder('site')
      .select()
      .leftJoin('site.owner', 'user')
      .leftJoinAndSelect('site.logo', 'logo')
      .addSelect('user.id')
      .addSelect('user.username')
      .where('user.username = :username', { username })
      .getOne();

    if (!site) throw new SiteNotFoundError();

    return transformAndValidate(Site, site);
  }

  public async setLogo(photoToken: string): Promise<this> {
    const { photo } = await Photo.processUpload(this.owner, photoToken);
    this.logo = photo;
    await this.save();
    return this;
  }
}

export type ISite = Omit<Site, keyof BaseEntity>;
