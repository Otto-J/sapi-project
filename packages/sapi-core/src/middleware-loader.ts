import path from 'path'
import fs from 'fs/promises'

export async function loadMiddleware(appDir: string): Promise<Function | null> {
  const middlewarePath = path.join(appDir, 'middleware.ts')
  try {
    await fs.access(middlewarePath)
    const mod = await import(middlewarePath)
    return mod.default ?? null
  } catch {
    return null
  }
}
