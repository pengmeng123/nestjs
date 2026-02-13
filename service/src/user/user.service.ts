import { Injectable, BadRequestException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BusinessException } from '@/common/exceptions/business.exception';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository,
    @InjectRepository(UserProfile) private readonly userProfileRepository,
  ) {}
  findByUsername(name) {
    return this.userRepository.findOne({ where: { name } });
  }

  create(dto) {
    return this.userRepository.save(dto);
  }

  async updateProfile(userId, body) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BusinessException('用户不存在', 10002);
    }

    const profile = await this.userProfileRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!profile) {
      const newProfile = this.userProfileRepository.create({
        ...body,
        user: { id: userId },
      });
      await this.userProfileRepository.save(newProfile);
    } else {
      await this.userProfileRepository.update(profile.id, body);
    }
    return this.findOne(userId);
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['profile'],
    });
    return user;
  }

  async findAll() {
    return this.userRepository.find({ relations: ['profile'] });
  }

  async findOneByProfileId(id: number) {
    const profile = await this.userProfileRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    return profile;
  }
}
