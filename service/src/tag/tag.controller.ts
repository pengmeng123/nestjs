import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { CreateTagDto, BatchCareteTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post('/batch')
  batchCreateTag(@Body() batchCreateTagDto: BatchCareteTagDto) {
    const { tags } = batchCreateTagDto;
    return this.tagService.batchCreateTag(tags);
  }

  @Post('/group')
  create(@Body() createTagDto: CreateTagDto) {
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tagService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return this.tagService.update(+id, updateTagDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tagService.remove(+id);
  }
}
