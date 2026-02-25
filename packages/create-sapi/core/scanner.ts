import path from 'path'
import fs from 'fs/promises'
import JSON5 from 'json5'

export interface RouteEntry {
  name: string
  route: string
  handlerPath: string
}

export async function scanRoutes(routerDir: string): Promise<RouteEntry[]> {
  let entries: string[]
  try {
    entries = await fs.readdir(routerDir)
  } catch {
    return []
  }

  const routes: RouteEntry[] = []

  for (const entry of entries) {
    const entryPath = path.join(routerDir, entry)
    const stat = await fs.stat(entryPath)
    if (!stat.isDirectory()) continue

    const handlerPath = path.join(entryPath, 'index.ts')
    try {
      await fs.access(handlerPath)
    } catch {
      continue
    }

    let routeName = entry
    const configPath = path.join(entryPath, 'config.json5')
    try {
      const raw = await fs.readFile(configPath, 'utf-8')
      const config = JSON5.parse(raw)
      if (config.route) routeName = config.route
    } catch {
      // config.json5 不存在，使用文件夹名
    }

    routes.push({ name: entry, route: routeName, handlerPath })
  }

  return routes
}
