
import { AlertCircle, Car, CheckCircle2, Clock, DollarSign, Shield, Smartphone, Truck } from 'lucide-react'

import { ApplicationForm } from './ApplicationForm'

export function DriversPage() {
  return (
    <div className="min-h-screen pt-16">
      <section className="relative py-20 overflow-hidden border-b border-border">
        <div className="absolute inset-0 pr-grid-bg opacity-30" />
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, hsl(47 100% 48% / 0.08) 0%, transparent 60%)', transform: 'translate(30%,-30%)' }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border mb-6"
            style={{ background: 'hsl(47 100% 48% / 0.1)', borderColor: 'hsl(47 100% 48% / 0.3)', color: '#F5C400' }}
          >
            <Car size={12} />Driver Recruitment
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6">
            Become a <span style={{ color: '#F5C400' }}>delivery driver.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Join the Pickup Runner driver network. Set your own schedule, earn competitive pay, and help your community get what they need delivered fast.
          </p>
          <div className="grid grid-cols-3 gap-4 mt-12 max-w-2xl mx-auto">
            {[
              { icon: DollarSign, label: '$2/mile + tips', sub: 'Transparent pay' },
              { icon: Clock, label: 'Any schedule', sub: 'Full flexibility' },
              { icon: Shield, label: 'All verified', sub: 'Safe platform' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="rounded-2xl border border-border bg-card p-4">
                <Icon size={20} className="text-primary mx-auto mb-2" />
                <p className="text-sm font-bold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="requirements" className="py-16 bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Driver Requirements</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              "Valid U.S. driver's license", 'Active vehicle insurance', 'Reliable transportation', 'Clean driving record',
              'Pass criminal background check', 'Pass Motor Vehicle Record (MVR) check', 'Smartphone with data plan', '18 years or older',
            ].map((req) => (
              <div key={req} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-background">
                <CheckCircle2 size={16} className="text-primary flex-shrink-0" />
                <span className="text-sm text-foreground">{req}</span>
              </div>
            ))}
          </div>
          <div
            className="mt-6 p-4 rounded-xl border flex gap-3"
            style={{ background: 'hsl(217 100% 50% / 0.08)', borderColor: 'hsl(217 100% 50% / 0.25)' }}
          >
            <AlertCircle size={18} className="text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Background check required.</strong> All drivers must complete a full background check including criminal history, sex offender registry, and Motor Vehicle Record before their first delivery.
            </p>
          </div>
        </div>
      </section>

      <section id="apply" className="py-20 scroll-mt-16">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: '#0066FF' }}
            >
              <Truck size={26} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3">Apply to Drive</h2>
            <p className="text-muted-foreground">
              Just your name and email — we'll take it from there
            </p>
          </div>
          <ApplicationForm />
        </div>
      </section>
    </div>
  )
}
