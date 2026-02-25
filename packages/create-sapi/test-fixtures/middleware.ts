export default async function(c: any, next: any) {
  c.set('middleware-ran', true)
  await next()
}
