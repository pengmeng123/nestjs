import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/auth/auth.module';
import { User } from '@/user/entities/user.entity';

@Module({
  imports: [
    // 配置 MySQL 连接
    TypeOrmModule.forRoot({
      type: 'mysql', // 数据库类型
      host: 'localhost', // 数据库地址（本地）
      port: 3306, // MySQL 端口
      username: 'root', // 数据库用户名
      password: 'aaa123456', // 数据库密码
      database: 'blogs', // 数据库名（需先在 MySQL 手动创建）
      // entities: [join(__dirname, '**', '*.entity.{ts,js}')], // 用 join 适配系统路径
      entities: [User],
      synchronize: true, // 开发环境用（自动同步表结构），生产环境禁用！
      logging: true, // 打印 SQL 日志，方便调试
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
