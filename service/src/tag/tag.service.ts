import { Injectable } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
import { TagGroup } from './entities/tag-group.entity';
import { BusinessException } from '@/common/exceptions/business.exception';
import { group } from 'console';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag) private readonly tagRepository,
    @InjectRepository(TagGroup) private readonly tagGroupRepository,
  ) {}

  async create(createTagDto: CreateTagDto) {
    const { name, groupId } = createTagDto;
    const tag = await this.findOne(name);
    if (tag) {
      throw new BusinessException('标签已存在', 400);
    }
    return this.tagRepository.save({
      name,
      group: groupId ? { id: groupId } : null,
    });
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
    return this.tagGroupRepository.find({ relations: ['tags'] });
  }

  findOne(name) {
    return this.tagRepository.findOne({
      where: { name },
    });
  }

  update(id: number, updateTagDto: UpdateTagDto) {
    return `This action updates a #${id} tag`;
  }

  remove(id: number) {
    return `This action removes a #${id} tag`;
  }
}
