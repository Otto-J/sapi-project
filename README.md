# SAPI — Simple API

基于 Docker 的个人 API 快速部署工具。用一个命令初始化项目，编写路由函数，点击重载即可上线。

## 快速开始

```bash
# 初始化新项目
npx create-sapi my-project
cd my-project

# 安装依赖
bun install
bun add -D sapi-core

# 本地开发
DASHBOARD_TOKEN=secret bun run dev
```

访问 `http://localhost:3007/dashboard?token=secret` 查看仪表盘。

## 项目结构

```
sapi-project/
├── packages/
│   ├── sapi-core/        Docker 镜像核心（Hono 服务 + 路由加载器）
│   ├── sapi-template/    用户项目模板
│   └── create-sapi/      npx 脚手架 CLI
├── pnpm-workspace.yaml
└── package.json
```

## 用户项目结构

通过 `create-sapi` 初始化的项目结构如下：

```
my-project/
├── router/
│   └── hello/
│       ├── index.ts        路由处理逻辑
│       └── config.json5    可选，自定义路由路径
├── middleware.ts            可选，全局中间件（JWT 验证等）
├── package.json
├── .env
└── docker-compose.yml
```

## 路由编写

每个路由是一个导出 Hono 子应用的 TypeScript 文件：

```typescript
// router/hello/index.ts
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => c.json({ message: 'Hello!' }))
app.post('/', async (c) => {
  const body = await c.req.json()
  return c.json({ echo: body })
})

export default app
```

默认路由地址为 `/{BASE_URL}/{文件夹名}`，例如 `/api/hello`。

### 自定义路由路径

```json5
// router/hello/config.json5
{
  route: "my-custom-path"   // 实际路由变为 /api/my-custom-path
}
```

### 全局中间件

```typescript
// middleware.ts（可选，存在则自动加载）
export default async function(c: any, next: any) {
  const token = c.req.header('Authorization')
  if (!token) return c.json({ error: 'Unauthorized' }, 401)
  await next()
}
```

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `DASHBOARD_TOKEN` | `changeme` | 仪表盘访问密码 |
| `BASE_URL` | `api` | 路由前缀 |
| `PORT` | `3007` | 监听端口 |

## 部署（Docker）

```bash
# docker-compose.yml 已包含在初始化模板中
docker-compose up -d
```

重载路由：访问仪表盘点击"重载路由"按钮，或：

```bash
curl -X POST "http://localhost:3007/internal/reload?token=secret"
```

服务会自动重启并加载所有最新路由（依赖 `restart: always`）。

## Monorepo 开发

```bash
# 安装所有依赖
pnpm install

# 启动 sapi-template 开发服务
pnpm dev

# 运行 sapi-core 测试
pnpm test
```

### 各包说明

**`packages/sapi-core`**

核心 Hono 服务，负责启动时扫描 `router/` 目录、加载中间件、提供仪表盘和重载接口。构建为 Docker 镜像发布。

**`packages/sapi-template`**

用户项目模板，包含示例路由和 `docker-compose.yml`。在 monorepo 内通过 `workspace:*` 引用 sapi-core。

**`packages/create-sapi`**

`npx create-sapi` 脚手架，将模板文件复制到用户指定目录并自动生成 `.env`。
