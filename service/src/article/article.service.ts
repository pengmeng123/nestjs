import { Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleQueryDto } from './dto/article-query.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { Repository, In } from 'typeorm';
import { CategoryService } from '@/category/category.service';
import { TagService } from '@/tag/tag.service';
import { BusinessException } from '@/common/exceptions/business.exception';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    private readonly categoryService: CategoryService,
    private readonly tagService: TagService,
  ) {}

  async create(createArticleDto: CreateArticleDto, userId: number) {
    const { title, content, categoryId, tagIds } = createArticleDto;

    // 1. 检查分类是否存在
    const category = await this.categoryService.findOne(categoryId);
    if (!category) {
      throw new BusinessException('分类不存在', 400);
    }

    // 2. 检查标签是否存在 (如果有传)
    let tagEntities = [];
    if (tagIds && tagIds.length > 0) {
      tagEntities = await this.tagService.findByIds(tagIds);
      if (tagEntities.length !== tagIds.length) {
        throw new BusinessException('部分标签不存在', 400);
      }
    }

    const newArticle = this.articleRepository.create({
      title,
      content,
      category: { id: categoryId },
      tags: tagEntities,
      author: { id: userId }, // 关联作者
    });

    return this.articleRepository.save(newArticle);
  }

  async findAll(query: ArticleQueryDto) {
    const { page = 1, pageSize = 10, categoryIds, tagIds } = query;

    /**
     * 1️⃣ 第一步：筛选 + 分页（只查 ID）
     * 这种写法的扩展性最好：
     * - 无论有多少个筛选条件，都在这里加 leftJoin + andWhere
     * - 不会影响最终返回数据的完整性（tags 不会变少）
     */
    const qb = this.articleRepository
      .createQueryBuilder('article')
      .select(['article.id', 'article.createDate']) // 只查 ID 和 排序字段，性能最高
      .leftJoin('article.category', 'category')
      .leftJoin('article.tags', 'tag');

    // 动态筛选
    if (categoryIds?.length) {
      qb.andWhere('category.id IN (:...categoryIds)', { categoryIds });
    }

    if (tagIds?.length) {
      qb.andWhere('tag.id IN (:...tagIds)', { tagIds });
    }

    // 分页 + 排序
    qb.orderBy('article.createDate', 'DESC')
      .distinct(true) // 关键：去重，防止多对多导致数量不对
      .skip((page - 1) * pageSize)
      .take(pageSize);

    // 获取 ID 列表
    const [idResult, total] = await qb.getManyAndCount();

    if (total === 0) {
      return {
        list: [],
        total,
        page,
        pageSize,
        pageCount: 0,
      };
    }

    const ids = idResult.map((item) => item.id);

    /**
     * 2️⃣ 第二步：根据 ID 加载完整数据
     * 这里不需要任何筛选条件，直接把关联数据全拉出来
     */
    const list = await this.articleRepository.find({
      where: { id: In(ids) },
      relations: ['category', 'tags', 'author'], // 在这里统一管理需要返回的关联字段
      order: { createDate: 'DESC' },
    });

    return {
      list,
      total,
      page,
      pageSize,
      pageCount: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: number) {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['category', 'tags'],
    });
    if (!article) {
      throw new BusinessException('文章不存在', 404);
    }
    return article;
  }

  async update(id: number, updateArticleDto: UpdateArticleDto) {
    const article = await this.findOne(id);

    if (!article) {
      throw new BusinessException('文章不存在', 404);
    }

    const { categoryId, tagIds, ...others } = updateArticleDto;

    // 如果更新了分类
    if (categoryId) {
      const category = await this.categoryService.findOne(categoryId);
      if (!category) {
        throw new BusinessException('分类不存在', 400);
      }
      article.category = category;
    }

    // 如果更新了标签
    if (tagIds) {
      const tagEntities = await this.tagService.findByIds(tagIds);
      if (tagEntities.length !== tagIds.length) {
        throw new BusinessException('部分标签不存在', 400);
      }
      article.tags = tagEntities;
    }

    // 合并其他字段
    this.articleRepository.merge(article, others);

    return this.articleRepository.save(article);
  }

  async remove(id: number) {
    const article = await this.articleRepository.findOne({ where: { id } });
    if (!article) {
      throw new BusinessException('文章不存在', 404);
    }
    return this.articleRepository.delete(id);
  }

  async removeBatch(ids: number[]) {
    // 直接删除，高效且原子
    const result = await this.articleRepository.delete({
      id: In(ids),
    });

    return {
      affected: result.affected,
      message: `成功删除了 ${result.affected} 篇文章`,
    };
  }
}
