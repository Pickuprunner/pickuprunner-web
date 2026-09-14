
import { useState } from 'react'
import { AlertCircle, CheckCircle2, ChevronRight, Mail, Smartphone, User } from 'lucide-react'

import { TextField } from '../../components/forms/TextField'
import { StoreButtons } from '../../components/StoreButtons'
import { applicationsApi } from '../../lib/api'
import { APP_STORE_URL, PLAY_STORE_URL } from '../../lib/appStores'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface DriverForm {
  fullName: string
  email: string
}

const EMPTY: DriverForm = { fullName: '', email: '' }

type Errors = Partial<Record<keyof DriverForm, string>>

export function ApplicationForm() {
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

    const email = form.email.trim()

    try {
      await applicationsApi.invite({ name, email })

      setApplicantName(name.split(/\s+/)[0])
      setApplicantEmail(email)
      setSubmitted(true)
    } catch (err) {
      console.error(err)
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'We could not email you the app links. Please check the address and try again.',
      )
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
            Thanks, <strong className="text-foreground">{applicantName}</strong>! Check your inbox.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            We have emailed <strong className="text-foreground">{applicantEmail}</strong> the links to the driver app,
            where you'll finish your profile — phone number, vehicle, license, insurance and the background check.
          </p>
          <p className="text-sm font-semibold text-foreground mb-3">Or get the app straight away:</p>
          <StoreButtons className="justify-center mb-8" />
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
      <TextField
        id="fullName"
        label="Your Name"
        value={form.fullName}
        onChange={(v) => set('fullName', v)}
        error={errors.fullName}
        placeholder="Your full name"
        icon={<User size={13} />}
        valid={form.fullName.trim().length > 1}
      />

      <TextField
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
        document photos and the background check are all completed in the Pickup Runner driver app — get it on the{' '}
        <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">App Store</a>
        {' '}or{' '}
        <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Google Play</a>.
      </p>
    </div>
  </form>
  )
}
