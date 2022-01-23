import { File } from 'formidable';
import Jimp from 'jimp';
import { Column, Entity, getRepository, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'photos' })
export class Photo {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ nullable: false })
  public height: number;

  @Column({ nullable: false })
  public url: string;

  @Column({ nullable: false })
  public width: number;

  public static async upload(file: File): Promise<Photo> {
    if (!file) throw new Error('No photo to process');

    const image: Jimp = await new Promise((res, rej) => {
      Jimp.read(file.filepath, (err, img) => {
        if (err) {
          rej(err);
        } else {
          res(img);
        }
      });
    });

    const photo = new Photo();
    photo.height = image.bitmap.height;
    photo.url = file.filepath;
    photo.width = image.bitmap.width;

    return getRepository(Photo).save(photo);
  }
}
