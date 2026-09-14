
import { useState } from 'react'
import { AlertCircle, CheckCircle2, Loader2, Mail, Send, User } from 'lucide-react'

import { TextField } from '../../components/forms/TextField'
import { BLUE, SUPPORT_EMAIL } from '../../lib/brand'
import { contactApi } from '../../lib/api'
import { SUBJECTS } from './content'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_MESSAGE = 5000



interface EnquiryForm {
  name: string
  email: string
  subject: string
  message: string
}

const EMPTY: EnquiryForm = { name: '', email: '', subject: SUBJECTS[0], message: '' }

type Errors = Partial<Record<keyof EnquiryForm, string>>

function mailtoLink(form: EnquiryForm) {
  const body = [
    form.message,
    '',
    '\u2014',
    `From: ${form.name}`,
    `Email: ${form.email}`,
  ].join('\r\n')

  return (
    `mailto:${SUPPORT_EMAIL}` +
    `?subject=${encodeURIComponent(form.subject)}` +
    `&body=${encodeURIComponent(body)}`
  )
}

export function EnquiryForm() {
  const [form, setForm] = useState<EnquiryForm>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [failure, setFailure] = useState('')

  const set = <K extends keyof EnquiryForm>(key: K, value: EnquiryForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (sending) return

    const e: Errors = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!EMAIL_PATTERN.test(form.email.trim())) e.email = 'Enter a valid email address'
    if (form.message.trim().length < 10) e.message = 'Tell us a little more so we can help'
    if (form.message.trim().length > MAX_MESSAGE) e.message = `That is too long — keep it under ${MAX_MESSAGE.toLocaleString()} characters`

    if (Object.keys(e).length) { setErrors(e); return }

    setSending(true)
    setFailure('')

    try {
      await contactApi.send({
        name: form.name.trim(),
        email: form.email.trim(),
        topic: form.subject,
        message: form.message.trim(),
      })
      setSent(true)
    } catch (error) {
      setFailure(error instanceof Error ? error.message : 'Something went wrong sending that.')
    } finally {
      setSending(false)
    }
  }

  return sent ? (
    <div
      className="rounded-3xl border p-8 text-center"
      style={{ background: 'hsl(237 40% 6%)', borderColor: 'hsl(217 100% 50% / 0.25)' }}
    >
      <CheckCircle2 size={40} className="mx-auto mb-4" style={{ color: '#22C55E' }} />
      <h3 className="text-xl font-bold text-foreground mb-2">Thanks — your enquiry is on its way</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-6">
        We have it, and we will come back to you at{' '}
        <span className="text-foreground">{form.email.trim()}</span>. It is usually the same day. You can also
        email{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">{SUPPORT_EMAIL}</a>{' '}
        directly.
      </p>
      <button
        onClick={() => { setSent(false); setFailure(''); setForm(EMPTY) }}
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
        <TextField
          id="name"
          label="Your Name"
          value={form.name}
          onChange={(v) => set('name', v)}
          error={errors.name}
          placeholder="Jane Smith"
          icon={<User size={13} />}
        />

        <TextField
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

      {failure && (
        <div
          className="mt-6 rounded-xl px-4 py-3 text-sm"
          style={{ background: 'hsl(0 84% 60% / 0.1)', border: '1px solid hsl(0 84% 60% / 0.4)' }}
        >
          <p className="flex items-start gap-2" style={{ color: '#F87171' }}>
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
            {failure}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Nothing is lost — try again, or{' '}
            <a href={mailtoLink(form)} className="text-primary hover:underline">
              send it from your own email
            </a>
            .
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={sending}
        className="w-full mt-7 inline-flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:hover:scale-100"
        style={{ background: BLUE, color: '#fff', boxShadow: '0 8px 24px -6px hsl(217 100% 50% / 0.55)' }}
      >
        {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        {sending ? 'Sending…' : 'Send Enquiry'}
      </button>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Goes straight to the team — no mail app needed.
      </p>
    </form>
  )
}
