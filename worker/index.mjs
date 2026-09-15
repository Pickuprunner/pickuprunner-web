import pages from '../src/lib/site-pages.json' with { type: 'json' }

const publicPaths = new Set(Object.keys(pages))

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const production = url.hostname === 'pickuprunner.net' || url.hostname === 'www.pickuprunner.net'
    if (production && (url.hostname !== 'pickuprunner.net' || url.protocol !== 'https:')) {
      url.hostname = 'pickuprunner.net'
      url.protocol = 'https:'
      return Response.redirect(url.toString(), 301)
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } })
    }
    const path = url.pathname
    const normalized = path.replace(/\/index(?:\.html)?$/, '/').replace(/\.html$/, '').replace(/\/+$/, '') || '/'
    if (publicPaths.has(normalized) && path !== normalized) {
      url.pathname = normalized
      return Response.redirect(url.toString(), 301)
    }
    const admin = path === '/admin' || path.startsWith('/admin/')
    const file = publicPaths.has(path) ? (path === '/' ? '/index.html' : path + '.html') : admin ? '/admin-shell.html' : path
    const assetUrl = new URL(url)
    assetUrl.pathname = file
    let response = await env.ASSETS.fetch(new Request(assetUrl, { method: request.method, headers: request.headers }))
    // Prevent internal shell URLs from becoming independently accessible pages.
    if (response.status === 404 || path === '/admin-shell.html' || path === '/404.html' || path === '/404') {
      assetUrl.pathname = '/404.html'
      const missing = await env.ASSETS.fetch(new Request(assetUrl, { method: request.method }))
      response = new Response(missing.body, { status: 404, headers: missing.headers })
    }
    const headers = new Headers(response.headers)
    headers.set('X-Content-Type-Options', 'nosniff')
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    if (admin || response.status === 404 || !production) headers.set('X-Robots-Tag', 'noindex, follow')
    if (admin) headers.set('Cache-Control', 'no-store')
    if (path.startsWith('/assets/') && response.status === 200) headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    return new Response(request.method === 'HEAD' ? null : response.body, { status: response.status, headers })
  },
}
