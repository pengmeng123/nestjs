import { IsNotEmpty, Length } from 'class-validator';

export class UserProfileDto {
  @IsNotEmpty({ message: '手机号不能为空' })
  @Length(11, 11, { message: '手机号长度为11位' })
  phone: string;
}
