import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createServer } from 'vite'

test('Vite dev serves crawler files with correct types and the same content as the production build', async t => {
  const server = await createServer({
    logLevel: 'silent',
    server: { host: '127.0.0.1', port: 0, strictPort: false, watch: null },
  })
  t.after(() => server.close())
  await server.listen()
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`
  for (const [path, type] of [['/sitemap.xml', 'application/xml'], ['/robots.txt', 'text/plain'], ['/llms.txt', 'text/plain']]) {
    await t.test(path, async () => {
      const response = await fetch(origin + path)
      assert.equal(response.status, 200, path)
      assert.ok(response.headers.get('content-type')?.startsWith(type), `${path} must be ${type}, got ${response.headers.get('content-type')}`)
      assert.equal(await response.text(), await readFile(`dist${path}`, 'utf8'))
      const head = await fetch(origin + path + '?check=1', { method: 'HEAD' })
      assert.equal(head.status, 200)
      assert.ok(head.headers.get('content-type')?.startsWith(type))
      assert.equal(await head.text(), '')
    })
  }
  // The middleware must not consume normal app or source-module requests.
  const app = await fetch(origin + '/order')
  assert.equal(app.status, 200)
  assert.ok((await app.text()).includes('/src/main.tsx'))
})
