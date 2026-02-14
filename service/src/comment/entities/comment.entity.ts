import { Article } from '@/article/entities/article.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '@/user/entities/user.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @Column({ default: 0 })
  likeCount: number;

  @CreateDateColumn()
  createDate: Date;

  // 关联文章
  @ManyToOne(() => Article, (article) => article.comments, {
    onDelete: 'CASCADE',
  })
  article: Article;

  // 关联用户
  @ManyToOne(() => User, (user) => user.comments)
  author: User;

  // 自关联：父评论
  @ManyToOne(() => Comment, (comment) => comment.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  parent: Comment;

  // 自关联：子评论（回复）
  @OneToMany(() => Comment, (comment) => comment.parent)
  children: Comment[];

  // 根评论（为了方便查询某条根评论下的所有子孙评论）
  @ManyToOne(() => Comment, { nullable: true, onDelete: 'CASCADE' })
  rootComment: Comment;
}
