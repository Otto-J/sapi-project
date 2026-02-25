import { Hono } from 'hono'
import { scanRoutes, RouteEntry } from './scanner'

export async function registerRoutes(
  app: Hono,
  routerDir: string,
  baseUrl: string
): Promise<RouteEntry[]> {
  const routes = await scanRoutes(routerDir)

  for (const entry of routes) {
    const mod = await import(entry.handlerPath)
    const subApp: Hono = mod.default

    if (!subApp || typeof subApp.fetch !== 'function') {
      console.warn(`[sapi] ${entry.name}/index.ts 未导出有效的 Hono 应用，已跳过`)
      continue
    }

    app.route(`/${baseUrl}/${entry.route}`, subApp)
    console.log(`[sapi] 已注册路由: /${baseUrl}/${entry.route}`)
  }

  return routes
}
