import { Injectable, BadRequestException } from '@nestjs/common';
import { UserService } from '@/user/user.service';
import { RegisterDto } from './auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}
  async register(dto: RegisterDto) {
    const { name, password } = dto;
    const exists = await this.userService.findByUsername(name);

    if (exists) {
      throw new BadRequestException('用户名已存在');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.userService.create({
      ...dto,
      password: hashedPassword,
    });
  }
}
