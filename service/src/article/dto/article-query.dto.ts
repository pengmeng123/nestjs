import { IsArray, IsInt, IsOptional, Min, IsNumber } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class ArticleQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize = 10;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((item) => Number(item));
    }
    if (Array.isArray(value)) {
      return value.map((item) => Number(item));
    }
    if (value) {
      return [Number(value)];
    }
    return [];
  })
  categoryIds?: number[];

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((item) => Number(item));
    }
    if (Array.isArray(value)) {
      return value.map((item) => Number(item));
    }
    if (value) {
      return [Number(value)];
    }
    return [];
  })
  tagIds?: number[];
}
