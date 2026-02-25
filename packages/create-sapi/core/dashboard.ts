import { Hono } from 'hono'
import { RouteEntry } from './scanner'

interface DashboardOptions {
  token: string
  routes: RouteEntry[]
  deps: Record<string, string>
  baseUrl: string
}

export function mountDashboard(app: Hono, opts: DashboardOptions) {
  app.get('/dashboard', (c) => {
    const queryToken = c.req.query('token')
    if (queryToken !== opts.token) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const routeRows = opts.routes
      .map(r => `<tr><td>/${opts.baseUrl}/${r.route}</td><td class="ok">✓ 已加载</td></tr>`)
      .join('\n')

    const depRows = Object.entries(opts.deps)
      .map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`)
      .join('\n')

    const html = `<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <title>SAPI Dashboard</title>
  <style>
    body { font-family: monospace; max-width: 800px; margin: 40px auto; padding: 0 20px; background: #0f0f0f; color: #e0e0e0; }
    h1 { display: flex; justify-content: space-between; align-items: center; }
    button { background: #3a86ff; color: white; border: none; padding: 8px 16px; cursor: pointer; font-family: monospace; font-size: 14px; }
    button:hover { background: #2563eb; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    td { padding: 8px 12px; border-bottom: 1px solid #2a2a2a; }
    h2 { color: #888; font-size: 14px; text-transform: uppercase; margin-top: 32px; }
    .ok { color: #4ade80; }
    #msg { color: #f59e0b; font-size: 13px; margin-top: 8px; }
  </style>
</head>
<body>
  <h1>SAPI Dashboard
    <button onclick="reload()">重载路由</button>
  </h1>
  <div id="msg"></div>

  <h2>路由列表</h2>
  <table>${routeRows}</table>

  <h2>当前依赖 (package.json)</h2>
  <table>${depRows}</table>

  <script>
    async function reload() {
      document.getElementById('msg').textContent = '正在重载...'
      const res = await fetch('/internal/reload?token=' + new URLSearchParams(location.search).get('token'), { method: 'POST' })
      if (res.ok) {
        document.getElementById('msg').textContent = '服务重启中，3 秒后刷新...'
        setTimeout(() => location.reload(), 3000)
      } else {
        document.getElementById('msg').textContent = '重载失败'
      }
    }
  </script>
</body>
</html>`

    return c.html(html)
  })
}
