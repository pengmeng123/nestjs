import {
  Controller,
  Get,
  Param,
  Body,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserProfileDto } from './dto/user-profile.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(AuthGuard)
  getUser() {
    return this.userService.findAll();
  }

  @Get(':id')
  getUserById(@Param('id') id: number) {
    return this.userService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Put('/:id/profile')
  updateProfile(@Param('id') id: number, @Body() body: UserProfileDto) {
    return this.userService.updateProfile(id, body);
  }

  @Get('/profile/:profileId')
  getProfile(@Param('profileId') id: number) {
    return this.userService.findOneByProfileId(id);
  }
}
