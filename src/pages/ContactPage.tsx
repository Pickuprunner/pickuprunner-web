import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  AlertCircle, Car, CheckCircle2, Mail, MessageCircle, Package, Send, Trash2, User,
} from 'lucide-react'

const SUPPORT_EMAIL = 'pickuprunner13@gmail.com'

const BLUE = '#0066FF'
const YELLOW = '#F5C400'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const SUBJECTS = [
  'Driving with us',
  'A delivery went wrong',
  'Billing and receipts',
  'Privacy and your data',
  'Coverage in your area',
  'Business and partnerships',
  'Something else',
]

const SELF_SERVE = [
  { icon: Package, label: 'How ordering works', to: '/order' as const },
  { icon: Car, label: 'Apply to drive', to: '/drivers' as const },
  { icon: Trash2, label: 'Delete your account', to: '/delete-profile' as const },
]

interface EnquiryForm {
  name: string
  email: string
  subject: string
  message: string
}

const EMPTY: EnquiryForm = { name: '', email: '', subject: SUBJECTS[0], message: '' }

type Errors = Partial<Record<keyof EnquiryForm, string>>

/**
 * There is no contact endpoint on the API yet, so an enquiry is handed to the
 * sender's own mail client with everything already written. Swapping this for a
 * POST later touches only this function.
 */
function sendEnquiry(form: EnquiryForm) {
  const body = [
    form.message,
    '',
    '\u2014',
    `From: ${form.name}`,
    `Email: ${form.email}`,
  ].join('\r\n')

  window.location.href =
    `mailto:${SUPPORT_EMAIL}` +
    `?subject=${encodeURIComponent(form.subject)}` +
    `&body=${encodeURIComponent(body)}`
}

function Field({ id, label, value, onChange, error, placeholder, type = 'text', icon }: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  placeholder?: string
  type?: string
  icon?: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          className="w-full rounded-xl border px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 bg-background outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          style={{
            borderColor: error ? 'hsl(0 84% 60%)' : 'hsl(var(--border))',
            paddingLeft: icon ? '2.25rem' : undefined,
          }}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs text-destructive flex items-center gap-1">
          <AlertCircle size={11} />{error}
        </p>
      )}
    </div>
  )
}

export function ContactPage() {
  const [form, setForm] = useState<EnquiryForm>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [sent, setSent] = useState(false)

  const set = <K extends keyof EnquiryForm>(key: K, value: EnquiryForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    const e: Errors = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!EMAIL_PATTERN.test(form.email.trim())) e.email = 'Enter a valid email address'
    if (form.message.trim().length < 10) e.message = 'Tell us a little more so we can help'

    if (Object.keys(e).length) { setErrors(e); return }

    sendEnquiry({
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject,
      message: form.message.trim(),
    })

    setSent(true)
  }

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

          {sent ? (
            <div
              className="rounded-3xl border p-8 text-center"
              style={{ background: 'hsl(237 40% 6%)', borderColor: 'hsl(217 100% 50% / 0.25)' }}
            >
              <CheckCircle2 size={40} className="mx-auto mb-4" style={{ color: '#22C55E' }} />
              <h3 className="text-xl font-bold text-foreground mb-2">Your mail app should be open</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                We have written the enquiry for you — press send in your mail app and it comes straight to us. If nothing
                opened, email{' '}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">{SUPPORT_EMAIL}</a>{' '}
                directly.
              </p>
              <button
                onClick={() => { setSent(false); setForm(EMPTY) }}
                className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
              >
                Write another
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border p-6 sm:p-8 shadow-2xl"
              style={{
                background: 'linear-gradient(180deg, hsl(237 40% 8%) 0%, hsl(237 40% 6%) 100%)',
                borderColor: 'hsl(217 100% 50% / 0.18)',
              }}
            >
              <div className="space-y-5">
                <Field
                  id="name"
                  label="Your Name"
                  value={form.name}
                  onChange={(v) => set('name', v)}
                  error={errors.name}
                  placeholder="Jane Smith"
                  icon={<User size={13} />}
                />

                <Field
                  id="email"
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(v) => set('email', v)}
                  error={errors.email}
                  placeholder="jane@email.com"
                  icon={<Mail size={13} />}
                />

                <div>
                  <label htmlFor="subject" className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                    What is it about
                  </label>
                  <select
                    id="subject"
                    value={form.subject}
                    onChange={(e) => set('subject', e.target.value)}
                    className="w-full rounded-xl border border-border px-3 py-3 text-sm text-foreground bg-background outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  >
                    {SUBJECTS.map((subject) => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    value={form.message}
                    onChange={(e) => set('message', e.target.value)}
                    rows={6}
                    placeholder="Tell us what happened. If it is about a delivery, include the order reference."
                    aria-invalid={errors.message ? true : undefined}
                    className="w-full rounded-xl border px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 bg-background outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
                    style={{ borderColor: errors.message ? 'hsl(0 84% 60%)' : 'hsl(var(--border))' }}
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-destructive flex items-center gap-1">
                      <AlertCircle size={11} />{errors.message}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-7 inline-flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                style={{ background: BLUE, color: '#fff', boxShadow: '0 8px 24px -6px hsl(217 100% 50% / 0.55)' }}
              >
                <Send size={16} />Send Enquiry
              </button>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                This opens your own mail app with the message ready to send.
              </p>
            </form>
          )}
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
