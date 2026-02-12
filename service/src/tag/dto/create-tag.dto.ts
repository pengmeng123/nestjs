import {
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTagDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  groupId?: number;
}

export class BatchCareteTagDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTagDto)
  tags: CreateTagDto[];
}
