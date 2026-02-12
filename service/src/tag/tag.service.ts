import { Injectable } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
import { TagGroup } from './entities/tag-group.entity';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag) private readonly tagRepository,
    @InjectRepository(TagGroup) private readonly tagGroupRepository,
  ) {}

  async create(createTagDto: CreateTagDto) {
    return 'This action adds a new tag';
  }

  async batchCreateTag(tags: CreateTagDto[]) {
    const results = [];
    for (const item of tags) {
      const existTag = await this.tagRepository.findOne({
        where: {
          name: item.name,
        },
      });
      if (existTag) {
        results.push(existTag);
        continue;
      }

      const newTag = this.tagRepository.create({
        name: item.name,
        group: item.groupId ? { id: item.groupId } : null,
      });
      const saved = await this.tagRepository.save(newTag);
      results.push(saved);
    }
    return results;
  }

  createGroup(createTagDto: CreateTagDto) {
    return this.tagGroupRepository.save(createTagDto);
  }

  findAll() {
    return this.tagRepository.find();
  }

  findGroupAll() {
    return this.tagGroupRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} tag`;
  }

  update(id: number, updateTagDto: UpdateTagDto) {
    return `This action updates a #${id} tag`;
  }

  remove(id: number) {
    return `This action removes a #${id} tag`;
  }
}
