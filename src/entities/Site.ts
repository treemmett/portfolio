import { Type } from 'class-transformer';
import { transformAndValidate } from 'class-transformer-validator';
import { IsOptional, ValidateNested } from 'class-validator';
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IPhoto, Photo } from './Photo';
import { PhotoType } from './PhotoType';
import type { IUser, User } from './User';
import { WatermarkPosition } from './WatermarkPosition';
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
  @OneToOne('photos', { nullable: true, onDelete: 'SET NULL' })
  @IsOptional()
  @JoinColumn()
  public logo?: Photo | null;

  @Type(() => Photo)
  @ValidateNested({ each: true })
  @ManyToMany('photos', { onDelete: 'SET NULL' })
  @JoinTable()
  public favicons: Photo[];

  @Column({
    enum: WatermarkPosition,
    nullable: true,
    type: 'enum',
  })
  public watermarkPosition?: WatermarkPosition | null;

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
      .leftJoin('site.favicons', 'favicon')
      .addSelect('favicon.id')
      .addSelect('favicon.height')
      .addSelect('favicon.width')
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
      .leftJoin('site.favicons', 'favicon')
      .addSelect('favicon.id')
      .addSelect('favicon.height')
      .addSelect('favicon.width')
      .addSelect('user.id')
      .addSelect('user.username')
      .where('user.username = :username', { username })
      .getOne();

    if (!site) throw new SiteNotFoundError();

    return transformAndValidate(Site, site, { validator: { skipMissingProperties: true } });
  }

  public async setLogo(photoToken: string): Promise<this> {
    const { image, photo } = await Photo.processUpload(this.owner, photoToken);

    // remove existing logos
    const existingLogos = this.favicons;
    if (this.logo) {
      existingLogos.push(this.logo);
    }

    await Promise.all(existingLogos.map((logo) => logo.delete()));

    // generate favicons
    const favicons = await Promise.all(
      [32, 60, 76, 120, 152, 196].map(async (size) => {
        const icon = await Photo.addPhoto(
          image.clone().resize(size, size, { fit: 'cover' }),
          this.owner,
          PhotoType.FAVICON
        );

        return icon.photo;
      })
    );

    this.logo = photo;
    this.favicons = favicons;
    await this.save();

    return this;
  }
}

export interface ISite
  extends Omit<
    Site,
    keyof BaseEntity | 'getByDomain' | 'getByUsername' | 'setLogo' | 'owner' | 'logo' | 'favicons'
  > {
  owner: IUser;
  logo: IPhoto;
  favicons: IPhoto[];
}
