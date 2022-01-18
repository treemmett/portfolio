import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'posts' })
export class Photo {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ nullable: false })
  public height: number;

  @Column({ nullable: false })
  public url: string;

  @Column({ nullable: false })
  public width: number;
}
