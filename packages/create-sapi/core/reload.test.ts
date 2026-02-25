import { describe, it, expect, spyOn } from 'bun:test'
import { Hono } from 'hono'
import { mountReload } from './reload'

describe('reload endpoint', () => {
  it('无 token 返回 401', async () => {
    const app = new Hono()
    mountReload(app, 'secret')

    const res = await app.request('/internal/reload', { method: 'POST' })
    expect(res.status).toBe(401)
  })

  it('正确 token 返回 200 且消息含 restart', async () => {
    const app = new Hono()
    const exitSpy = spyOn(process, 'exit').mockImplementation((() => {}) as any)

    mountReload(app, 'secret')
    const res = await app.request('/internal/reload?token=secret', { method: 'POST' })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.message).toContain('restart')

    exitSpy.mockRestore()
  })
})
