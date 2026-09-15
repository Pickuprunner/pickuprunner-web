import { Link } from '@tanstack/react-router'
import { SERVICE_DESCRIPTION } from '../lib/seo'
import { StoreButtons } from '../components/StoreButtons'
import { ShoppingCart, Car, MapPin, Clock, Shield, Star, ChevronRight, CheckCircle2, Package, Truck, Home } from 'lucide-react'

export function HomePage() {
  return (
    <div className="flex flex-col">
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0 pr-grid-bg opacity-50" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, hsl(217 100% 50% / 0.12) 0%, transparent 70%)' }} />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border mb-6"
                style={{ background: 'hsl(217 100% 50% / 0.1)', borderColor: 'hsl(217 100% 50% / 0.3)', color: '#6699FF' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Pickup Runner · Local delivery app
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight text-foreground mb-6">
                <span style={{ color: '#F5C400' }}>Pickup Runner.</span><br />
                Local pickup &amp;<br />delivery.
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
                {SERVICE_DESCRIPTION} Items must be paid for before collection; runners do not shop or pay for goods.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link to="/order"
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-base transition-all duration-200 hover:scale-105 active:scale-95 pr-glow-yellow"
                  style={{ background: '#F5C400', color: '#0A0A0F' }}>
                  <ShoppingCart size={18} />Place an Order
                </Link>
                <Link to="/drivers"
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-base border border-border text-foreground hover:bg-muted transition-all duration-200">
                  <Car size={18} />Become a Driver<ChevronRight size={16} className="ml-1" />
                </Link>
              </div>
              <StoreButtons />
              <div className="flex flex-wrap gap-x-5 gap-y-2 mt-5 text-sm">
                <Link to="/about" className="text-primary hover:underline">About Pickup Runner LLC</Link>
                <Link to="/download" className="text-primary hover:underline">Find the official app</Link>
              </div>
            </div>

            <div aria-hidden="true" data-nosnippet="" className="relative flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 rounded-[3rem] -m-4"
                  style={{ background: 'radial-gradient(circle, hsl(217 100% 50% / 0.2) 0%, transparent 70%)' }} />
                <div className="relative w-72 h-[580px] rounded-[3rem] border-2 overflow-hidden pr-glow-blue"
                  style={{ background: 'hsl(237 40% 8%)', borderColor: 'hsl(237 25% 22%)' }}>
                  <div className="flex items-center justify-between px-6 pt-4 pb-2">
                    <span className="text-xs font-semibold text-foreground">9:41</span>
                    <div className="w-24 h-5 rounded-full bg-foreground/5 mx-auto" />
                    <div className="w-3 h-3 rounded-sm bg-foreground/40" />
                  </div>
                  <div className="px-5 pt-2 pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Good afternoon,</p>
                        <p className="text-sm font-bold text-foreground">Sarah Johnson</p>
                      </div>
                      <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">SJ</div>
                    </div>
                    <div className="h-10 rounded-xl bg-muted flex items-center px-3 gap-2 mb-4">
                      <MapPin size={14} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Deliver to 1234 Main St...</span>
                    </div>
                    <div className="rounded-2xl p-4 mb-3" style={{ background: 'hsl(217 100% 50% / 0.15)', border: '1px solid hsl(217 100% 50% / 0.3)' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Truck size={12} className="text-white" />
                        </div>
                        <span className="text-xs font-semibold text-primary">En Route</span>
                        <span className="ml-auto text-xs text-muted-foreground">ETA 8 min</span>
                      </div>
                      <p className="text-xs text-foreground font-medium">Fry's Grocery — 12 items</p>
                      <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: '70%' }} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[{ icon: ShoppingCart, label: 'Groceries', color: '#0066FF' }, { icon: Package, label: 'Pharmacy', color: '#F5C400' }].map(({ icon: Icon, label, color }) => (
                        <div key={label} className="rounded-xl p-3 border border-border" style={{ background: 'hsl(237 30% 12%)' }}>
                          <Icon size={18} style={{ color }} className="mb-2" />
                          <p className="text-xs font-medium text-foreground">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 border-t border-border px-6 py-3 flex justify-around items-center"
                    style={{ background: 'hsl(237 40% 8%)' }}>
                    {[{ icon: Home, active: true }, { icon: ShoppingCart, active: false }, { icon: Package, active: false }, { icon: Star, active: false }].map(({ icon: Icon, active }, i) => (
                      <div key={i} className={`p-2 rounded-lg ${active ? 'bg-primary/20' : ''}`}>
                        <Icon size={18} className={active ? 'text-primary' : 'text-muted-foreground'} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: 'Live', label: 'Delivery Tracking' },
              { value: '100%', label: 'Background Checked' },
              { value: '$10 base', label: 'Starting Price' },
              { value: 'iOS + Android', label: 'Book in the App' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-foreground mb-1">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 bg-card border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">Simple Process</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">How it works</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">Three easy steps from your couch to your front door.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: MapPin, title: 'Place Your Order', desc: 'Open the Pickup Runner app, enter the pickup and drop-off addresses, and describe your items. Review the price before confirming.', color: '#0066FF' },
              { step: '02', icon: Car, title: 'Driver Picks Up', desc: 'A background-checked local driver accepts your delivery and collects the items from your pickup address.', color: '#F5C400' },
              { step: '03', icon: Home, title: 'Delivered to You', desc: 'Track your runner in the app as your items travel to the drop-off address. View the delivery confirmation when they arrive.', color: '#0066FF' },
            ].map(({ step, icon: Icon, title, desc, color }) => (
              <div key={step} className="group">
                <div className="rounded-2xl border border-border p-8 transition-all duration-300 hover:-translate-y-1" style={{ background: 'hsl(237 40% 6%)' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform duration-200 group-hover:scale-110"
                    style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
                    <Icon size={22} style={{ color }} />
                  </div>
                  <span className="text-xs font-bold tracking-widest text-muted-foreground/60 mb-2 block">{step}</span>
                  <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">Transparent Pricing</p>
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">No hidden fees.<br /><span style={{ color: '#F5C400' }}>Ever.</span></h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">We believe in honest pricing. You see the full breakdown before you confirm.</p>
              <ul className="space-y-4">
                {[
                  { label: 'Base delivery fee', value: '$10.00', note: 'Every order' },
                  { label: 'Mileage rate', value: '$2.00/mi', note: 'Calculated to your door' },
                  { label: 'Driver tip', value: '$5+', note: 'You choose, no limit' },
                ].map(({ label, value, note }) => (
                  <li key={label} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
                    <CheckCircle2 size={18} className="text-primary flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-foreground">{label}</span>
                      <span className="text-xs text-muted-foreground ml-2">— {note}</span>
                    </div>
                    <span className="text-sm font-bold text-foreground">{value}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Shield, title: 'Background Checked', desc: 'All drivers pass criminal background, MVR, and sex offender registry checks.', color: '#0066FF' },
                { icon: Star, title: 'Delivery Feedback', desc: 'Rate your driver after a completed delivery and share feedback about your experience.', color: '#F5C400' },
                { icon: Clock, title: 'Live Tracking', desc: 'Follow your delivery in the app. Timing depends on distance, traffic and driver availability.', color: '#0066FF' },
                { icon: CheckCircle2, title: 'Age Verification', desc: 'Alcohol and pharmacy orders include mandatory ID verification at the door.', color: '#F5C400' },
              ].map(({ icon: Icon, title, desc, color }) => (
                <div key={title} className="rounded-2xl border border-border p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30" style={{ background: 'hsl(237 40% 6%)' }}>
                  <Icon size={24} style={{ color }} className="mb-4" />
                  <h3 className="text-sm font-bold text-foreground mb-2">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="coverage" className="py-20 bg-card border-y border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">Service Area</p>
          <h2 className="text-4xl font-bold text-foreground mb-4">Coverage Area</h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Pickup Runner operates in select U.S. cities. Availability depends on your pickup address, drop-off address and available drivers; coverage is not nationwide. Contact our team with your city or ZIP code to confirm coverage before booking.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            {[
              { label: 'Delivery Radius', value: 'Up to 15 miles', sub: 'From pickup location' },
              { label: 'Delivery Timing', value: 'Check the app', sub: 'Depends on your route' },
              { label: 'Availability', value: '7 days a week', sub: 'Morning to evening' },
            ].map(({ label, value, sub }) => (
              <div key={label} className="rounded-2xl border border-border p-6" style={{ background: 'hsl(237 40% 6%)' }}>
                <p className="text-2xl font-bold text-foreground mb-1">{value}</p>
                <p className="text-sm font-semibold text-primary mb-1">{label}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Not sure if we cover your area?{' '}
            <a href="mailto:pickuprunner13@gmail.com" className="text-primary hover:underline">Email us</a> with your zip code and we'll let you know.
          </p>
        </div>
      </section>

      
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl py-16 sm:py-20"
            style={{ background: 'linear-gradient(135deg, hsl(217 100% 14%) 0%, hsl(240 67% 8%) 100%)', border: '1px solid hsl(217 100% 30% / 0.4)' }}>
            <div className="absolute inset-0 pr-grid-bg opacity-30" />
            <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border mb-6"
                style={{ background: 'hsl(47 100% 48% / 0.12)', borderColor: 'hsl(47 100% 48% / 0.3)', color: '#F5C400' }}>
                <Car size={12} />Become a Pickup Runner driver
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">Earn on your schedule.</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                Set your own hours. Make deliveries when it works for you. Pay per mile plus tips through the app.
              </p>
              <Link to="/drivers"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 hover:scale-105 active:scale-95 pr-glow-yellow"
                style={{ background: '#F5C400', color: '#0A0A0F' }}>
                <Car size={18} />Apply to Drive<ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
