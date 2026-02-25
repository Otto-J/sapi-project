import { Hono } from 'hono'
import path from 'path'
import fs from 'fs/promises'

export async function mountStatic(app: Hono, appDir: string): Promise<boolean> {
  const staticDir = path.join(appDir, 'static')

  try {
    await fs.access(staticDir)
  } catch {
    return false
  }

  app.use('/*', async (c, next) => {
    const reqPath = c.req.path === '/' ? 'index.html' : c.req.path.slice(1)
    const filePath = path.resolve(staticDir, reqPath)

    // 防止路径穿越
    if (!filePath.startsWith(staticDir + path.sep) && filePath !== staticDir) {
      return next()
    }

    const file = Bun.file(filePath)
    if (await file.exists()) {
      return new Response(file)
    }

    return next()
  })

  return true
}
