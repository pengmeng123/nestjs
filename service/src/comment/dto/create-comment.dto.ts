import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty({ message: '评论内容不能为空' })
  @IsString()
  content: string;

  @IsNotEmpty({ message: '文章ID不能为空' })
  @IsNumber()
  articleId: number;

  @IsOptional()
  @IsNumber()
  parentId?: number;
}
