
import { Link } from '@tanstack/react-router'
import { SUPPORT_EMAIL, YELLOW } from '../../lib/brand'
import { SectionHeading } from '../../components/marketing/SectionHeading'
import { StoreButtons } from '../../components/StoreButtons'
import { BadgeCheck, Car, CheckCircle2, ChevronRight, Clock, Info, MapPin, Smartphone } from 'lucide-react'
import { STEPS, SEND_CATEGORIES, APP_FEATURES, PRICING, FAQ } from './content'

export function Hero() {
  return (
  <section className="relative py-20 border-b border-border overflow-hidden">
    <div className="absolute inset-0 pr-grid-bg opacity-30" />
    <div
      className="absolute top-0 left-0 w-[600px] h-[600px] pointer-events-none"
      style={{ background: 'radial-gradient(circle, hsl(217 100% 50% / 0.12) 0%, transparent 60%)', transform: 'translate(-20%,-25%)' }}
    />
    <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
      <div
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border mb-6"
        style={{ background: 'hsl(217 100% 50% / 0.1)', borderColor: 'hsl(217 100% 50% / 0.3)', color: '#6699FF' }}
      >
        <Smartphone size={12} />Deliveries are booked in the app
      </div>

      <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-[1.1]">
        Send anything across town,{' '}
        <span style={{ color: YELLOW }}>from your phone.</span>
      </h1>

      <p className="text-lg text-muted-foreground leading-relaxed mb-10">
        Pickup Runner moves your things from one address to another — documents, parcels, the keys you left on
        the counter. You book it in our mobile app, not on the web. It's free on iPhone and Android.
      </p>

      <StoreButtons variant="large" className="mb-6" />

      <p className="text-sm text-muted-foreground">
        Not in our area yet?{' '}
        <a href={`mailto:${SUPPORT_EMAIL}?subject=Tell%20me%20when%20Pickup%20Runner%20reaches%20my%20city`} className="text-primary hover:underline font-medium">
          Email us your city
        </a>
        {' '}and we'll tell you when runners arrive near you.
      </p>
    </div>
  </section>
  )
}

export function WhatWeMove() {
  return (
  <section className="py-12 border-b border-border">
    <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4">
      <div
        className="flex flex-col sm:flex-row gap-4 p-6 rounded-2xl border"
        style={{ background: 'hsl(217 100% 50% / 0.06)', borderColor: 'hsl(217 100% 50% / 0.25)' }}
      >
        <Info size={20} className="text-primary flex-shrink-0 sm:mt-0.5" />
        <div className="space-y-2">
          <h2 className="text-base font-bold text-foreground">We move things. We do not sell them.</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Pickup Runner is a delivery platform, not a store or a shopping service. There is no catalogue and
            no cart. You tell us where your item is and where it needs to end up, and a vetted runner drives it
            there — usually within the hour. Your runner never buys anything on your behalf.
          </p>
        </div>
      </div>

      <div
        className="flex flex-col sm:flex-row gap-4 p-6 rounded-2xl border border-border"
        style={{ background: 'hsl(237 40% 6%)' }}
      >
        <Smartphone size={20} className="text-muted-foreground flex-shrink-0 sm:mt-0.5" />
        <div className="space-y-2">
          <h2 className="text-base font-bold text-foreground">Why there is no web booking</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            A handoff needs a conversation. Your runner has to reach you about building access, who is receiving
            at the other end, and whether it fits in the car. You need live tracking and a photo when it lands. A
            web form cannot do any of that — the app can, so that is where every delivery lives.
          </p>
        </div>
      </div>
    </div>
  </section>
  )
}

