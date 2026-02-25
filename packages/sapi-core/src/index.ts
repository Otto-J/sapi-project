#!/usr/bin/env bun
import { Hono } from 'hono'
import path from 'path'
import fs from 'fs/promises'
import { registerRoutes } from './router-loader'
import { loadMiddleware } from './middleware-loader'
import { mountDashboard } from './dashboard'
import { mountReload } from './reload'

const PORT = Number(process.env.PORT) || 3007
const BASE_URL = process.env.BASE_URL || 'api'
const DASHBOARD_TOKEN = process.env.DASHBOARD_TOKEN || 'changeme'
const APP_DIR = process.env.APP_DIR || '/app'
const ROUTER_DIR = path.join(APP_DIR, 'router')

async function start() {
  const app = new Hono()

  const middleware = await loadMiddleware(APP_DIR)
  if (middleware) {
    app.use('*', middleware as any)
    console.log('[sapi] 已加载全局中间件')
  }

  const routes = await registerRoutes(app, ROUTER_DIR, BASE_URL)
  console.log(`[sapi] 共加载 ${routes.length} 个路由`)

  let deps: Record<string, string> = {}
  try {
    const pkgRaw = await fs.readFile(path.join(APP_DIR, 'package.json'), 'utf-8')
    const pkg = JSON.parse(pkgRaw)
    deps = pkg.dependencies || {}
  } catch {
    // package.json 不存在时忽略
  }

  mountDashboard(app, { token: DASHBOARD_TOKEN, routes, deps, baseUrl: BASE_URL })
  mountReload(app, DASHBOARD_TOKEN)

  app.get('/health', (c) => c.json({ status: 'ok', routes: routes.length }))

  console.log(`[sapi] 服务启动于 http://localhost:${PORT}`)
  console.log(`[sapi] 仪表盘: http://localhost:${PORT}/dashboard?token=${DASHBOARD_TOKEN}`)

  return app
}

const app = await start()

export default {
  port: PORT,
  fetch: app.fetch,
}
