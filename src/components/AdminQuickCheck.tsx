import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import toast from 'react-hot-toast'
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  Loader2,
  RefreshCw,
  X,
  XCircle,
} from 'lucide-react'

import {
  accreditationsApi,
  driverReviewApi,
  type AccreditationDetail,
  type DriverDocumentType,
} from '../lib/api'
import { day, MissingImage, SignedImage, useAdminData } from './AdminUi'

// ── The approve rule, shared by the list card and the quick check ───────────

/** The photos an approval needs, as the server names them in `missing`. */
export const PHOTO_ITEMS = ['front of licence', 'back of licence', 'insurance card']

/**
 * What still stops "Approve driver", in the server's words. Before the driver
 * submits, everything must be filled in; after, the server has already checked
 * the details, so only the photos can still be missing (e.g. an application
 * submitted before the back of the licence was required). Empty = can approve.
 */
export function approveBlockers(application: { submittedAt?: string | null; missing?: string[] | null }) {
  const missing = application.missing ?? []
  return application.submittedAt ? missing.filter((item) => PHOTO_ITEMS.includes(item)) : missing
}

// ── Dates ───────────────────────────────────────────────────────────────────

/** Drivers younger than this get a warning. */
const MIN_DRIVER_AGE = 18

const todayIso = () => {
  const now = new Date()
  return [now.getFullYear(), now.getMonth() + 1, now.getDate()]
    .map((part, index) => String(part).padStart(index ? 2 : 4, '0'))
    .join('-')
}

/** A calendar date ("2028-09-01") that is already behind us. */
export const isPast = (date?: string | null) => !!date && date.slice(0, 10) < todayIso()

export const ageFrom = (dateOfBirth?: string | null) => {
  if (!dateOfBirth) return null
  const [year, month, dayOfMonth] = dateOfBirth.slice(0, 10).split('-').map(Number)
  if (!year || !month || !dayOfMonth) return null
  const now = new Date()
  const hadBirthday =
    now.getMonth() + 1 > month || (now.getMonth() + 1 === month && now.getDate() >= dayOfMonth)
  return now.getFullYear() - year - (hadBirthday ? 0 : 1)
}

// ── Pieces ──────────────────────────────────────────────────────────────────

const PHOTOS: { type: DriverDocumentType; key: keyof AccreditationDetail['documents']; label: string }[] = [
  { type: 'license_front', key: 'licenseFront', label: 'Licence — front' },
  { type: 'license_back', key: 'licenseBack', label: 'Licence — back' },
  { type: 'insurance_card', key: 'insuranceCard', label: 'Insurance card' },
]

type Mark = 'ok' | 'bad' | undefined

const DIALOG_BACKGROUND = 'hsl(237 40% 8%)'

/** One box of the check: what it is, what the driver gave, and a ✓ or ✗. */
function CheckRow({ label, value, sub, mark }: {
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  mark?: Mark
}) {
  return (
    <div className="flex items-start gap-2 px-3.5 py-2.5" style={{ background: DIALOG_BACKGROUND }}>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground break-words">{value || '—'}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
      {mark === 'ok' && <CheckCircle2 size={18} className="flex-shrink-0" style={{ color: '#22C55E' }} aria-label="Looks fine" />}
      {mark === 'bad' && <XCircle size={18} className="flex-shrink-0" style={{ color: '#EF4444' }} aria-label="Problem" />}
    </div>
  )
}

const join = (parts: (string | number | null | undefined)[], separator = ' · ') =>
  parts.filter((part) => part !== null && part !== undefined && part !== '').join(separator)

// ── The popup ───────────────────────────────────────────────────────────────

/**
 * "Quick check" — opened by Approve driver on the applications list. Shows the
 * three photos and the handful of details they should match, flags anything
 * wrong in plain words, and approves (or rejects) from there, so an admin can
 * get through a queue without opening every full application.
 */
