import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { UrlUsage } from './url-usage.entity';

@Entity()
export class Url {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'long_url' })
  longUrl: string;

  @Index({ unique: true })
  @Column()
  alias: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @Column({ name: 'hit_count', default: 0 })
  hitCount: number;

  @OneToMany(() => UrlUsage, (urlUsage) => urlUsage.url, {
    lazy: true,
  })
  usages: UrlUsage[];
}
