import { Injectable, BadRequestException } from '@nestjs/common';
import { UserService } from '@/user/user.service';
import { RegisterDto } from './auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { BusinessException } from '@/common/exceptions/business.exception';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}
  async register(dto: RegisterDto) {
    const { name, password } = dto;
    const exists = await this.userService.findByUsername(name);

    if (exists) {
      throw new BusinessException('用户名已存在', 10001);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.userService.create({
      ...dto,
      password: hashedPassword,
    });
  }

  async login(dto) {
    const { name, password } = dto;
    const user = await this.userService.findByUsername(name);
    if (!user) {
      throw new BadRequestException('用户名或密码错误');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('用户名或密码错误');
    }
    const payload = { sub: user.id, username: user.name };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async getProfile(id: number) {
    // 排除 password 字段
    const user = await this.userService.findOne(id);
    if (user) {
      return {
        user: {
          ...user,
          ...(user.profile || {}),
          profile: undefined,
        },
      };
    }
    return null;
  }
}
