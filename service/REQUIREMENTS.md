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
