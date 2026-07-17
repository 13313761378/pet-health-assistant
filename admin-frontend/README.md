# 宠物健康助手管理后台

第一版提供管理员登录、运营仪表盘，以及用户、宠物、家庭的只读查询。

## 本地启动

先在 `backend/.env` 设置首次管理员账号：

```env
ADMIN_INITIAL_USERNAME=admin
ADMIN_INITIAL_PASSWORD=请替换为强密码
```

管理员只会在 `admin_users` 为空时创建。不要把真实密码提交到 Git。

分别启动后端和管理端：

```powershell
cd backend
.\run-local.ps1

cd admin-frontend
npm install
npm run dev
```

管理端默认地址为 `http://127.0.0.1:5174`，开发服务器会将 `/api` 请求代理到 `http://127.0.0.1:8080`。

## 生产构建

```powershell
npm run build
```

产物位于 `admin-frontend/dist`。部署时应将 `/api` 反向代理到 Spring Boot 服务。
