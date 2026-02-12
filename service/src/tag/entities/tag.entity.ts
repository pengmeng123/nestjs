import { Article } from '@/article/entities/article.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { TagGroup } from './tag-group.entity';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @ManyToOne(() => TagGroup, (group) => group.tags)
  group: TagGroup;

  @ManyToMany(() => Article, (article) => article.tags)
  articles: Article[];
}
