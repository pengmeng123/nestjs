import { IsArray, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateArticleDto {
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  categoryId: number;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  tagIds?: number[];
}
