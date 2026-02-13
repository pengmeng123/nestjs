import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { Comment } from './entities/comment.entity';
import { ArticleModule } from '@/article/article.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Comment]), ArticleModule, AuthModule],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
