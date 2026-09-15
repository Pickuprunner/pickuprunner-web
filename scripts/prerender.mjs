import { build } from 'vite'
import { readFile, writeFile, rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

// Generate real HTML without a browser or an API call. Never render admin routes.
const serverDir = '.prerender'
await build({ build: { ssr: 'src/entry-server.tsx', outDir: serverDir, emptyOutDir: true }, logLevel: 'warn' })
const server = await import(pathToFileURL(resolve(serverDir, 'entry-server.js')))
const template = await readFile('dist/index.html', 'utf8')
const html = (path, body, prerendered) => template
  .replace(/<!-- SEO_START -->[\s\S]*?<!-- SEO_END -->/, `<!-- SEO_START -->\n${server.renderSeoHead(path)}\n<!-- SEO_END -->`)
  .replace('<div id="root"></div>', `<div id="root"${prerendered ? ' data-prerendered="true"' : ''}>${body}</div>`)

for (const path of server.PUBLIC_PATHS) {
  const body = await server.render(path)
  if (!body.includes('<h1')) throw new Error(`Prerender did not produce page content: ${path}`)
  await writeFile(path === '/' ? 'dist/index.html' : `dist${path}.html`, html(path, body, true))
}
await writeFile('dist/404.html', html('/page-not-found', await server.render('/page-not-found'), true))
// An empty noindex shell is intentional for authenticated, lazy-loaded screens.
await writeFile('dist/admin-shell.html', html('/admin', '', false))
for (const [path, file] of Object.entries(server.crawlerFiles())) {
  await writeFile('dist' + path, file.body)
}
await rm(serverDir, { recursive: true, force: true })
console.log(`Prerendered ${server.PUBLIC_PATHS.length} public pages, 404, admin shell, sitemap, robots.txt and llms.txt.`)
