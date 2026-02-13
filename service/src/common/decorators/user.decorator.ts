import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // 我们的 AuthGuard 把解析后的 token payload 放到了 request.user 里
    // payload 结构: { sub: userId, username: string, iat: number, exp: number }
    return request.user;
  },
);
