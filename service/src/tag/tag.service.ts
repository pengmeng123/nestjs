import { Injectable } from '@nestjs/common';
import { CreateTagDto, BatchCareteTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
import { TagGroup } from './entities/tag-group.entity';
import { BusinessException } from '@/common/exceptions/business.exception';
import { Repository, In } from 'typeorm';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag) private readonly tagRepository: Repository<Tag>,
    @InjectRepository(TagGroup)
    private readonly tagGroupRepository: Repository<TagGroup>,
  ) {}

  async findByIds(ids: number[]) {
    return this.tagRepository.find({
      where: {
        id: In(ids),
      },
    });
  }

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

  async batchUpdateTag(tags: CreateTagDto[]) {
    const results = [];

    for (const item of tags) {
      const existTag = await this.tagRepository.findOne({
        where: {
          name: item.name,
        },
      });
      if (existTag) {
        if (item.groupId !== undefined) {
          existTag.group = item.groupId
            ? ({ id: item.groupId } as TagGroup)
            : null;
          const saved = await this.tagRepository.save(existTag);
          results.push(saved);
          continue;
        }
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

  async createGroup(createTagDto: CreateTagDto) {
    const { name } = createTagDto;
    const group = await this.tagGroupRepository.findOne({
      where: {
        name,
      },
    });
    if (group?.id) {
      throw new BusinessException('分组已存在', 400);
    }
    return this.tagGroupRepository.save(createTagDto);
  }

  findAll() {
    return this.tagRepository.find({
      relations: ['group'],
    });
  }

  findGroupAll() {
    return this.tagGroupRepository.find({ relations: ['tags'] });
  }

  findOne(name) {
    return this.tagRepository.findOne({
      where: { name },
      relations: ['group'],
    });
  }

  async remove(id: number) {
    const tag = await this.tagRepository.findOne({ where: { id } });
    if (!tag) {
      throw new BusinessException('标签不存在', 400);
    }
    return this.tagRepository.delete(id);
  }
}
