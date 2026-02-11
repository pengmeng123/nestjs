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
}
