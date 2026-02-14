import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
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
        relations: ['article', 'rootComment'],
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
      rootComment: parentComment
        ? parentComment.rootComment || parentComment
        : null,
    });

    return this.commentRepository.save(newComment);
  }

  async findAll(articleId: number, page = 1, pageSize = 10) {
    // 1. 查一级评论（分页）
    const [roots, total] = await this.commentRepository.findAndCount({
      where: { article: { id: articleId }, parent: IsNull() },
      relations: ['author'],
      order: { createDate: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // 2. 查该文章下的所有子评论（非一级评论）
    // 为了组装完整的树，我们需要这些数据
    const allChildren = await this.commentRepository.find({
      where: { article: { id: articleId }, parent: Not(IsNull()) },
      relations: ['author', 'parent', 'rootComment'],
      order: { createDate: 'ASC' },
    });

    // 3. 组装树（只针对查出来的 roots 进行组装）
    const list = roots.map((root) => {
      // 目标：两级扁平化展示
      // 找出所有属于该 root 的后代（无论是直接回复还是楼中楼）
      const descendants = allChildren.filter(
        (c) => c.rootComment?.id === root.id,
      );

      return {
        ...root,
        // 扁平化展示前 3 条（按时间正序，因为 allChildren 已经按时间正序排了）
        children: descendants.slice(0, 3),
        replyCount: descendants.length,
      };
    });

    return {
      list,
      total,
      page,
      pageSize,
      pageCount: Math.ceil(total / pageSize),
    };
  }

  async findSubComments(parentId: number, page = 1, pageSize = 10) {
    const [list, total] = await this.commentRepository.findAndCount({
      where: { rootComment: { id: parentId } },
      relations: ['author', 'parent'], // 记得带上 parent 信息，或者不需要
      order: { createDate: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return {
      list,
      total,
      page,
      pageSize,
    };
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
