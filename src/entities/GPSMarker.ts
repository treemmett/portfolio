import { Type } from 'class-transformer';
import { transformAndValidate } from 'class-transformer-validator';
import {
  IsDate,
  IsISO31661Alpha2,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import type { Point } from 'geojson';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 } from 'uuid';
import { ISite, Site } from './Site';

@Entity({ name: 'gps_markers' })
export class GPSMarker extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  public id: string;

  @CreateDateColumn()
  public created: Date;

  @UpdateDateColumn()
  public updated: Date;

  @IsDate()
  @Column()
  public date: Date;

  @Column({ spatialFeatureType: 'point', type: 'geography' })
  @IsNotEmpty()
  public coordinate: Point;

  @IsISO31661Alpha2()
  @Column({ length: 2 })
  public country: string;

  @Column()
  @IsString()
  public city: string;

  @Type(() => Site)
  @ValidateNested()
  @ManyToOne('sites', { nullable: false })
  public owner: Site;

  public static async checkIn(
    site: Site,
    date: Date,
    lat: number,
    lng: number,
    country: string,
    city: string
  ): Promise<GPSMarker> {
    const marker = new GPSMarker();
    marker.id = v4();
    marker.city = city;
    marker.country = country;
    marker.coordinate = {
      coordinates: [lng, lat],
      type: 'Point',
    };
    marker.date = date;
    marker.owner = site;

    const m = await transformAndValidate(GPSMarker, marker);
    await m.save();
    return m;
  }
}

export interface IMarker extends Omit<GPSMarker, keyof BaseEntity | 'owner'> {
  owner: ISite;
}
