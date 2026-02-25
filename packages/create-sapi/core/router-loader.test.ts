import { describe, it, expect } from 'bun:test'
import { Hono } from 'hono'
import { registerRoutes } from './router-loader'
import path from 'path'

const fixturesDir = path.resolve(import.meta.dir, '../test-fixtures/router')

describe('registerRoutes', () => {
  it('注册路由后 GET /api/hello 返回 200', async () => {
    const app = new Hono()
    await registerRoutes(app, fixturesDir, 'api')

    const res = await app.request('/api/hello')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.message).toBe('hello')
  })

  it('config.json5 别名生效：POST /api/fun-parse-xml 返回 200', async () => {
    const app = new Hono()
    await registerRoutes(app, fixturesDir, 'api')

    const res = await app.request('/api/fun-parse-xml', { method: 'POST' })
    expect(res.status).toBe(200)
  })

  it('返回已注册的路由条目列表', async () => {
    const app = new Hono()
    const routes = await registerRoutes(app, fixturesDir, 'api')
    expect(routes.length).toBe(2)
  })
})
