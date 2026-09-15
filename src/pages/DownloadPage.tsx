import { Link } from '@tanstack/react-router'
import { BRAND_ICON } from '../lib/brand'
import { APP_STORE_URL, PLAY_STORE_URL } from '../lib/appStores'
import { StoreButtons } from '../components/StoreButtons'

export function DownloadPage() {
  return (
    <article className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <img src={BRAND_ICON} alt="Pickup Runner app icon" width={96} height={96} className="rounded-2xl mb-6" />
      <p className="text-sm font-semibold text-primary mb-3">Official app downloads</p>
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5">Download Pickup Runner</h1>
      <p className="text-lg text-muted-foreground leading-relaxed mb-8">
        Get <strong className="text-foreground">Pickup Runner: Local Delivery</strong>, the pickup and delivery app operated by Pickup Runner LLC.
        Choose your store below to install the official app on iPhone or Android.
      </p>
      <StoreButtons />
      <div className="grid sm:grid-cols-2 gap-5 my-10">
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-bold mb-3">Pickup Runner for iPhone</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">Find Pickup Runner: Local Delivery on the App Store, published by Pickup Runner LLC.</p>
          <a href={APP_STORE_URL} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">View Pickup Runner on the App Store →</a>
        </section>
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-bold mb-3">Pickup Runner for Android</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">Find Pickup Runner: Local Delivery on Google Play. The developer profile is Pickup Runner, with Pickup Runner LLC listed under About the developer.</p>
          <a href={PLAY_STORE_URL} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">View Pickup Runner on Google Play →</a>
        </section>
      </div>
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">One app for customers and drivers</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Customers book a local pickup, see the delivery price before confirming and track their runner.
          Goods must already be paid for and ready for collection; drivers do not shop or pay for items.
          Drivers use the same app, with verification required before accepting deliveries.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <Link to="/order" className="text-primary hover:underline">Read the delivery guide →</Link>
          <Link to="/drivers" className="text-primary hover:underline">See driver requirements →</Link>
        </div>
      </section>
      <section className="border-t border-border pt-8">
        <h2 className="text-2xl font-bold mb-4">Check coverage before booking</h2>
        <p className="text-muted-foreground leading-relaxed">
          Delivery service is available in select U.S. cities, depending on your addresses and local driver availability.
          Downloading the app does not guarantee coverage. <Link to="/contact" className="text-primary hover:underline">Contact Pickup Runner</Link> with your city or ZIP code if you need help.
        </p>
      </section>
    </article>
  )
}
