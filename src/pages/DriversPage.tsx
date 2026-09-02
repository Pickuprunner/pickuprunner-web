import { useState } from 'react'
import {
  AlertCircle, Car, CheckCircle2, ChevronRight, Clock, DollarSign, Mail,
  Shield, Smartphone, Truck, User,
} from 'lucide-react'
import { applicationsApi } from '../lib/api'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface DriverForm {
  fullName: string
  email: string
}

const EMPTY: DriverForm = { fullName: '', email: '' }

type Errors = Partial<Record<keyof DriverForm, string>>

function Field({ id, label, value, onChange, error, placeholder, type = 'text', icon, valid }: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  placeholder?: string
  type?: string
  icon?: React.ReactNode
  valid?: boolean
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
            paddingRight: valid ? '2.25rem' : undefined,
          }}
        />
        {valid && (
          <CheckCircle2
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: '#22C55E' }}
          />
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs text-destructive flex items-center gap-1">
          <AlertCircle size={11} />{error}
        </p>
      )}
    </div>
  )
}

export function DriversPage() {
  const [form, setForm] = useState<DriverForm>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [applicantName, setApplicantName] = useState('')
  const [applicantEmail, setApplicantEmail] = useState('')

  const set = <K extends keyof DriverForm>(key: K, value: DriverForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const e: Errors = {}
    if (!form.fullName.trim()) e.fullName = 'Required'
    if (!EMAIL_PATTERN.test(form.email.trim())) e.email = 'Enter a valid email address'

    if (Object.keys(e).length) { setErrors(e); return }

    setLoading(true)
    setSubmitError('')

    const name = form.fullName.trim()

    try {
      await applicationsApi.apply({
        legalName: name,
        displayName: name,
        email: form.email.trim(),
      })
      setApplicantName(name.split(/\s+/)[0])
      setApplicantEmail(form.email.trim())
      setSubmitted(true)
    } catch (err) {
      console.error(err)
      setSubmitError(err instanceof Error ? err.message : 'Unable to submit your application. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center py-20">
          <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-6 animate-pulse-ring">
            <CheckCircle2 size={36} className="text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4">You're on the list!</h2>
          <p className="text-muted-foreground mb-2">
            Thanks, <strong className="text-foreground">{applicantName}</strong>! We have your details.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            We'll email <strong className="text-foreground">{applicantEmail}</strong> with a link to the driver app,
            where you'll finish your profile — vehicle, license, insurance and the background check.
          </p>
          <button
            onClick={() => { setSubmitted(false); setForm(EMPTY) }}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            Sign Up Someone Else
          </button>
        </div>
      </div>
    )
  }

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
            Drive. <span style={{ color: '#F5C400' }}>Earn.</span> Repeat.
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

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border p-6 sm:p-8 shadow-2xl"
            style={{
              background: 'linear-gradient(180deg, hsl(237 40% 8%) 0%, hsl(237 40% 6%) 100%)',
              borderColor: 'hsl(217 100% 50% / 0.18)',
            }}
          >
            {submitError && (
              <p className="mb-6 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive flex items-start gap-2">
                <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />{submitError}
              </p>
            )}

            <div className="space-y-5">
              <Field
                id="fullName"
                label="Your Name"
                value={form.fullName}
                onChange={(v) => set('fullName', v)}
                error={errors.fullName}
                placeholder="Your full name"
                icon={<User size={13} />}
                valid={form.fullName.trim().length > 1}
              />

              <Field
                id="email"
                label="Email"
                type="email"
                value={form.email}
                onChange={(v) => set('email', v)}
                error={errors.email}
                placeholder="yourname@gmail.com"
                icon={<Mail size={13} />}
                valid={EMAIL_PATTERN.test(form.email.trim())}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 inline-flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: '#0066FF', color: '#fff' }}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>Apply to Drive<ChevronRight size={16} /></>
              )}
            </button>

            <div
              className="mt-6 flex items-start gap-3 p-4 rounded-xl border"
              style={{ background: 'hsl(217 100% 50% / 0.06)', borderColor: 'hsl(217 100% 50% / 0.2)' }}
            >
              <Smartphone size={15} className="text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">The rest happens in the app.</strong> Vehicle, license, insurance,
                document photos and the background check are all completed in the Pickup Runner driver app.
              </p>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}
