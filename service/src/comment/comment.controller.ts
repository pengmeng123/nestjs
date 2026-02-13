import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AuthGuard } from '@/auth/auth.guard';
import { User } from '@/common/decorators/user.decorator';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createCommentDto: CreateCommentDto, @User() user) {
    return this.commentService.create(createCommentDto, user.sub);
  }

  @Get()
  findAll(@Query('articleId', ParseIntPipe) articleId: number) {
    return this.commentService.findAll(articleId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string, @User() user) {
    return this.commentService.remove(+id, user.sub);
  }
}
