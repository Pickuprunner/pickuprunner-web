import pages from './site-pages.json'
import { APP_STORE_URL, PLAY_STORE_URL } from './appStores'
import { SUPPORT_EMAIL, BRAND_ICON, SERVICE_DESCRIPTION } from './brand'
import { FAQ } from '../pages/order/content'

export const SITE_URL = 'https://pickuprunner.net'
export const PUBLIC_PATHS = Object.keys(pages)
export { SERVICE_DESCRIPTION } from './brand'

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]!))

export function normalizePath(path: string) {
  return path.replace(/\/+$/, '') || '/'
}

export function pageMetadata(pathname: string) {
  const path = normalizePath(pathname)
  const page = pages[path as keyof typeof pages]
  const admin = path === '/admin' || path.startsWith('/admin/')
  return {
    path, indexable: Boolean(page),
    title: page?.title ?? (admin ? 'Admin Sign In | Pickup Runner' : 'Page Not Found | Pickup Runner'),
    description: page?.description ?? (admin ? 'Sign in to the Pickup Runner administration area.' : 'This page could not be found. Visit Pickup Runner for local delivery information and support.'),
    label: page?.label,
    type: page?.type,
    canonical: page ? SITE_URL + path : undefined,
  }
}

export function structuredData(pathname: string) {
  const page = pageMetadata(pathname)
  if (!page.indexable) return undefined
  const organizationId = SITE_URL + '/#organization'
  const websiteId = SITE_URL + '/#website'
  const serviceId = SITE_URL + '/#delivery-service'
  const appIds = ['ios', 'android'].map(platform => ({ '@id': SITE_URL + '/#app-' + platform }))
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'Organization', '@id': organizationId,
      name: 'Pickup Runner', legalName: 'Pickup Runner LLC', url: SITE_URL + '/',
      alternateName: 'PickupRunner', description: SERVICE_DESCRIPTION,
      logo: { '@type': 'ImageObject', '@id': SITE_URL + '/#logo', url: SITE_URL + BRAND_ICON, contentUrl: SITE_URL + BRAND_ICON, width: 512, height: 512 },
      email: SUPPORT_EMAIL,
      sameAs: [APP_STORE_URL, PLAY_STORE_URL],
      contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', email: SUPPORT_EMAIL, url: SITE_URL + '/contact' },
    },
    { '@type': 'WebSite', '@id': websiteId, name: 'Pickup Runner', alternateName: 'PickupRunner', url: SITE_URL + '/', publisher: { '@id': organizationId }, inLanguage: 'en' },
    {
      '@type': page.type, '@id': page.canonical + '#webpage', url: page.canonical,
      name: page.title, description: page.description, inLanguage: 'en',
      isPartOf: { '@id': websiteId }, publisher: { '@id': organizationId },
      about: { '@id': organizationId },
      ...(page.path === '/about' ? { mainEntity: { '@id': organizationId } } : {}),
      ...(page.path === '/' || page.path === '/order' ? { mainEntity: { '@id': serviceId } } : {}),
      ...(page.path === '/download' ? { mainEntity: appIds } : {}),
      ...(page.path !== '/' ? { breadcrumb: { '@id': page.canonical + '#breadcrumb' } } : {}),
    },
  ]
  if (page.path !== '/') graph.push({
    '@type': 'BreadcrumbList', '@id': page.canonical + '#breadcrumb',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Pickup Runner', item: SITE_URL + '/' },
      { '@type': 'ListItem', position: 2, name: page.label, item: page.canonical },
    ],
  })
  if (['/', '/order', '/about', '/download'].includes(page.path)) {
    graph.push({
      '@type': 'Service', '@id': serviceId, name: 'Pickup Runner local pickup and delivery',
      serviceType: 'Local pickup and delivery', description: SERVICE_DESCRIPTION,
      url: SITE_URL + '/order', provider: { '@id': organizationId },
    })
    for (const [operatingSystem, installUrl, suffix] of [['iOS', APP_STORE_URL, 'ios'], ['Android', PLAY_STORE_URL, 'android']]) {
      graph.push({
        '@type': 'MobileApplication', '@id': SITE_URL + '/#app-' + suffix,
        name: 'Pickup Runner: Local Delivery', alternateName: 'Pickup Runner', operatingSystem, installUrl, url: SITE_URL + '/download',
        applicationCategory: 'BusinessApplication', description: SERVICE_DESCRIPTION,
        image: SITE_URL + BRAND_ICON, publisher: { '@id': organizationId },
        about: { '@id': serviceId },
      })
    }
  }
  // Only mark up questions actually displayed on this page. No invented ratings,
  // service areas, prices, business address or promises of rich-result eligibility.
  if (page.path === '/order') graph.push({
    '@type': 'FAQPage', '@id': page.canonical + '#questions',
    mainEntity: FAQ.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  })
  return { '@context': 'https://schema.org', '@graph': graph }
}

/** One source for build-time head tags and metadata after client navigation. */
export function renderSeoHead(pathname: string) {
  const page = pageMetadata(pathname)
  const meta = (key: string, value: string, property = false) => `<meta data-seo ${property ? 'property' : 'name'}="${key}" content="${escapeHtml(value)}" />`
  const tags = [
    `<title data-seo>${escapeHtml(page.title)}</title>`,
    meta('description', page.description),
    meta('robots', page.indexable ? 'index, follow, max-image-preview:large' : 'noindex, follow'),
    meta('og:site_name', 'Pickup Runner', true), meta('og:type', 'website', true),
    meta('og:title', page.title, true), meta('og:description', page.description, true),
    meta('twitter:card', 'summary_large_image'), meta('twitter:title', page.title),
    meta('twitter:description', page.description),
  ]
  if (page.canonical) tags.push(`<link data-seo rel="canonical" href="${page.canonical}" />`, meta('og:url', page.canonical, true))
  if (page.indexable) tags.push(
    meta('og:image', SITE_URL + '/social-card.png', true),
    meta('og:image:width', '1200', true), meta('og:image:height', '630', true),
    meta('og:image:alt', 'Pickup Runner — Local pickup and delivery. Available on iPhone and Android.', true),
    meta('twitter:image', SITE_URL + '/social-card.png'),
    meta('twitter:image:alt', 'Pickup Runner — Local pickup and delivery.'),
  )
  const schema = structuredData(pathname)
  if (schema) tags.push(`<script data-seo type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`)
  return tags.join('\n')
}
