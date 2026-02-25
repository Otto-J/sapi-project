import { describe, it, expect } from 'bun:test'
import { Hono } from 'hono'
import { mountDashboard } from './dashboard'
import { RouteEntry } from './scanner'

const mockRoutes: RouteEntry[] = [
  { name: 'hello', route: 'hello', handlerPath: '/app/router/hello/index.ts' },
  { name: 'parse-xml', route: 'fun-parse-xml', handlerPath: '/app/router/parse-xml/index.ts' },
]

const mockDeps = { hono: '^4.0.0', json5: '^2.2.3' }

describe('dashboard', () => {
  it('无 token 访问返回 401', async () => {
    const app = new Hono()
    mountDashboard(app, { token: 'secret', routes: mockRoutes, deps: mockDeps, baseUrl: 'api' })

    const res = await app.request('/dashboard')
    expect(res.status).toBe(401)
  })

  it('错误 token 返回 401', async () => {
    const app = new Hono()
    mountDashboard(app, { token: 'secret', routes: mockRoutes, deps: mockDeps, baseUrl: 'api' })

    const res = await app.request('/dashboard?token=wrong')
    expect(res.status).toBe(401)
  })

  it('正确 token 返回 200 HTML 含路由和依赖', async () => {
    const app = new Hono()
    mountDashboard(app, { token: 'secret', routes: mockRoutes, deps: mockDeps, baseUrl: 'api' })

    const res = await app.request('/dashboard?token=secret')
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('SAPI Dashboard')
    expect(html).toContain('/api/hello')
    expect(html).toContain('/api/fun-parse-xml')
    expect(html).toContain('hono')
  })
})
