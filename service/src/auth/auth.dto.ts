import { IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @MinLength(6)
  password: string;
}
