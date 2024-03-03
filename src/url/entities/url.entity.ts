import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class Url {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  originalUrl: string;

  /* @OneToMany(() => UrlUsage, (urlUsage) => urlUsage.url, {
    cascade: true,
  })
  usages: UrlUsage[];*/
}
