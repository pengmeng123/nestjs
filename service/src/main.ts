import * as crypto from 'crypto';
// Polyfill for Node.js versions < 19 where global.crypto is not available
if (!global.crypto) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  global.crypto = crypto;
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  // 校验逻辑
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 自动剔除多余字段
      forbidNonWhitelisted: true, // 多传字段直接报错
      transform: true,
    }),
  );
  await app.listen(3000);
}
bootstrap();
