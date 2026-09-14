
import { useState } from 'react'
import toast from 'react-hot-toast'
import { AlertCircle, Check, Clock, Loader2, X } from 'lucide-react'
import { accreditationsApi, type AccreditationProfile, type BackgroundStatus, type DriverDocumentType, type ReviewStatus } from '../../../lib/api'
import { MissingImage, SignedImage, useAdmin } from '../ui'

type DocKey = keyof AccreditationProfile['documents']

export function DocumentTile({ userId, type, docKey, label, documents, version }: {
  userId: string
  type: DriverDocumentType
  docKey: DocKey
  label: string
  documents?: AccreditationProfile['documents']
  version: number
}) {
  const { token } = useAdmin()

  return documents?.[docKey] ? (
    <SignedImage
      label={label}
      load={() => accreditationsApi.document(token, userId, type)}
      deps={[token, userId, type, version]}
    />
  ) : (
    <MissingImage label={label} />
  )
}

type Choice<T extends string> = { value: T; label: string; color: string; icon: React.ReactNode }

export function ItemReview<T extends string>({ item, value, choices, rejectValue, blocked, onDecide }: {
  item: string
  value: T
  choices: Choice<T>[]
  rejectValue: T
  blocked?: Partial<Record<T, string>>
  onDecide: (next: T, reason?: string) => Promise<void>
}) {
  const [busy, setBusy] = useState<T | null>(null)
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  const decide = async (next: T, why?: string) => {
    setBusy(next)
    setError('')
    try {
      await onDecide(next, why)
      setRejecting(false)
      setReason('')
      const label = choices.find((c) => c.value === next)?.label.toLowerCase()
      const done = next === rejectValue ? 'rejected' : label === 'approve' ? 'approved' : `set to ${label}`
      toast.success(`${item.charAt(0).toUpperCase() + item.slice(1)} ${done}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'That did not go through.'
      setError(message)
      toast.error(message)
    } finally {
      setBusy(null)
    }
  }

  const notes = [...new Set(Object.values(blocked ?? {}).filter(Boolean) as string[])]

  return (
    <div className="mt-5">
      <p className="text-[11px] font-semibold text-muted-foreground mb-2">Your decision on the {item}</p>

      <div
        role="radiogroup"
        aria-label={`${item} decision`}
        className="inline-flex flex-wrap gap-1 rounded-lg p-1"
        style={{ background: 'hsl(0 0% 100% / 0.05)' }}
      >
        {choices.map((choice) => {
          const current = value === choice.value
          const why = blocked?.[choice.value]
          return (
            <button
              key={choice.value}
              type="button"
              role="radio"
              aria-checked={current}
              disabled={busy !== null || Boolean(why) || (current && choice.value !== rejectValue)}
              title={why || (current ? `Currently ${choice.label.toLowerCase()}` : undefined)}
              onClick={() => {
                if (choice.value === rejectValue) {
                  setRejecting(true)
                  setError('')
                } else {
                  decide(choice.value)
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed"
              style={
                current
                  ? { background: choice.color, color: choice.value === rejectValue ? '#fff' : '#04120A' }
                  : { color: why ? 'hsl(var(--muted-foreground) / 0.5)' : choice.color }
              }
            >
              {busy === choice.value ? <Loader2 size={12} className="animate-spin" /> : choice.icon}
              {choice.label}
            </button>
          )
        })}
      </div>

      {rejecting && (
        <div className="mt-3 space-y-2">
          <label htmlFor={`reject-${item}`} className="block text-xs font-semibold text-muted-foreground">
            Why is the {item} rejected? The driver sees this.
          </label>
          <textarea
            id={`reject-${item}`}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={2}
            autoFocus
            placeholder={`e.g. The ${item} photo is blurry — upload a clearer one.`}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => decide(rejectValue, reason.trim())}
              disabled={!reason.trim() || busy !== null}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: '#EF4444', color: '#fff' }}
            >
              {busy === rejectValue ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
              Reject {item}
            </button>
            <button
              type="button"
              onClick={() => { setRejecting(false); setReason(''); setError('') }}
              disabled={busy !== null}
              className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {notes.map((note) => (
        <p key={note} className="mt-2 text-[11px] text-muted-foreground flex items-start gap-1.5">
          <AlertCircle size={11} className="flex-shrink-0 mt-0.5" />{note}
        </p>
      ))}

      {error && (
        <p className="mt-2 text-xs text-destructive flex items-start gap-1.5">
          <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />{error}
        </p>
      )}
    </div>
  )
}

export const REVIEW_CHOICES: Choice<ReviewStatus>[] = [
  { value: 'approved', label: 'Approve', color: '#22C55E', icon: <Check size={12} /> },
  { value: 'pending', label: 'Pending', color: '#F5C400', icon: <Clock size={12} /> },
  { value: 'rejected', label: 'Reject', color: '#EF4444', icon: <X size={12} /> },
]

export const BACKGROUND_CHOICES: Choice<BackgroundStatus>[] = [
  { value: 'approved', label: 'Approve', color: '#22C55E', icon: <Check size={12} /> },
  { value: 'in_review', label: 'In review', color: '#F5C400', icon: <Clock size={12} /> },
  { value: 'rejected', label: 'Reject', color: '#EF4444', icon: <X size={12} /> },
]

export function licencePhotoGap(
  documents: { licenseFront?: boolean; licenseBack?: boolean } | null | undefined,
  alreadyApproved: boolean,
) {
  const gone = [!documents?.licenseFront && 'front', !documents?.licenseBack && 'back'].filter(Boolean)
  if (gone.length === 0) return undefined
  if (alreadyApproved) {
    return `Approved without the ${gone.join(' and ')} of the licence — set it to Pending or Reject and ask the driver to upload it.`
  }
  return gone.length === 2
    ? 'No licence photos uploaded — nothing to approve yet.'
    : `The ${gone[0]} of the licence isn't uploaded — both sides are needed to approve it.`
}
