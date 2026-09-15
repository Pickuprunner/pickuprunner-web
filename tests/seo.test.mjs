import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import worker from '../worker/index.mjs'
import pages from '../src/lib/site-pages.json' with { type: 'json' }

const files = new Map()
async function collect(directory = 'dist', prefix = '') {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) await collect(`${directory}/${entry.name}`, `${prefix}/${entry.name}`)
    else files.set(`${prefix}/${entry.name}`, await readFile(`${directory}/${entry.name}`))
  }
}
await collect()
const env = { ASSETS: { async fetch(request) {
  const path = new URL(request.url).pathname
  if (!files.has(path)) return new Response('Missing', { status: 404 })
  return new Response(request.method === 'HEAD' ? null : files.get(path), { headers: { 'Content-Type': path.endsWith('.html') ? 'text/html' : 'application/octet-stream' } })
} } }
const request = (path, options) => worker.fetch(new Request(`https://pickuprunner.net${path}`, options), env)
const textFor = path => files.get(path === '/' ? '/index.html' : path + '.html').toString()

test('all public pages have usable HTML before JavaScript, unique metadata and canonical URLs', () => {
  const titles = new Set()
  const descriptions = new Set()
  for (const [path, page] of Object.entries(pages)) {
    const html = textFor(path)
    assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, path)
    assert.ok(html.includes('data-prerendered="true"'), path)
    assert.ok(html.includes('<main'), path)
    assert.equal((html.slice(0, html.indexOf('</head>')).match(/<title[ >]/g) || []).length, 1, path)
    assert.ok(html.includes(`href="https://pickuprunner.net${path}"`), path)
    assert.ok(html.includes('index, follow, max-image-preview:large'), path)
    assert.ok(!html.includes('noindex'), path)
    assert.ok(!html.includes('href="#"'), path)
    titles.add(page.title); descriptions.add(page.description)
    const data = JSON.parse(html.match(/<script data-seo type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])
    assert.equal(data['@context'], 'https://schema.org')
    assert.ok(data['@graph'].some(item => item['@type'] === 'Organization'))
    assert.ok(!data['@graph'].some(item => item.aggregateRating || item.address || item.areaServed))
  }
  assert.equal(titles.size, Object.keys(pages).length)
  assert.equal(descriptions.size, Object.keys(pages).length)
})

test('FAQ answers in structured data match the content people can read', () => {
  const html = textFor('/order')
  const data = JSON.parse(html.match(/<script data-seo type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])
  const faq = data['@graph'].find(item => item['@type'] === 'FAQPage')
  const content = html.slice(html.indexOf('<body>')).replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&')
  for (const question of faq.mainEntity) {
    assert.ok(content.includes(question.name), question.name)
    assert.ok(content.includes(question.acceptedAnswer.text), question.name)
  }
})

test('every internal public link points to a built page and any anchor exists', () => {
  for (const path of Object.keys(pages)) {
    const html = textFor(path)
    for (const match of html.matchAll(/href="(\/[^"<>]*)"/g)) {
      const url = new URL(match[1].replace(/&amp;/g, '&'), 'https://pickuprunner.net')
      if (url.pathname.startsWith('/assets/') || /\.(?:svg|jpg|png)$/.test(url.pathname)) {
        assert.ok(files.has(url.pathname), `Missing asset ${url.pathname}`)
        continue
      }
      assert.ok(pages[url.pathname], `Broken link ${path} -> ${url.pathname}`)
      if (url.hash) assert.ok(textFor(url.pathname).includes(`id="${url.hash.slice(1)}"`), `Missing anchor ${match[1]}`)
    }
  }
})

