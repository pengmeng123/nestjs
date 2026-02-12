import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
  ) {}

  findByUsername(name: string) {
    return this.userRepository.findOne({ where: { name } });
  }

  create(dto) {
    return this.userRepository.save(dto);
  }

  findOne(id: number) {
    return this.userRepository.findOne({
      where: { id },
      relations: ['profile'],
    });
  }

  async updateProfile(id: number, dto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (user.profile) {
      // 更新已有 profile
      await this.userProfileRepository.update(user.profile.id, dto);
    } else {
      // 创建新 profile
      const profile = this.userProfileRepository.create(dto);
      user.profile = profile;
      await this.userRepository.save(user);
    }

    return this.findOne(id);
  }
}
