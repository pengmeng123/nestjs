import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { User } from '@/user/entities/user.entity';
import { Comment } from './comment.entity';

@Entity()
@Index(['user', 'comment'], { unique: true }) // 联合唯一索引，防止重复点赞
export class CommentLike {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createDate: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Comment, { onDelete: 'CASCADE' })
  comment: Comment;
}
