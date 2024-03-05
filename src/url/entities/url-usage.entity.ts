import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Url } from './url.entity';

@Entity('url_usage')
export class UrlUsage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'url_id' })
  urlId: number;

  @CreateDateColumn({ name: 'accessed_at' })
  accessedAt: Date;

  @Column()
  ip: string;

  @Column({ name: 'user_agent' })
  userAgent: string;

  @ManyToOne(() => Url, (url) => url.usages, {
    onDelete: 'CASCADE',
    lazy: true,
  })
  @JoinColumn({ name: 'url_id' })
  url: Url;
}
