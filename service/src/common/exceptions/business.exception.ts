import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(
    message: string,
    code: number,
    statusCode: HttpStatus = HttpStatus.OK,
  ) {
    // 构造父类响应体：{ code, message }
    super({ code, message }, statusCode);
  }
}
