import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './auth.dto';
import { AuthGuard } from './auth.guard';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('/login')
  login(@Body() dto) {
    return this.authService.login(dto);
  }

  @UseGuards(AuthGuard)
  @Get('/profile')
  getProfile(@Request() req) {
    // req.user 只有 token 中的基本信息 (payload)
    // 需要根据 payload 中的 id 去数据库查询完整信息
    return this.authService.getProfile(req.user.sub);
  }
}
