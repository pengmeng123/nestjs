# NestJS + TypeORM 进阶实战项目：全功能博客系统 (Blog CMS)

## 1. 项目概述
基于现有的用户系统，扩展构建一个多人博客内容管理系统。该项目将涵盖 NestJS 后端开发的绝大多数核心场景，重点练习 TypeORM 的各种关联关系处理以及 Redis 的缓存应用。

## 2. 功能模块与技术点映射

### 2.1 用户模块 (User Module) - 已有基础，需扩展
*   **功能**: 用户注册、登录、个人信息管理。
*   **新增需求**:
    *   **用户详情 (Profile)**: 扩展用户头像、简介等信息。
    *   **关联关系**: **一对一 (One-to-One)** -> `User` <-> `UserProfile`。

### 2.2 文章模块 (Article Module)
*   **功能**: 增删改查文章、文章列表、文章详情。
*   **关联关系**:
    *   **多对一 (Many-to-One)**: 文章属于一个作者 (`Article` -> `User`)。
    *   **多对一 (Many-to-One)**: 文章属于一个分类 (`Article` -> `Category`)。
    *   **多对多 (Many-to-Many)**: 文章可以有多个标签 (`Article` <-> `Tag`)。
*   **高级功能**:
    *   分页查询 (Pagination)。
    *   关键词搜索 (QueryBuilder / Like)。

### 2.3 分类与标签模块 (Category & Tag Module)
*   **功能**: 管理文章分类和标签。
*   **关联关系**:
    *   **一对多 (One-to-Many)**: 分类下包含多篇文章 (`Category` -> `Article`)。

### 2.4 评论模块 (Comment Module)
*   **功能**: 用户对文章发表评论。
*   **关联关系**:
    *   **多对一**: 评论属于文章。
    *   **多对一**: 评论属于用户。

### 2.5 Redis 缓存与性能优化
*   **功能**:
    *   **文章详情缓存**: 热点文章数据缓存，减少数据库查询。
    *   **阅读量计数**: 使用 Redis `INCR` 原子操作统计阅读数，定期同步回数据库。
    *   **Token 黑名单**: 登出功能实现。

### 2.6 权限控制 (RBAC)
*   **功能**: 管理员可以管理所有文章，普通用户只能管理自己的文章。
*   **技术**: 自定义 Guard + Decorator。

## 3. 数据库设计 (ER 图简述)

*   `users`: id, username, password, email...
*   `user_profiles`: id, user_id, bio, avatar...
*   `categories`: id, name...
*   `tags`: id, name...
*   `articles`: id, title, content, author_id, category_id, view_count...
*   `comments`: id, content, article_id, author_id...
*   `articles_tags`: (中间表) article_id, tag_id

## 4. 开发路线图 (Roadmap)
1.  **阶段一：基础扩展**
    *   创建 `UserProfile` 实体，实现 User 与 UserProfile 的一对一关联。
2.  **阶段二：核心内容管理**
    *   创建 `Category` 和 `Tag` 模块。
    *   创建 `Article` 模块，实现与 User, Category, Tag 的复杂关联。
3.  **阶段三：业务逻辑完善**
    *   实现文章的分页列表与详情查询。
    *   实现评论功能。
4.  **阶段四：性能与中间件**
    *   接入 Redis。
    *   实现文章缓存与阅读计数。









后续 NestJS 进阶学习计划
结合你刚才问的 Elasticsearch (ES)，建议按照以下阶段进行扩展，从功能完善走向架构演进。

第一阶段：工程化与文档完善（查漏补缺）
目标：让项目更规范，不仅“能跑”，而且“好维护”。

Swagger API 文档（最推荐优先做）

现状：目前可能靠手写文档或口头约定。
行动：集成 @nestjs/swagger，自动生成接口文档，让前端对接更爽。
关键词：@ApiTags, @ApiOperation, @ApiResponse。
日志系统（Logging）

现状：可能还在用 console.log。
行动：引入 winston 或 pino，实现结构化日志，按天切割日志文件，区分 info/error 级别。
关键词：NestInterceptor 记录请求耗时，ExceptionFilter 记录错误堆栈。
配置管理增强

现状：用了 @nestjs/config。
行动：使用 Joi 或 class-validator 对 .env 环境变量进行校验，防止配置缺失导致启动报错。
第二阶段：性能优化与数据进阶（引入中间件）
目标：解决性能瓶颈，应对大数据量。

Redis 缓存

场景：文章详情页、热门榜单。
行动：集成 @nestjs/cache-manager 和 redis，实现接口级缓存（@UseInterceptors(CacheInterceptor)）或手动缓存。
Elasticsearch 全文检索（你刚才问的）

场景：文章搜索（模糊匹配、高亮、分词）。
行动：
集成 @nestjs/elasticsearch。
实现数据同步：MySQL -> ES（Logstash 或 代码双写）。
实现搜索接口：替代原本低效的 LIKE '%keyword%'。
文件上传与存储

场景：用户头像、文章配图。
行动：使用 Multer 处理上传，对接阿里云 OSS / AWS S3 对象存储，而不是存在本地磁盘。
第三阶段：实时交互与后台任务
目标：增强用户体验，处理异步逻辑。

WebSocket (Socket.io)

场景：有人评论文章时，实时通知作者；即时聊天室。
行动：使用 @nestjs/platform-socket.io 实现 Gateway。
定时任务与队列

场景：每天凌晨统计阅读量、发送注册欢迎邮件。
行动：
简单任务：@nestjs/schedule (Cron Job)。
复杂任务/削峰填谷：@nestjs/bull (基于 Redis 的消息队列) 处理异步任务。
第四阶段：架构演进（微服务方向）
目标：应对超大规模业务，解耦系统。

微服务 (Microservices)

场景：把 auth 或 email 单独拆分成服务。
行动：尝试 gRPC 或 TCP 传输协议，学习 ClientProxy。
GraphQL

场景：前端需要灵活查询，不想每次改接口都找后端。
行动：使用 @nestjs/graphql + Apollo，体验与 RESTful 完全不同的开发模式（Schema First 或 Code First）。