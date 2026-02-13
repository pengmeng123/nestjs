import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class BatchDeleteArticleDto {
  @IsNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  ids: number[];
}
