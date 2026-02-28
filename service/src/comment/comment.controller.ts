import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AuthGuard } from '@/auth/auth.guard';
import { OptionalAuthGuard } from '@/auth/optional-auth.guard';
import { User } from '@/common/decorators/user.decorator';

@ApiTags('Comment')
@Controller('comment')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly jwtService: JwtService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createCommentDto: CreateCommentDto, @User() user) {
    return this.commentService.create(createCommentDto, user.sub);
  }

  @Get()
  @UseGuards(OptionalAuthGuard)
  findAll(
    @Query('articleId', ParseIntPipe) articleId: number,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @User() user,
  ) {
    return this.commentService.findAll(articleId, page, pageSize, user?.sub);
  }

  @Get('sub')
  @UseGuards(OptionalAuthGuard)
  findSubComments(
    @Query('parentId', ParseIntPipe) parentId: number,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @User() user,
  ) {
    return this.commentService.findSubComments(
      parentId,
      page,
      pageSize,
      user?.sub,
    );
  }

  @Post(':id/like')
  @UseGuards(AuthGuard)
  toggleLike(@Param('id', ParseIntPipe) id: number, @User() user) {
    return this.commentService.toggleLike(id, user.sub);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string, @User() user) {
    return this.commentService.remove(+id, user.sub);
  }
}
