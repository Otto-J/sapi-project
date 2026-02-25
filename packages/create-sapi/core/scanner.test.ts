import { describe, it, expect } from 'bun:test'
import { scanRoutes } from './scanner'
import path from 'path'

const fixturesDir = path.resolve(import.meta.dir, '../test-fixtures/router')

describe('scanRoutes', () => {
  it('扫描路由目录返回路由列表', async () => {
    const routes = await scanRoutes(fixturesDir)
    expect(routes.length).toBe(2)
  })

  it('默认路由名称等于文件夹名', async () => {
    const routes = await scanRoutes(fixturesDir)
    const hello = routes.find(r => r.name === 'hello')
    expect(hello).toBeDefined()
    expect(hello!.route).toBe('hello')
  })

  it('config.json5 中的 route 字段覆盖路由名', async () => {
    const routes = await scanRoutes(fixturesDir)
    const xml = routes.find(r => r.name === 'parse-xml')
    expect(xml!.route).toBe('fun-parse-xml')
  })

  it('每个路由包含 handlerPath', async () => {
    const routes = await scanRoutes(fixturesDir)
    routes.forEach(r => {
      expect(r.handlerPath).toContain('index.ts')
    })
  })
})
