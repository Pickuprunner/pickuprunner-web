import { Link } from '@tanstack/react-router'
import {
  Apple, BadgeCheck, Bell, Boxes, Camera, Car, CheckCircle2, ChevronRight, Clock,
  CreditCard, FileText, Gift, Info, KeyRound, MapPin, Navigation, PackageX,
  Receipt, Shield, Smartphone, Undo2, Wallet,
} from 'lucide-react'

const SUPPORT_EMAIL = 'pickuprunner13@gmail.com'

const BLUE = '#0066FF'
const YELLOW = '#F5C400'

function StoreButton({ platform, sub, icon }: { platform: string; sub: string; icon: React.ReactNode }) {
  return (
    <div
      className="flex items-center gap-4 px-6 py-4 rounded-2xl border border-border opacity-70 select-none"
      style={{ background: 'hsl(237 40% 6%)' }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'hsl(217 100% 50% / 0.15)', border: '1px solid hsl(217 100% 50% / 0.3)' }}
      >
        {icon}
      </div>
      <div className="text-left">
        <p className="text-xs text-muted-foreground">{sub}</p>
        <p className="text-lg font-bold text-foreground">{platform}</p>
      </div>
      <span
        className="ml-2 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap"
        style={{ background: 'hsl(47 100% 48% / 0.12)', border: '1px solid hsl(47 100% 48% / 0.3)', color: YELLOW }}
      >
        Coming soon
      </span>
    </div>
  )
}

function SectionHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="text-center mb-14">
      <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">{eyebrow}</p>
      <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{title}</h2>
      {children && <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">{children}</p>}
    </div>
  )
}

const STEPS = [
  { step: '01', icon: Smartphone, title: 'Get the app', desc: 'Download Pickup Runner on iOS or Android. Free to install — no subscription, no membership.', color: BLUE },
  { step: '02', icon: MapPin, title: 'Set both addresses', desc: 'Where it is now, and where it needs to go. Save the places you send from often.', color: YELLOW },
  { step: '03', icon: Boxes, title: 'Describe the item', desc: 'What it is, roughly how big, and who is handing it over at each end. See the full price before you confirm.', color: BLUE },
  { step: '04', icon: Navigation, title: 'Track it door to door', desc: 'Follow your runner live from collection to handoff, and get a delivery photo when it lands.', color: YELLOW },
]

const SEND_CATEGORIES = [
  { icon: FileText, title: 'Documents & paperwork', desc: 'Contracts, signed forms, certificates, passports for an appointment — across town in under an hour.' },
  { icon: KeyRound, title: 'The thing you left behind', desc: 'Keys, wallet, phone charger, the laptop still on the kitchen table. Sent to wherever you actually are.' },
  { icon: Boxes, title: 'Parcels & packages', desc: 'Anything boxed or bagged that fits in a car and one person can carry comfortably.' },
  { icon: Gift, title: 'Gifts & occasions', desc: 'A birthday present, flowers, or a cake that needs to get across the city today, not in three days.' },
  { icon: Car, title: 'Business runs', desc: 'Stock between your branches, samples to a client, tools to a job site, deposits to the accountant.' },
  { icon: Undo2, title: 'Returns & drop-offs', desc: 'To a courier depot, a repair shop, a landlord, or a friend who has been asking for their dish back.' },
]

const APP_FEATURES = [
  { icon: Wallet, title: 'Price before you commit', desc: 'Base fee, mileage, and tip are itemised on screen. You approve the total before a runner is assigned.' },
  { icon: Navigation, title: 'Live tracking', desc: 'Watch your runner from the moment they accept, through collection, to the drop-off address.' },
  { icon: Camera, title: 'Photo proof of delivery', desc: 'Your runner photographs the handoff. It lands in your order screen the second the delivery is marked complete.' },
  { icon: CreditCard, title: 'Pay in the app', desc: 'Card on file, charged once. No cash changing hands at either end of the trip.' },
  { icon: Receipt, title: 'Receipts & history', desc: 'Every send stored with an itemised receipt — useful when you are expensing a courier run.' },
  { icon: Shield, title: 'Vetted runners', desc: 'Criminal background, MVR, and sex offender registry checks before a first delivery.' },
]

const PRICING = [
  { label: 'Base delivery fee', value: '$10.00', note: 'Flat, every send' },
  { label: 'Mileage', value: '$2.00/mi', note: 'Pickup to drop-off' },
  { label: 'Driver tip', value: '$5 minimum', note: '100% to your runner' },
]

const PROHIBITED = [
  'Cash, cards, and negotiable securities',
  'Anything illegal to possess or transport',
  'Hazardous, flammable, or corrosive material',
  'Live animals',
  'Firearms, ammunition, and weapons',
  'Unpackaged items that cannot survive a car ride',
]

