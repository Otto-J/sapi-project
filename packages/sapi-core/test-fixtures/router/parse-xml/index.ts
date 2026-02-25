import { Hono } from 'hono'
const app = new Hono()
app.post('/', (c) => c.json({ parsed: true }))
export default app
