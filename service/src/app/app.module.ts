import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/auth/auth.module';
import { User } from '@/user/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        // 优先级：后面的文件会覆盖前面的（比如 prod 配置覆盖默认）
        `.env.${process.env.NODE_ENV || 'development'}`, // 先加载指定环境的文件
        '.env', // 再加载默认文件（兜底）
      ],
    }),
    // 配置 MySQL 连接
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql', // 数据库类型
        host: 'localhost', // 数据库地址（本地）
        port: 3306, // MySQL 端口
        username: 'root', // 数据库用户名
        password: configService.get('PASSWORD'), // 数据库密码
        database: 'blogs', // 数据库名（需先在 MySQL 手动创建）
        // entities: [join(__dirname, '**', '*.entity.{ts,js}')], // 用 join 适配系统路径
        entities: [User],
        synchronize: configService.get('SYNCHRONIZE'), // 开发环境用（自动同步表结构），生产环境禁用！
        logging: true, // 打印 SQL 日志，方便调试
      }),
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
