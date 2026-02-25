# create-sapi — 开发指南

## 项目结构

```
create-sapi/
├── core/              ← 服务器源码（Hono + 路由加载器）
│   ├── index.ts       主入口
│   ├── scanner.ts     路由目录扫描
│   ├── router-loader.ts
│   ├── middleware-loader.ts
│   ├── dashboard.ts
│   └── reload.ts
├── template/          ← 用户项目模板（npx 时复制给用户）
│   ├── lib/
│   │   └── server.js  ← core/ 的 build 产物，不要手动编辑
│   ├── router/hello/  示例路由
│   ├── Dockerfile     用户自己构建镜像用
│   ├── docker-compose.yml
│   └── package.json
├── test-fixtures/     ← 测试夹具
├── index.mjs          ← CLI 入口（npx create-sapi 的执行文件）
├── tsconfig.json
└── package.json
```

## 开发工作流

### 修改服务器逻辑后必须 build

```bash
bun run build
```

build 脚本把 `core/index.ts` 打包成 `template/lib/server.js`（单文件，~93KB）。
**每次修改 `core/` 后都需要重新 build，否则用户拿到的是旧版本。**

### 本地测试

```bash
# 在 template/ 目录验证 build 产物
cd template
APP_DIR=$(pwd) DASHBOARD_TOKEN=test123 bun lib/server.js
curl http://localhost:3007/api/hello
```

### 运行测试

```bash
bun test core/
```

## 发布

```bash
# build 产物会自动生成（prepublishOnly 钩子）
npm publish --access public
```

发布的内容（`files` 字段控制）：
- `index.mjs` — CLI
- `template/` — 包含 build 好的 `lib/server.js` 和用户模板文件

## template/ 说明

`template/` 是用户通过 `npx @web.worker/create-sapi` 初始化后拿到的项目骨架。

- `lib/server.js` — 已打包的服务器，用户**不需要**也**不应该**修改
- `router/` — 用户在这里写业务逻辑
- `Dockerfile` — 用户自己 `docker build -t my-sapi .` 构建镜像

## 用户使用流程

```bash
npx @web.worker/create-sapi my-project
cd my-project
# 本地开发
DASHBOARD_TOKEN=secret bun run dev
# 生产部署
docker build -t my-sapi .
docker-compose up
```