export function QuickCheck({ userId, token, hasNext, onClose, onDone }: {
  userId: string
  token: string
  /** Whether there's another driver waiting after this one ("Approve & next"). */
  hasNext: boolean
  onClose: () => void
  /** Called after a decision went through; `next` = move on to the next driver. */
  onDone: (next: boolean) => void
}) {
  const { data, loading, error, reload } = useAdminData(
    () => accreditationsApi.get(token, userId),
    [token, userId],
  )

  const [busy, setBusy] = useState<'approve' | 'next' | 'reject' | null>(null)
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')
  const [actionError, setActionError] = useState('')
  const closeRef = useRef<HTMLButtonElement>(null)

  // Esc closes — unless a photo is open full-size on top (Esc closes that), or
  // a decision is being saved.
  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || busy) return
      if (document.querySelectorAll('[role="dialog"][aria-modal="true"]').length > 1) return
      onClose()
    }
    window.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [busy, onClose])

  const name = data?.legalName || data?.user?.displayName || data?.user?.email || 'this driver'
  const blockers = data ? approveBlockers(data) : []
  const age = ageFrom(data?.dateOfBirth)
  const licenceExpired = isPast(data?.licenseExpirationDate)
  const insuranceExpired = isPast(data?.insuranceExpirationDate)
  const tooYoung = age !== null && age < MIN_DRIVER_AGE

  const problems = [
    blockers.length > 0 && `Still missing: ${blockers.join(', ')} — you can't approve until it's added.`,
    licenceExpired && `The driver's licence expired on ${day(data?.licenseExpirationDate)}.`,
    insuranceExpired && `The insurance expired on ${day(data?.insuranceExpirationDate)}.`,
    tooYoung && `The driver is ${age} — under ${MIN_DRIVER_AGE}.`,
  ].filter(Boolean) as string[]

  const approve = async (next: boolean) => {
    setBusy(next ? 'next' : 'approve')
    setActionError('')
    try {
      await driverReviewApi.approve(token, userId)
      toast.success(`${name} approved — they can take orders now`)
      onDone(next)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'That did not go through.'
      setActionError(message)
      toast.error(message)
      setBusy(null)
    }
  }

  const reject = async () => {
    setBusy('reject')
    setActionError('')
    try {
      await driverReviewApi.reject(token, userId, reason.trim())
      toast.success(`${name}'s application was rejected — they'll see your reason`)
      onDone(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'That did not go through.'
      setActionError(message)
      toast.error(message)
      setBusy(null)
    }
  }

  const close = () => { if (!busy) onClose() }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-check-title"
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/70 sm:p-4"
      onClick={close}
    >
      <div
        className="w-full sm:max-w-3xl max-h-[92vh] flex flex-col rounded-t-2xl sm:rounded-2xl border border-border shadow-2xl"
        style={{ background: DIALOG_BACKGROUND }}
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-4 sm:px-6 pt-5 pb-4 border-b border-border">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Quick check</p>
            <h2 id="quick-check-title" className="text-lg font-bold text-foreground truncate">
              {data ? `Approve ${name}?` : 'Loading…'}
            </h2>
            {data?.user && (
              <p className="text-xs text-muted-foreground truncate">
                {join([data.user.email, data.user.phone])}
              </p>
            )}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Close"
            className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          {loading && !data ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={22} className="animate-spin text-muted-foreground" />
            </div>
          ) : error && !data ? (
            <div className="py-12 text-center space-y-3">
              <p className="text-sm text-destructive">{error}</p>
              <button type="button" onClick={reload} className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                <RefreshCw size={12} />Try again
              </button>
            </div>
          ) : data ? (
            <div className="space-y-4">
              {problems.length > 0 ? (
                <div
                  className="rounded-xl px-3.5 py-3 space-y-1.5"
                  style={{ background: 'hsl(0 84% 60% / 0.1)', border: '1px solid hsl(0 84% 60% / 0.4)' }}
                >
                  {problems.map((problem) => (
                    <p key={problem} className="text-sm flex items-start gap-2" style={{ color: '#F87171' }}>
                      <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
                      {problem}
                    </p>
                  ))}
                </div>
              ) : (
                <p
                  className="rounded-xl px-3.5 py-3 text-sm flex items-start gap-2"
                  style={{ background: 'hsl(142 71% 45% / 0.1)', border: '1px solid hsl(142 71% 45% / 0.35)', color: '#4ADE80' }}
                >
                  <CheckCircle2 size={15} className="flex-shrink-0 mt-0.5" />
                  No problems found — check the photos match the details below.
                </p>
              )}

              {!data.submittedAt && blockers.length === 0 && (
                <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
                  The driver hasn't pressed Submit yet, but everything is filled in.
                </p>
              )}

              {/* Photos — the main thing to check. Click one to see it full size. */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {PHOTOS.map(({ type, key, label }) => data.documents?.[key] ? (
                  <SignedImage
                    key={type}
                    label={label}
                    load={() => accreditationsApi.document(token, userId, type)}
                    deps={[token, userId, type]}
                  />
                ) : (
                  <MissingImage key={type} label={label} />
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground -mt-2">Click a photo to see it full size.</p>

              {/* The details the photos should match */}
              <div className="grid sm:grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border">
                <CheckRow
                  label="Name on licence"
                  value={data.legalName}
                  sub={data.dateOfBirth ? `Age ${age ?? '—'} · born ${day(data.dateOfBirth)}` : 'No date of birth'}
                  mark={!data.legalName || !data.dateOfBirth || tooYoung ? 'bad' : 'ok'}
                />
                <CheckRow
                  label="Driver's licence"
                  value={join([data.licenseState, data.licenseNumber])}
                  sub={data.licenseExpirationDate
                    ? `${licenceExpired ? 'Expired' : 'Expires'} ${day(data.licenseExpirationDate)}`
                    : 'No expiry date'}
                  mark={licenceExpired || !data.licenseNumber ? 'bad' : 'ok'}
                />
                <CheckRow
                  label="Insurance"
                  value={join([data.insuranceCompany, data.insurancePolicyNumber && `Policy ${data.insurancePolicyNumber}`])}
                  sub={data.insuranceExpirationDate
                    ? `${insuranceExpired ? 'Expired' : 'Expires'} ${day(data.insuranceExpirationDate)}`
                    : 'No expiry date'}
                  mark={insuranceExpired || !data.insuranceCompany ? 'bad' : 'ok'}
                />
                <CheckRow
                  label="Vehicle"
                  value={join([join([data.vehicleYear, data.vehicleMake, data.vehicleModel], ' '), data.vehicleColor])}
                  sub={data.vehiclePlate ? `Plate ${data.vehiclePlate}` : 'No plate'}
                />
                <CheckRow
                  label="Home address"
                  value={join([data.streetAddress, data.aptSuite], ', ')}
                  sub={join([data.city, join([data.state, data.postalCode], ' ')], ', ')}
                />
                <CheckRow
                  label="Background check"
                  value={data.backgroundConsentAt ? 'Consent given' : 'No consent yet'}
                  sub={data.backgroundConsentAt ? day(data.backgroundConsentAt) : "Can't be approved without it"}
                  mark={data.backgroundConsentAt ? 'ok' : 'bad'}
                />
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer — the decision */}
        <div className="px-4 sm:px-6 py-4 border-t border-border">
          {rejecting ? (
            <div className="space-y-2.5">
              <label htmlFor="quick-check-reason" className="block text-xs font-semibold text-muted-foreground">
                Why is this being rejected? The driver sees this.
              </label>
              <textarea
                id="quick-check-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={2}
                autoFocus
                placeholder="e.g. The back of your licence is blurry — upload a clearer photo and submit again."
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={reject}
                  disabled={!reason.trim() || busy !== null}
                  className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: '#EF4444', color: '#fff' }}
                >
                  {busy === 'reject' ? <Loader2 size={15} className="animate-spin" /> : <X size={15} />}
                  Confirm rejection
                </button>
                <button
                  type="button"
                  onClick={() => { setRejecting(false); setReason(''); setActionError('') }}
                  disabled={busy !== null}
                  className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  Back
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => approve(false)}
                disabled={!data || blockers.length > 0 || busy !== null}
                title={blockers.length ? `Still missing: ${blockers.join(', ')}` : undefined}
                className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: '#22C55E', color: '#04120A' }}
              >
                {busy === 'approve' ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                Yes, approve
              </button>

              {hasNext && (
                <button
                  type="button"
                  onClick={() => approve(true)}
                  disabled={!data || blockers.length > 0 || busy !== null}
                  title="Approve, then open the next driver waiting"
                  className="inline-flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ borderColor: 'hsl(142 71% 45% / 0.6)', color: '#22C55E' }}
                >
                  {busy === 'next' ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                  Approve &amp; next
                  <ArrowRight size={15} />
                </button>
              )}

              <button
                type="button"
                onClick={() => setRejecting(true)}
                disabled={!data || busy !== null}
                className="inline-flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ borderColor: 'hsl(0 84% 60% / 0.5)', color: '#EF4444' }}
              >
                <X size={15} />
                Reject
              </button>

              <Link
                to="/admin/applications/$userId"
                params={{ userId }}
                className="sm:ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10"
              >
                <Eye size={15} />
                Open full application
              </Link>
            </div>
          )}

          {actionError && (
            <p className="mt-3 text-xs text-destructive flex items-start gap-1.5">
              <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
              {actionError}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
