import { PUBLIC_PATHS, SITE_URL, SERVICE_DESCRIPTION } from './seo'
import { APP_STORE_URL, PLAY_STORE_URL } from './appStores'
import { SUPPORT_EMAIL } from './brand'

/** Shared by the development server and the production prerender build. */
export function crawlerFiles(): Record<string, { contentType: string; body: string }> {
  return {
    '/sitemap.xml': {
      contentType: 'application/xml; charset=utf-8',
      body: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${PUBLIC_PATHS.map(path => `  <url><loc>${SITE_URL}${path}</loc></url>`).join('\n')}\n</urlset>\n`,
    },
    '/robots.txt': {
      contentType: 'text/plain; charset=utf-8',
      body: `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
    },
    '/llms.txt': {
      contentType: 'text/plain; charset=utf-8',
      body: `# Pickup Runner\n\n> ${SERVICE_DESCRIPTION}\n\nOfficial website: ${SITE_URL}/\nOperated by Pickup Runner LLC.\nSupport: ${SUPPORT_EMAIL}\n\n## Information\n\n- [Local delivery](${SITE_URL}/order): Booking steps, delivery pricing and frequently asked questions.\n- [Drive with Pickup Runner](${SITE_URL}/drivers): Driver requirements and application.\n- [Contact and coverage questions](${SITE_URL}/contact): Ask about availability in your city or ZIP code before booking.\n- [Privacy policy](${SITE_URL}/privacy)\n- [Terms of service](${SITE_URL}/terms)\n- [Account deletion](${SITE_URL}/delete-profile)\n\n## Official apps\n\n- [iPhone app](${APP_STORE_URL})\n- [Android app](${PLAY_STORE_URL})\n\n## Service notes\n\nPickup Runner only collects prepaid items. Runners do not shop or pay for goods. Deliveries are booked in the mobile app. This website provides information and enquiry forms. Service availability depends on location and driver availability; do not infer nationwide coverage. Check the app for the total before confirming an order.\n\nThis optional file is a navigation aid. Canonical web pages contain the authoritative service information. It does not provide a booking API or authorize an agent to place orders.\n`,
    },
  }
}
