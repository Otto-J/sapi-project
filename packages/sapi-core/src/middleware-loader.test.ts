import { describe, it, expect } from 'bun:test'
import { loadMiddleware } from './middleware-loader'
import path from 'path'

const fixturesDir = path.resolve(import.meta.dir, '../test-fixtures')

describe('loadMiddleware', () => {
  it('middleware.ts 存在时返回函数', async () => {
    const mw = await loadMiddleware(fixturesDir)
    expect(typeof mw).toBe('function')
  })

  it('middleware.ts 不存在时返回 null', async () => {
    const mw = await loadMiddleware('/nonexistent/path')
    expect(mw).toBeNull()
  })
})
