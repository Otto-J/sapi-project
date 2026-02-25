# SAPI 项目说明

基于 SAPI 框架的 API 服务。用户只需在 `router/` 目录下编写路由，框架自动加载并提供 HTTP 接口。

## 项目结构

```
my-project/
├── router/                 ← 在这里写业务逻辑
│   └── hello/
│       ├── index.ts        路由处理器（每个文件夹一个路由）
│       └── config.json5    可选，自定义路由路径
├── static/                 ← 可选，静态文件（直接通过 / 访问）
│   └── index.html
├── middleware.ts            可选，全局中间件（存在则自动加载）
├── lib/server.js           框架核心，不要修改
├── supervisor.mjs          进程守护，不要修改
├── .env                    环境变量
└── package.json
```

## 写路由

每个路由是 `router/<name>/index.ts`，导出一个 Hono 子应用：

```typescript
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => c.json({ data: [] }))
app.post('/', async (c) => {
  const body = await c.req.json()
  return c.json({ created: body }, 201)
})

export default app
```

路由地址为 `/{BASE_URL}/{文件夹名}`，默认 `BASE_URL=api`，所以 `router/users/` → `/api/users`。

### 自定义路由路径

```json5
// router/users/config.json5
{ route: "v1/users" }   // → /api/v1/users
```

### 全局中间件

项目根目录的 `middleware.ts` 会在所有路由前执行：

```typescript
export default async function(c: any, next: any) {
  const token = c.req.header('Authorization')
  if (!token) return c.json({ error: 'Unauthorized' }, 401)
  await next()
}
```

## 开发与部署

```bash
# 本地开发
DASHBOARD_TOKEN=secret bun run dev

# 修改代码后重启进程（仪表盘按钮或 curl）
curl -X POST "http://localhost:3007/internal/reload?token=secret"
```

仪表盘：`http://localhost:3007/dashboard?token=secret`

```bash
# 生产部署（代码打进镜像）
docker-compose up --build -d

# 更新部署（拉取新代码后重新构建）
git pull && docker-compose up --build -d
```

## 环境变量（.env）

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `DASHBOARD_TOKEN` | `changeme-please` | 仪表盘和重载接口密码 |
| `BASE_URL` | `api` | 路由 URL 前缀 |
| `PORT` | `3007` | 监听端口 |

## 注意事项

- **不要修改** `lib/server.js` 和 `supervisor.mjs`，这是框架文件
- 每个路由文件夹必须有 `index.ts` 且 `export default` 一个 Hono 实例
- 本地开发修改代码后需调用重启接口；Docker 部署修改代码后需重新构建镜像
- `middleware.ts` 不存在时跳过，不影响服务启动
- `static/` 目录不存在时跳过，存在则自动启用静态文件服务