test('brand and app identity are visible without JavaScript and use the official icon and listings', () => {
  const home = textFor('/')
  assert.match(home.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)[1], /Pickup Runner/)
  assert.match(home, /data-nosnippet=""/)
  for (const path of ['/about', '/download']) {
    const html = textFor(path)
    const body = html.slice(html.indexOf('<body>'))
    assert.ok(body.includes('Pickup Runner LLC'), path)
    assert.ok(body.includes('Pickup Runner: Local Delivery'), path)
    assert.ok(body.includes('id6807306109'), path)
    assert.ok(body.includes('id=com.pickuprunner'), path)
    assert.match(body, /prepaid|already be paid for/)
    assert.match(body, /select U\.S\. cities|select cities in the United States/)
    const graph = JSON.parse(html.match(/<script data-seo type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph']
    const org = graph.find(item => item['@type'] === 'Organization')
    const logoPath = new URL(org.logo.url).pathname
    assert.ok(files.get(logoPath).length > 1000)
    assert.ok(html.includes(`rel="icon" type="image/jpeg" sizes="512x512" href="${logoPath}"`))
    for (const app of graph.filter(item => item['@type'] === 'MobileApplication')) {
      assert.equal(app.publisher['@id'], org['@id'])
      assert.ok(org.sameAs.includes(app.installUrl))
      assert.equal(app.url, 'https://pickuprunner.net/download')
      assert.ok(body.includes(app.name))
    }
  }
})

test('sitemap includes exactly public canonical pages; crawler files and social card exist', () => {
  const urls = [...files.get('/sitemap.xml').toString().matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1])
  assert.deepEqual(urls.sort(), Object.keys(pages).map(path => 'https://pickuprunner.net' + path).sort())
  assert.ok(files.get('/robots.txt').toString().includes('Sitemap: https://pickuprunner.net/sitemap.xml'))
  assert.ok(files.get('/llms.txt').toString().includes('https://pickuprunner.net/order'))
  assert.ok(files.get('/social-card.png').length > 1000)
})

test('public routes return 200 and duplicate URL forms redirect to the canonical path', async () => {
  for (const path of Object.keys(pages)) {
    const response = await request(path)
    assert.equal(response.status, 200, path)
    assert.equal(response.headers.get('X-Robots-Tag'), null, path)
    assert.ok((await response.text()).includes('<h1'), path)
  }
  for (const [from, to] of [['/index.html', '/'], ['/order/', '/order'], ['/order.html', '/order'], ['/order/index.html', '/order']]) {
    const response = await request(from + '?source=test')
    assert.equal(response.status, 301, from)
    assert.equal(response.headers.get('location'), `https://pickuprunner.net${to}?source=test`)
  }
  const www = await worker.fetch(new Request('https://www.pickuprunner.net/order'), env)
  assert.equal(www.status, 301)
  assert.equal(www.headers.get('location'), 'https://pickuprunner.net/order')
})

test('missing routes and internal shell URLs are genuine noindex 404 responses', async () => {
  for (const path of ['/missing', '/admin-shell.html', '/404', '/404.html', '/assets/missing.js']) {
    const response = await request(path)
    assert.equal(response.status, 404, path)
    assert.ok(response.headers.get('X-Robots-Tag').includes('noindex'))
    assert.ok((await response.text()).includes('This one never arrived.'))
  }
})

test('admin deep links retain the app shell without public content or indexability', async () => {
  for (const path of ['/admin', '/admin/orders', '/admin/customers/example']) {
    const response = await request(path)
    const html = await response.text()
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('Cache-Control'), 'no-store')
    assert.ok(response.headers.get('X-Robots-Tag').includes('noindex'))
    assert.ok(html.includes('<div id="root"></div>'))
    assert.ok(!html.includes('application/ld+json'))
    assert.ok(!html.includes('rel="canonical"'))
  }
})

test('preview hosts are noindex; HEAD has no body and POST is not served HTML', async () => {
  const preview = await worker.fetch(new Request('http://localhost:8787/order'), env)
  assert.ok(preview.headers.get('X-Robots-Tag').includes('noindex'))
  const head = await request('/order', { method: 'HEAD' })
  assert.equal(head.status, 200)
  assert.equal(await head.text(), '')
  assert.equal((await request('/order', { method: 'POST' })).status, 405)
})
