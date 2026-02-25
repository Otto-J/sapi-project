# SAPI — Simple API

用最少的配置把 TypeScript 路由函数部署成 HTTP API。

## 快速开始

```bash
npx @web.worker/create-sapi my-project
cd my-project
bun install
DASHBOARD_TOKEN=secret bun run dev
```

访问 `http://localhost:3007/api/hello` 验证服务正常。

打开 `http://localhost:3007/dashboard?token=secret` 查看仪表盘。

## 写路由

在 `router/` 下新建一个文件夹，放 `index.ts`：

```typescript
// router/users/index.ts
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => c.json({ users: [] }))
app.post('/', async (c) => {
  const body = await c.req.json()
  return c.json({ created: body }, 201)
})

export default app
```

服务启动后自动可访问 `/api/users`。

## 自定义路由路径

在路由文件夹内放 `config.json5`：

```json5
// router/users/config.json5
{ route: "v1/users" }   // 路由变为 /api/v1/users
```

## 全局中间件

在项目根目录放 `middleware.ts`，存在则自动加载：

```typescript
// middleware.ts
export default async function(c: any, next: any) {
  const token = c.req.header('Authorization')
  if (!token) return c.json({ error: 'Unauthorized' }, 401)
  await next()
}
```

## 静态文件

在项目根目录创建 `static/` 文件夹，里面的文件直接通过 `/` 访问：

```
static/
├── index.html    → http://localhost:3007/
├── app.js        → http://localhost:3007/app.js
└── logo.png      → http://localhost:3007/logo.png
```

`static/` 不存在时自动跳过，不影响 API 路由。

## 重启服务

修改代码后，在仪表盘点击"重启服务"，或：

```bash
curl -X POST "http://localhost:3007/internal/reload?token=secret"
```

服务会立即重启并加载最新代码，无需手动停止。

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `DASHBOARD_TOKEN` | `changeme` | 仪表盘和重载接口的访问密码 |
| `BASE_URL` | `api` | 所有路由的 URL 前缀 |
| `PORT` | `3007` | 监听端口 |

在项目根目录的 `.env` 文件中配置。

## 项目结构

```
my-project/
├── router/
│   └── hello/
│       ├── index.ts        路由处理逻辑
│       └── config.json5    可选，自定义路由路径
├── static/                 可选，静态文件
├── middleware.ts            可选，全局中间件
├── lib/
│   └── server.js           服务器（不要修改）
├── supervisor.mjs          进程守护（不要修改）
├── package.json
├── .env
├── Dockerfile
└── docker-compose.yml
```

## Docker 部署

```bash
# 首次部署
docker-compose up --build -d

# 更新代码后重新部署
git pull && docker-compose up --build -d
```

代码会在 `docker build` 时打进镜像，不依赖 volume mount。
