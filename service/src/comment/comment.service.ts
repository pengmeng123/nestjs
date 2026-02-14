import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not, DataSource, In } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './entities/comment.entity';
import { CommentLike } from './entities/comment-like.entity';
import { ArticleService } from '@/article/article.service';
import { BusinessException } from '@/common/exceptions/business.exception';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(CommentLike)
    private readonly commentLikeRepository: Repository<CommentLike>,
    private readonly articleService: ArticleService,
    private readonly dataSource: DataSource,
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

  async findAll(articleId: number, page = 1, pageSize = 10, userId?: number) {
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
      relations: ['author', 'parent', 'parent.author', 'rootComment'],
      order: { createDate: 'ASC' },
    });

    // 批量查询点赞信息（包括：是否点赞、点赞用户列表）
    const commentLikesMap = new Map<number, CommentLike[]>();
    const allComments = [...roots, ...allChildren];

    if (allComments.length > 0) {
      // 警告：如果单条评论点赞数过万，这里会拉取大量数据。
      // 生产环境建议：在 Comment 实体冗余存储 latestLikedUsers (JSON)
      const allLikes = await this.commentLikeRepository.find({
        where: {
          comment: { id: In(allComments.map((c) => c.id)) },
        },
        relations: ['comment', 'user', 'user.profile'],
        order: { createDate: 'DESC' },
      });

      for (const like of allLikes) {
        const cid = like.comment.id;
        if (!commentLikesMap.has(cid)) commentLikesMap.set(cid, []);
        commentLikesMap.get(cid).push(like);
      }
    }

    console.log('commentLikesMap---', commentLikesMap);

    // 3. 组装树（只针对查出来的 roots 进行组装）
    const list = roots.map((root) => {
      // 目标：两级扁平化展示
      // 找出所有属于该 root 的后代（无论是直接回复还是楼中楼）
      const descendants = allChildren.filter(
        (c) => c.rootComment?.id === root.id,
      );

      const rootLikes = commentLikesMap.get(root.id) || [];
      const rootIsLiked = userId
        ? rootLikes.some((l) => l.user.id === userId)
        : false;
      const rootLikedUsers = rootLikes.slice(0, 3).map((l) => ({
        id: l.user.id,
        name: l.user.name,
        avatar: l.user.profile?.avatar,
      }));

      return {
        ...root,
        isLiked: rootIsLiked,
        likedUsers: rootLikedUsers,
        // 扁平化展示前 3 条（按时间正序，因为 allChildren 已经按时间正序排了）
        children: descendants.slice(0, 3).map((c) => {
          const cLikes = commentLikesMap.get(c.id) || [];
          return {
            ...c,
            isLiked: userId ? cLikes.some((l) => l.user.id === userId) : false,
            likedUsers: cLikes.slice(0, 3).map((l) => ({
              id: l.user.id,
              name: l.user.name,
              avatar: l.user.profile?.avatar,
            })),
          };
        }),
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

  async findSubComments(
    parentId: number,
    page = 1,
    pageSize = 10,
    userId?: number,
  ) {
    const [list, total] = await this.commentRepository.findAndCount({
      where: { rootComment: { id: parentId } },
      relations: ['author', 'parent', 'parent.author'], // 记得带上 parent 信息，或者不需要
      order: { createDate: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const commentLikesMap = new Map<number, CommentLike[]>();
    if (list.length > 0) {
      const allLikes = await this.commentLikeRepository.find({
        where: {
          comment: { id: In(list.map((c) => c.id)) },
        },
        relations: ['comment', 'user', 'user.profile'],
        order: { createDate: 'DESC' },
      });

      for (const like of allLikes) {
        const cid = like.comment.id;
        if (!commentLikesMap.has(cid)) commentLikesMap.set(cid, []);
        commentLikesMap.get(cid).push(like);
      }
    }

    const resultList = list.map((c) => {
      const likes = commentLikesMap.get(c.id) || [];
      return {
        ...c,
        isLiked: userId ? likes.some((l) => l.user.id === userId) : false,
        likedUsers: likes.slice(0, 3).map((l) => ({
          id: l.user.id,
          name: l.user.name,
          avatar: l.user.profile?.avatar,
        })),
      };
    });

    return {
      list: resultList,
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

  async toggleLike(commentId: number, userId: number) {
    //  ### 为什么必须用事务？
    // 点赞操作涉及两步数据库修改：

    // 1. Step A : 在 comment_like 表里插入（或删除）一条记录。
    // 2. Step B : 在 comment 表里把 likeCount 加 1（或减 1）。
    // 如果不由 dataSource 开事务来包裹：

    // - 假设 Step A 成功了，但 Step B 失败了（比如网络抖动）。
    // - 结果： comment_like 表里显示“我点赞了”，但 comment 表的总数没变。数据就 不一致 了。
    // 所以 DataSource 在这里的作用就是提供底层的事务控制能力，保证这两步操作 要么同时成功，要么同时失败 。
    // 检查评论是否存在
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });
    if (!comment) {
      throw new BusinessException('评论不存在', 404);
    }

    // 检查是否已点赞
    const existingLike = await this.commentLikeRepository.findOne({
      where: { comment: { id: commentId }, user: { id: userId } },
    });

    // 1. 借一个连接（每次请求都创建一个新的 runner）
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    // 2. 开启事务
    await queryRunner.startTransaction();

    try {
      if (existingLike) {
        // 取消点赞
        await queryRunner.manager.delete(CommentLike, existingLike.id);
        await queryRunner.manager.decrement(
          Comment,
          { id: commentId },
          'likeCount',
          1,
        );
      } else {
        // 点赞
        const newLike = this.commentLikeRepository.create({
          comment: { id: commentId },
          user: { id: userId },
        });
        await queryRunner.manager.save(newLike);
        await queryRunner.manager.increment(
          Comment,
          { id: commentId },
          'likeCount',
          1,
        );
      }
      //干活 3a. 提交
      await queryRunner.commitTransaction();
      return {
        isLiked: !existingLike,
        likeCount: existingLike ? comment.likeCount - 1 : comment.likeCount + 1,
      };
    } catch (err) {
      // 3b. 回滚
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // 4. 必须归还！否则连接池会耗尽
      await queryRunner.release();
    }
  }
}
