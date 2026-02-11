import { IsString, IsNotEmpty, Length } from 'class-validator';

export class RegisterDto {
  @IsString({ message: '用户名必须是字符串' })
  @IsNotEmpty({ message: '用户名不能为空' })
  @Length(3, 20, { message: '用户名长度 3-20 位' })
  name: string;

  @IsString()
  email: string;

  @Length(6, 32, { message: '密码长度 6-32 位' })
  password: string;
}