const FAQ = [
  {
    q: 'Can I book a delivery on this website?',
    a: 'No. Every Pickup Runner delivery is booked through our mobile app. This website explains how the service works, what it costs, and where we operate — but there is no web booking, and there will not be one at launch.',
  },
  {
    q: 'So you do not sell anything?',
    a: 'Correct. We are a delivery platform, not a shop or a shopping service. You already own the item; we move it from one address to another. Your runner does not buy anything on your behalf and never pays for goods at either end.',
  },
  {
    q: 'What can I send?',
    a: 'Anything legal that fits in a car and one person can carry safely on their own — documents, parcels, gifts, forgotten essentials, business stock. If you are unsure whether something qualifies, describe it in the app before you book and we will tell you.',
  },
  {
    q: 'What will you not carry?',
    a: 'Cash and negotiable securities, anything illegal, hazardous or flammable material, live animals, weapons and ammunition, and anything unpackaged that will not survive a car ride. Runners can decline an item at collection if it turns out not to match what was booked.',
  },
  {
    q: 'Does somebody need to be there at both ends?',
    a: 'Someone needs to hand the item over at pickup. At the drop-off you can name a recipient or authorise your runner to leave it in a safe place — either way you get a photo of exactly where it ended up.',
  },
  {
    q: 'How do I pay?',
    a: 'You add a card in the app and the trip is charged once at checkout — base fee, mileage, and your tip. Nobody hands your runner cash, at either address.',
  },
  {
    q: 'How do I know it actually arrived?',
    a: 'Your runner marks the delivery complete and uploads a photo of the handoff or the safe place. That photo, plus the delivery time, is attached to the order in your history.',
  },
  {
    q: 'How far will a runner go?',
    a: 'Up to about 15 miles between pickup and drop-off, seven days a week. Most sends are completed in under 45 minutes. Coverage widens as more runners join your area.',
  },
  {
    q: 'When does the app launch?',
    a: `We are in the final stretch of testing. Email ${SUPPORT_EMAIL} with your city and we will tell you the day it goes live near you.`,
  },
]

export function OrderPage() {
  return (
    <div className="min-h-screen pt-16">

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
            the counter. You book it in our mobile app, not on the web. We are putting the last touches on it now.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <StoreButton platform="App Store" sub="Coming to the" icon={<Apple size={22} className="text-primary" />} />
            <StoreButton platform="Google Play" sub="Coming to" icon={<Smartphone size={22} className="text-primary" />} />
          </div>

          <p className="text-sm text-muted-foreground">
            Want to know the moment it launches?{' '}
            <a href={`mailto:${SUPPORT_EMAIL}?subject=Notify%20me%20when%20the%20app%20launches`} className="text-primary hover:underline font-medium">
              Email us your city
            </a>
            .
          </p>
        </div>
      </section>

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

      {/* <section className="py-16 bg-card border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-6">
            <PackageX size={22} className="text-muted-foreground flex-shrink-0" />
            <h2 className="text-xl font-bold text-foreground">What a runner cannot carry</h2>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            A short list, mostly set by law and insurance. Runners can decline an item at collection if it does not
            match what was booked in the app.
          </p>

          <ul className="grid sm:grid-cols-2 gap-3">
            {PROHIBITED.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 px-4 py-3 rounded-xl border border-border"
                style={{ background: 'hsl(237 40% 6%)' }}
              >
                <PackageX size={15} className="flex-shrink-0 mt-0.5" style={{ color: '#EF4444' }} />
                <span className="text-sm text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-xs text-muted-foreground">
            Not sure about something?{' '}
            <a href={`mailto:${SUPPORT_EMAIL}?subject=Can%20I%20send%20this%3F`} className="text-primary hover:underline">
              Ask us first
            </a>{' '}
            — it is quicker than having a runner turn it down at the door.
          </p>
        </div>
      </section> */}

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

      <section
        className="py-20 mx-4 sm:mx-6 my-12 rounded-3xl overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, hsl(217 100% 14%) 0%, hsl(240 67% 8%) 100%)', border: '1px solid hsl(217 100% 30% / 0.4)' }}
      >
        <div className="absolute inset-0 pr-grid-bg opacity-30" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border mb-6"
            style={{ background: 'hsl(47 100% 48% / 0.12)', borderColor: 'hsl(47 100% 48% / 0.3)', color: YELLOW }}
          >
            <Bell size={12} />Launching soon
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Be first in line.</h2>

          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
            Send us your city and we will tell you the day Pickup Runner goes live near you — before the app hits the stores.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=Notify%20me%20when%20the%20app%20launches`}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 hover:scale-105 active:scale-95 pr-glow-yellow"
              style={{ background: YELLOW, color: '#0A0A0F' }}
            >
              <Bell size={18} />Notify me at launch
            </a>

            <Link
              to="/drivers"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-base border border-border text-foreground hover:bg-muted transition-all duration-200"
            >
              <Car size={18} />Drive instead<ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
