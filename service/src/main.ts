import * as crypto from 'crypto';
// Polyfill for Node.js versions < 19 where global.crypto is not available
if (!global.crypto) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  global.crypto = crypto;
}

import { NestFactory, Reflector } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      /\.github\.io$/,
      process.env.CORS_ORIGIN || '',
    ].filter(Boolean) as any,
    credentials: true,
  });
  // 校验逻辑
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 自动剔除多余字段
      forbidNonWhitelisted: false, // 多传字段直接报错
      transform: true,
    }),
  );
  // 全局响应拦截器
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)), // 启用序列化拦截器
  );
  // 全局异常过滤器
  app.useGlobalFilters(new AllExceptionsFilter());

  // 配置 Swagger
  const config = new DocumentBuilder()
    .setTitle('Blog API')
    .setDescription('The Blog API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
}
void bootstrap();
