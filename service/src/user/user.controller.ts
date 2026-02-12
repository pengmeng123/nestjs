import { Controller, Get, Param, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { query } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  getUser() {
    return this.userService.findAll();
  }

  @Get(':id')
  getUserById(@Param('id') id: number) {
    return this.userService.findOne(id);
  }
}
