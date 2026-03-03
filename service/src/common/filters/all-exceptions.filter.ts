import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';
import { BusinessException } from '../exceptions/business.exception';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // 处理 BusinessException
      if (exception instanceof BusinessException) {
        const res = exceptionResponse as { code: number; message: string };
        message = res.message;
        code = res.code;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        // 处理 class-validator 等返回的错误信息
        message = (exceptionResponse as any).message || exception.message;
        code = (exceptionResponse as any).code || status;
      } else {
        message = exception.message;
        code = status;
      }
    }

    const errorResponse: ApiResponse<null> = {
      code,
      message: Array.isArray(message) ? message[0] : message, // 如果是数组（如验证错误），取第一条
      data: null,
    };

    // 记录错误日志
    this.logger.error(
      `[${request.method}] ${request.url} - Code: ${code} - Message: ${errorResponse.message}`,
      exception instanceof Error ? exception.stack : null,
    );

    response.status(status).json(errorResponse);
  }
}
