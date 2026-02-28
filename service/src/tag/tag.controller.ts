import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TagService } from './tag.service';
import { CreateTagDto, BatchCareteTagDto } from './dto/create-tag.dto';

@ApiTags('Tag')
@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  create(@Body() createTagDto: CreateTagDto) {
    return this.tagService.create(createTagDto);
  }
  @Post('/batch')
  batchCreateTag(@Body() batchCreateTagDto: BatchCareteTagDto) {
    const { tags } = batchCreateTagDto;
    return this.tagService.batchCreateTag(tags);
  }

  @Put('/batch')
  batchUpdateTag(@Body() batchCreateTagDto: BatchCareteTagDto) {
    const { tags } = batchCreateTagDto;
    return this.tagService.batchUpdateTag(tags);
  }

  @Post('/group')
  createGroup(@Body() createTagDto: CreateTagDto) {
    return this.tagService.createGroup(createTagDto);
  }

  @Get('/all')
  findAll() {
    return this.tagService.findAll();
  }

  @Get('/group')
  findGroupAll() {
    return this.tagService.findGroupAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tagService.remove(+id);
  }
}
