
import { Link } from '@tanstack/react-router'
import { RED, SUPPORT_EMAIL, YELLOW } from '../../lib/brand'
import { SectionHeading } from '../../components/marketing/SectionHeading'
import { AlertTriangle, Ban, CheckCircle2, ChevronRight, Info, Mail, Package, RotateCcw, ShieldCheck, Smartphone, Trash2 } from 'lucide-react'
import { STEPS, REMOVED, KEPT, FAQ } from './content'

export function Hero() {
  return (
  <section className="relative py-20 border-b border-border overflow-hidden">
    <div className="absolute inset-0 pr-grid-bg opacity-30" />
    <div
      className="absolute top-0 left-0 w-[600px] h-[600px] pointer-events-none"
      style={{ background: 'radial-gradient(circle, hsl(0 84% 60% / 0.08) 0%, transparent 60%)', transform: 'translate(-20%,-25%)' }}
    />
    <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
      <div
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border mb-6"
        style={{ background: 'hsl(0 84% 60% / 0.1)', borderColor: 'hsl(0 84% 60% / 0.3)', color: '#F87171' }}
      >
        <Trash2 size={12} />Account deletion
      </div>

      <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-[1.1]">
        Deleting your{' '}
        <span style={{ color: YELLOW }}>Pickup Runner account.</span>
      </h1>

      <p className="text-lg text-muted-foreground leading-relaxed">
        You can close your account yourself, at any time, from inside the app — no email to us, no waiting on
        support. It takes four steps and about thirty seconds. Here is exactly what they are.
      </p>
    </div>
  </section>
  )
}

export function WhereItHappens() {
  return (
  <section className="py-12 border-b border-border">
    <div className="max-w-3xl mx-auto px-4 sm:px-6">
      <div
        className="flex flex-col sm:flex-row gap-4 p-6 rounded-2xl border"
        style={{ background: 'hsl(217 100% 50% / 0.06)', borderColor: 'hsl(217 100% 50% / 0.25)' }}
      >
        <Smartphone size={20} className="text-primary flex-shrink-0 sm:mt-0.5" />
        <div className="space-y-2">
          <h2 className="text-base font-bold text-foreground">Deletion happens in the app</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The request has to come from your own signed-in account, which is how we know it is really you asking.
            There is no delete button on this website and we will not close an account on an emailed request alone.
          </p>
        </div>
      </div>
    </div>
  </section>
  )
}

export function Steps() {
  return (
  <section className="py-20 bg-card border-b border-border">
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <SectionHeading eyebrow="Step by step" title="How to delete your account">
        Four taps, with one deliberate speed bump so it cannot happen by accident.
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

export function IfYouOweMoney() {
  return (
  <section className="py-16 border-b border-border">
    <div className="max-w-3xl mx-auto px-4 sm:px-6">
      <div
        className="rounded-2xl border p-6 sm:p-8"
        style={{ background: 'hsl(47 100% 48% / 0.06)', borderColor: 'hsl(47 100% 48% / 0.3)' }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'hsl(47 100% 48% / 0.15)', border: '1px solid hsl(47 100% 48% / 0.35)' }}
          >
            <AlertTriangle size={20} style={{ color: YELLOW }} />
          </div>

          <div className="min-w-0">
            <h2 className="text-xl font-bold text-foreground mb-3">
              If an order is in progress, you cannot delete yet
            </h2>

            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              When you reach the final step, the app checks for deliveries that are still running. If it finds any,
              the deletion stops and you get a notification instead:
            </p>

            <div
              className="rounded-xl border p-4 flex items-start gap-3 mb-5"
              style={{ background: 'hsl(237 40% 6%)', borderColor: 'hsl(0 84% 60% / 0.35)' }}
            >
              <Ban size={16} className="flex-shrink-0 mt-0.5" style={{ color: RED }} />
              <div>
                <p className="text-sm font-semibold text-foreground">Your order is in progress</p>
                <p className="text-xs text-muted-foreground mt-1">
                  You cannot delete your account while a delivery is still under way.
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Wait for the delivery to be completed, or cancel it, and then run through the four steps again. Nothing
              is lost in the meantime — the account stays exactly as it was and you can try as often as you like.
            </p>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mt-6">
        <div className="rounded-2xl border border-border p-5" style={{ background: 'hsl(237 40% 6%)' }}>
          <Package size={18} className="text-primary mb-3" />
          <h3 className="text-sm font-bold text-foreground mb-1.5">Every order must be finished</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            An order counts as in progress until it is marked delivered or cancelled. Check Orders in the app to see
            what is still open.
          </p>
        </div>

        <div className="rounded-2xl border border-border p-5" style={{ background: 'hsl(237 40% 6%)' }}>
          <ShieldCheck size={18} style={{ color: YELLOW }} className="mb-3" />
          <h3 className="text-sm font-bold text-foreground mb-1.5">Drivers: earnings clear first</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            If you drive with us, deletion also waits until any money you are owed has been transferred, so closing
            your profile never costs you a payout.
          </p>
        </div>
      </div>
    </div>
  </section>
  )
}

export function WhatDeletingDoes() {
  return (
  <section className="py-20 bg-card border-b border-border">
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <SectionHeading eyebrow="Your data" title="What deleting actually does">
        Your personal details are removed. The delivery records stay, stripped of anything pointing back to you.
      </SectionHeading>

      <div className="grid sm:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-border p-6" style={{ background: 'hsl(237 40% 6%)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Trash2 size={16} style={{ color: RED }} />
            <h3 className="text-sm font-bold text-foreground">Removed for good</h3>
          </div>
          <ul className="space-y-2.5">
            {REMOVED.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed">
                <Ban size={13} className="flex-shrink-0 mt-1" style={{ color: RED }} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border p-6" style={{ background: 'hsl(237 40% 6%)' }}>
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck size={16} className="text-primary" />
            <h3 className="text-sm font-bold text-foreground">Kept, but anonymous</h3>
          </div>
          <ul className="space-y-2.5">
            {KEPT.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed">
                <CheckCircle2 size={13} className="text-primary flex-shrink-0 mt-1" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div
        className="mt-5 flex items-start gap-3 p-4 rounded-xl border"
        style={{ background: 'hsl(217 100% 50% / 0.06)', borderColor: 'hsl(217 100% 50% / 0.2)' }}
      >
        <RotateCcw size={15} className="text-primary flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Deletion is permanent and cannot be reversed. Your email address is released, so you are free to sign up
          again with it later — that new account starts empty.
        </p>
      </div>
    </div>
  </section>
  )
}

export function Questions() {
  return (
  <section className="py-20 border-b border-border">
    <div className="max-w-3xl mx-auto px-4 sm:px-6">
      <SectionHeading eyebrow="Questions" title="Before you delete" />

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

export function TalkToUs() {
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
          style={{ background: 'hsl(217 100% 50% / 0.12)', borderColor: 'hsl(217 100% 50% / 0.3)', color: '#6699FF' }}
        >
          <Info size={12} />Stuck on a step?
        </div>

        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">We can talk it through.</h2>

        <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
          If the app will not let you delete and you cannot work out which order is holding it up, send us the email
          address on your account and we will tell you what is still open.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=Help%20deleting%20my%20account`}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ background: '#0066FF', color: '#fff' }}
          >
            <Mail size={18} />Email support
          </a>

          <Link
            to="/privacy"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-base border border-border text-foreground hover:bg-muted transition-all duration-200"
          >
            <ShieldCheck size={18} />Privacy Policy<ChevronRight size={16} />
          </Link>
        </div>
      </div>
      </div>
    </div>
  </section>
  )
}
