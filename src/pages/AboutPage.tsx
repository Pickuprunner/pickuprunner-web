import { Link } from '@tanstack/react-router'
import { BRAND_ICON, SERVICE_DESCRIPTION, SUPPORT_EMAIL } from '../lib/brand'
import { StoreButtons } from '../components/StoreButtons'

export function AboutPage() {
  return (
    <article className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="flex items-center gap-4 mb-6">
        <img src={BRAND_ICON} alt="Pickup Runner app icon" width={80} height={80} className="rounded-2xl" />
        <p className="text-sm font-semibold text-primary">Pickup Runner LLC</p>
      </div>
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-10">About Pickup Runner</h1>
      <section className="mb-10" aria-labelledby="what-is-pickup-runner">
        <h2 id="what-is-pickup-runner" className="text-2xl font-bold mb-4">What is Pickup Runner?</h2>
        <p className="text-lg text-muted-foreground leading-relaxed">{SERVICE_DESCRIPTION}</p>
        <p className="text-muted-foreground leading-relaxed mt-4">
          This is the official website for Pickup Runner. Our app is listed as <strong className="text-foreground">Pickup Runner: Local Delivery</strong> on the App Store and Google Play.
          The same app lets customers arrange deliveries and approved drivers accept pickup requests.
        </p>
      </section>
      <section className="mb-10" aria-labelledby="prepaid-pickups">
        <h2 id="prepaid-pickups" className="text-2xl font-bold mb-4">What does a Pickup Runner driver do?</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          A runner collects items that are paid for and ready to hand over, then delivers them to the address in your booking.
          For a store pickup, pay the store first, confirm the order is ready, and include your collection reference and pickup instructions.
          Runners do not shop, buy goods or pay the store on your behalf.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          In the app, enter both addresses, describe the items and review the delivery charge before confirming.
          You can follow your runner, check the order status and view the delivery confirmation.
          For eligible items, pricing and handoff details, read our delivery guide.
        </p>
        <Link to="/order" className="text-primary hover:underline">How Pickup Runner delivery works →</Link>
      </section>
      <section className="mb-10" aria-labelledby="availability">
        <h2 id="availability" className="text-2xl font-bold mb-4">Where is Pickup Runner available?</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Pickup Runner serves select cities in the United States. Coverage is not nationwide: it depends on the pickup and delivery addresses and available local drivers.
          Being able to download the app does not confirm delivery coverage at your address.
          Check availability in the app or contact our team with your city or ZIP code before booking.
        </p>
        <Link to="/contact" className="text-primary hover:underline">Ask about delivery coverage →</Link>
      </section>
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8" aria-labelledby="official-apps">
        <h2 id="official-apps" className="text-2xl font-bold mb-4">Find the official Pickup Runner app</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Use these official download links for iPhone and Android. The app is operated by Pickup Runner LLC, and both store listings link back to pickuprunner.net.
        </p>
        <StoreButtons />
        <p className="text-sm text-muted-foreground mt-6">
          Customer and driver support: <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">{SUPPORT_EMAIL}</a>.
          {' '}Visit our <Link to="/contact" className="text-primary hover:underline">contact page</Link> for delivery, billing or account questions.
        </p>
      </section>
    </article>
  )
}