export function HowItWorks() {
  return (
  <section className="py-20 bg-card border-b border-border">
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <SectionHeading eyebrow="In the app" title="How a send works">
        Four steps from opening the app to a photo of it delivered.
      </SectionHeading>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STEPS.map(({ step, icon: Icon, title, desc, color }) => (
          <div
            key={step}
            className="rounded-2xl border border-border p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30"
            style={{ background: 'hsl(237 40% 6%)' }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
              style={{ background: `${color}22`, border: `1px solid ${color}44` }}
            >
              <Icon size={22} style={{ color }} />
            </div>
            <span className="text-xs font-bold tracking-widest text-muted-foreground/60 mb-2 block">{step}</span>
            <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
  )
}

export function WhatPeopleSend() {
  return (
  <section className="py-20 border-b border-border">
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <SectionHeading eyebrow="For customers" title="What people send with us">
        If it is legal, it fits in a car, and one person can carry it — a runner will take it.
      </SectionHeading>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {SEND_CATEGORIES.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-2xl border border-border p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30"
            style={{ background: 'hsl(237 40% 6%)' }}
          >
            <Icon size={24} className="text-primary mb-4" />
            <h3 className="text-base font-bold text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
  )
}

export function AppFeatures() {
  return (
  <section className="py-20 border-b border-border">
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <SectionHeading eyebrow="Built for you" title="What you get in the app">
        The things that make handing your stuff to a stranger feel completely normal.
      </SectionHeading>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {APP_FEATURES.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-2xl border border-border p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30"
            style={{ background: 'hsl(237 40% 6%)' }}
          >
            <Icon size={22} style={{ color: YELLOW }} className="mb-4" />
            <h3 className="text-base font-bold text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
  )
}

export function Pricing() {
  return (
  <section className="py-20 bg-card border-b border-border">
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <SectionHeading eyebrow="Transparent pricing" title="What it costs">
        The same three lines on every delivery. You see the total in the app before a runner is assigned.
      </SectionHeading>

      <ul className="space-y-4 mb-8">
        {PRICING.map(({ label, value, note }) => (
          <li key={label} className="flex items-center gap-4 p-4 rounded-xl border border-border" style={{ background: 'hsl(237 40% 6%)' }}>
            <CheckCircle2 size={18} className="text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-foreground">{label}</span>
              <span className="text-xs text-muted-foreground ml-2">— {note}</span>
            </div>
            <span className="text-sm font-bold text-foreground whitespace-nowrap">{value}</span>
          </li>
        ))}
      </ul>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: BadgeCheck, label: 'No membership', sub: 'Nothing monthly' },
          { icon: Clock, label: 'Under 45 min', sub: 'Typical delivery' },
          { icon: MapPin, label: 'Up to 15 miles', sub: 'Pickup to drop-off' },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={label} className="rounded-2xl border border-border p-5 text-center" style={{ background: 'hsl(237 40% 6%)' }}>
            <Icon size={20} className="text-primary mx-auto mb-2" />
            <p className="text-sm font-bold text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">{sub}</p>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-muted-foreground text-center">
        You are paying for the trip, not for goods — there is nothing to buy and nothing to reimburse.
      </p>
    </div>
  </section>
  )
}

export function Questions() {
  return (
  <section className="py-20 border-b border-border">
    <div className="max-w-3xl mx-auto px-4 sm:px-6">
      <SectionHeading eyebrow="Questions" title="Before you send" />

      <div className="space-y-3">
        {FAQ.map(({ q, a }) => (
          <details
            key={q}
            className="group rounded-2xl border border-border overflow-hidden"
            style={{ background: 'hsl(237 40% 6%)' }}
          >
            <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none text-sm font-semibold text-foreground hover:text-primary transition-colors">
              {q}
              <ChevronRight size={16} className="flex-shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-90" />
            </summary>
            <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{a}</p>
          </details>
        ))}
      </div>
    </div>
  </section>
  )
}

export function GetTheApp() {
  return (
  <section className="py-20">
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <div
        className="relative overflow-hidden rounded-3xl py-16 sm:py-20"
        style={{ background: 'linear-gradient(135deg, hsl(217 100% 14%) 0%, hsl(240 67% 8%) 100%)', border: '1px solid hsl(217 100% 30% / 0.4)' }}
      >
      <div className="absolute inset-0 pr-grid-bg opacity-30" />
      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border mb-6"
          style={{ background: 'hsl(47 100% 48% / 0.12)', borderColor: 'hsl(47 100% 48% / 0.3)', color: YELLOW }}
        >
          <Smartphone size={12} />Out now
        </div>

        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Get the app.</h2>

        <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
          Download Pickup Runner free on iPhone or Android and book your first send in a couple of minutes.
        </p>

        <StoreButtons variant="large" className="mb-4" />

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/drivers"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-base border border-border text-foreground hover:bg-muted transition-all duration-200"
          >
            <Car size={18} />Drive instead<ChevronRight size={16} />
          </Link>
        </div>
      </div>
      </div>
    </div>
  </section>
  )
}
