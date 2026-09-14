import { Link } from '@tanstack/react-router'
import { Mail, MessageCircle } from 'lucide-react'

import { BLUE, YELLOW } from '../../lib/brand'
import { EnquiryForm } from './EnquiryForm'
import { SELF_SERVE } from './content'

export function ContactPage() {
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
            <MessageCircle size={12} />Get in touch
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-[1.1]">
            Talk to a{' '}
            <span style={{ color: YELLOW }}>real person.</span>
          </h1>

          <p className="text-lg text-muted-foreground leading-relaxed">
            Pickup Runner is a small team, and the same people who run the platform answer the email. Tell us what is
            going on and you will hear back from someone who can actually fix it.
          </p>
        </div>
      </section>

      <section className="py-20 bg-card border-b border-border">
        <div className="max-w-xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: BLUE }}
            >
              <Mail size={26} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3">Send us an enquiry</h2>
            <p className="text-muted-foreground">
              Fill this in and we will come back to you at the address you give us
            </p>
          </div>

          <EnquiryForm />
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">Faster than email</p>
            <h2 className="text-3xl font-bold text-foreground mb-3">Answered already?</h2>
            <p className="text-muted-foreground">A few things are quicker to look up than to ask about.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {SELF_SERVE.map(({ icon: Icon, label, to }) => (
              <Link
                key={to}
                to={to}
                className="rounded-2xl border border-border p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/40"
                style={{ background: 'hsl(237 40% 6%)' }}
              >
                <Icon size={20} className="text-primary mx-auto mb-2" />
                <p className="text-sm font-semibold text-foreground">{label}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
