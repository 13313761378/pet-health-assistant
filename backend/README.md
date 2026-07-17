# 宠物健康助手后端

后端基础工程采用 Java 21、Spring Boot 3、MyBatis-Plus、MySQL 8、JWT、Redis 和 MinIO。

## 已完成

- Maven Wrapper，可直接使用 `mvnw.cmd`，不依赖全局 Maven PATH。
- MySQL 核心表结构与 Flyway 自动迁移。
- Redis、MinIO 和 MySQL 连接配置。
- JWT 生成、解析与请求认证过滤器。
- 微信小程序 `code2Session` 登录、用户创建/更新与 JWT 签发。
- 系统健康检查接口 `GET /api/health`。
- 测试环境及基础自动化测试。

## 首次初始化

1. 使用 MySQL Workbench 以管理员身份连接本机 MySQL 8。
2. 打开 `database/create-database.sql`，将两处 `REPLACE_WITH_STRONG_PASSWORD` 替换为同一个强密码，然后执行脚本。
3. 将 `.env.example` 复制为 `.env`，填写相同的 `DB_PASSWORD`，并把 `JWT_SECRET` 改为至少 32 位的随机字符串。
4. 确认 Redis 和 MinIO 已启动：

   ```powershell
   docker compose --env-file ..\docker\.env -f ..\docker\docker-compose.yml up -d
   ```

## 启动

在 `backend` 目录运行：

```powershell
.\run-local.ps1
```

启动成功后访问：

- 系统健康检查：http://127.0.0.1:8080/api/health
- Spring Actuator：http://127.0.0.1:8080/actuator/health
- MinIO 控制台：http://127.0.0.1:9001

首次启动时 Flyway 会自动创建业务表。`/api/health` 返回 `UP` 表示 MySQL、Redis、MinIO 均可连接；返回 `DEGRADED` 时可查看各组件的错误信息。

## 测试与打包

```powershell
.\mvnw.cmd test
.\mvnw.cmd clean package
```

请勿提交 `backend/.env`、`docker/.env` 或任何真实密码。

## 微信登录配置

在微信公众平台取得小程序 AppID 和 AppSecret 后，只填写到 `backend/.env`：

```env
WECHAT_APP_ID=小程序AppID
WECHAT_APP_SECRET=小程序AppSecret
```

登录接口为 `POST /api/auth/wechat`：

```json
{
  "code": "wx.login 返回的临时 code",
  "nickname": "可选昵称",
  "avatarUrl": "可选头像地址"
}
```

登录成功会返回 `accessToken`。后续受保护接口需要携带请求头：

```text
Authorization: Bearer <accessToken>
```
