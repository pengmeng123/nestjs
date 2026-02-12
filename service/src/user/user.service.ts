import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private readonly userRepository) {}
  findByUsername(name) {
    return this.userRepository.findOne({ where: { name } });
  }

  create(dto) {
    return this.userRepository.save(dto);
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (user) {
      return {
        ...user,
        password: undefined,
      };
    }
    return user;
  }

  async findAll() {
    const users = await this.userRepository.find();
    return (users || []).map((user) => {
      return {
        ...user,
        password: undefined,
      };
    });
  }
}
