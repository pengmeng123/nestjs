import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { BatchDeleteArticleDto } from './dto/batch-delete-article.dto';
import { ArticleQueryDto } from './dto/article-query.dto';
import { AuthGuard } from '@/auth/auth.guard';
import { User } from '@/common/decorators/user.decorator';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @UseGuards(AuthGuard) // 只有登录用户才能发文章
  create(@Body() createArticleDto: CreateArticleDto, @User() user) {
    // user.sub 就是 userId
    return this.articleService.create(createArticleDto, user.sub);
  }

  // 必须放在 @Get(':id') 之前，否则 batch 会被当成 id
  @Delete('batch')
  removeBatch(@Body() batchDeleteDto: BatchDeleteArticleDto) {
    return this.articleService.removeBatch(batchDeleteDto.ids);
  }

  @Get()
  findAll(@Query() query: ArticleQueryDto) {
    return this.articleService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.articleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateArticleDto: UpdateArticleDto) {
    return this.articleService.update(+id, updateArticleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.articleService.remove(+id);
  }
}
