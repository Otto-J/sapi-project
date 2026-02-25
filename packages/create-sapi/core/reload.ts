import { Hono } from 'hono'

export function mountReload(app: Hono, token: string) {
  app.post('/internal/reload', (c) => {
    const queryToken = c.req.query('token')
    if (queryToken !== token) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    setTimeout(() => process.exit(0), 100)
    return c.json({ message: 'restart in progress' })
  })
}
