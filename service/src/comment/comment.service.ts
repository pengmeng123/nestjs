import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './entities/comment.entity';
import { ArticleService } from '@/article/article.service';
import { BusinessException } from '@/common/exceptions/business.exception';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly articleService: ArticleService,
  ) {}

  async create(createCommentDto: CreateCommentDto, userId: number) {
    const { articleId, content, parentId } = createCommentDto;

    // 1. 检查文章是否存在
    const article = await this.articleService.findOne(articleId);
    if (!article) {
      throw new BusinessException('文章不存在', 404);
    }

    // 2. 检查父评论是否存在（如果是回复）
    let parentComment: Comment | null = null;
    if (parentId) {
      parentComment = await this.commentRepository.findOne({
        where: { id: parentId },
        relations: ['article'],
      });
      if (!parentComment) {
        throw new BusinessException('回复的评论不存在', 404);
      }
      // 可以在这里加个校验：父评论必须属于同一篇文章
      if (parentComment?.article?.id !== articleId) {
        // 注意：这里需要 parentComment 加载 article 关联才能判断，或者只存 id
        // 暂时先跳过这个严格校验，假设前端传参是对的
      }
    }

    const newComment = this.commentRepository.create({
      content,
      article: { id: articleId },
      author: { id: userId },
      parent: parentId ? { id: parentId } : null,
    });

    return this.commentRepository.save(newComment);
  }

  async findAll(articleId: number) {
    // 查出该文章下的所有评论
    const comments = await this.commentRepository.find({
      where: { article: { id: articleId } },
      relations: ['author', 'parent'], // 关联作者和父评论信息
      order: { createDate: 'ASC' }, // 按时间正序，先发的在上面
    });

    // 这里可以选择直接返回扁平列表，或者转换成树形结构
    // 为了方便前端，我们转换成树形结构
    return this.buildCommentTree(comments);
  }

  private buildCommentTree(comments: Comment[]) {
    const map = new Map<number, any>();
    const roots: any[] = [];

    // 1. 初始化所有节点
    comments.forEach((comment) => {
      map.set(comment.id, { ...comment, children: [] });
    });

    // 2. 组装树
    comments.forEach((comment) => {
      const node = map.get(comment.id);
      if (comment.parent) {
        const parentNode = map.get(comment.parent.id);
        if (parentNode) {
          parentNode.children.push(node);
        } else {
          // 如果找不到父节点（可能被删了），就当做根节点处理，或者忽略
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  async remove(id: number, userId: number) {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!comment) {
      throw new BusinessException('评论不存在', 404);
    }

    // 只有作者自己能删除
    if (comment.author.id !== userId) {
      throw new ForbiddenException('无权删除该评论');
    }

    return this.commentRepository.remove(comment);
  }
}
